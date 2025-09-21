import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase-server";
import { TablesInsert } from "@/types/supabase";

// GET /api/middle-records - 중등 기록 목록 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const teacherId = searchParams.get("teacher_id");
    const classId = searchParams.get("class_id");
    const studentId = searchParams.get("student_id");
    const weekOf = searchParams.get("week_of");

    const supabase = createAdminSupabaseClient();

    let query = supabase
      .from("homework_records_middle")
      .select(`
        *,
        student:students(
          id,
          name,
          grade,
          phone,
          parent_phone,
          email
        ),
        teacher:teachers(
          id,
          name,
          subjects
        ),
        class:classes(
          id,
          title,
          subject,
          teacher_name
        )
      `)
      .order("created_date", { ascending: false });

    // 필터 적용
    if (teacherId) {
      query = query.eq("teacher_id", teacherId);
    }
    if (classId) {
      query = query.eq("class_id", classId);
    }
    if (studentId) {
      query = query.eq("student_id", studentId);
    }
    if (weekOf) {
      query = query.eq("week_of", weekOf);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching middle school records:", error);
      return NextResponse.json(
        { error: "중등 기록을 불러오는 중 오류가 발생했습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "예상치 못한 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

// POST /api/middle-records - 새 중등 기록 생성
export async function POST(request: NextRequest) {
  try {
    const body: TablesInsert<"homework_records_middle"> = await request.json();

    // 필수 필드 검증
    if (!body.student_id || !body.teacher_id || !body.class_id || !body.week_of) {
      return NextResponse.json(
        { error: "필수 필드가 누락되었습니다." },
        { status: 400 }
      );
    }

    const supabase = createAdminSupabaseClient();

    // 중복 기록 체크 (같은 학생, 같은 주차, 같은 수업)
    const { data: existingRecord } = await supabase
      .from("homework_records_middle")
      .select("id")
      .eq("student_id", body.student_id)
      .eq("teacher_id", body.teacher_id)
      .eq("class_id", body.class_id)
      .eq("week_of", body.week_of)
      .single();

    if (existingRecord) {
      return NextResponse.json(
        { error: "해당 학생의 주간 기록이 이미 존재합니다." },
        { status: 409 }
      );
    }

    const { data, error } = await supabase
      .from("homework_records_middle")
      .insert(body)
      .select(`
        *,
        student:students(
          id,
          name,
          grade,
          phone,
          parent_phone,
          email
        ),
        teacher:teachers(
          id,
          name,
          subjects
        ),
        class:classes(
          id,
          title,
          subject,
          teacher_name
        )
      `)
      .single();

    if (error) {
      console.error("Error creating middle school record:", error);
      return NextResponse.json(
        { error: "중등 기록 생성 중 오류가 발생했습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "예상치 못한 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}