import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase-server";
import { TablesInsert } from "@/types/supabase";

// GET /api/student-schedules - 학생 개인 일정 목록 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get("student_id");

    const supabase = createAdminSupabaseClient();

    let query = supabase
      .from("student_schedules")
      .select(`
        *,
        student:students(
          id,
          name,
          grade
        )
      `)
      .order("created_date", { ascending: false });

    // 특정 학생의 일정만 조회하는 경우
    if (studentId) {
      query = query.eq("student_id", studentId);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching student schedules:", error);
      return NextResponse.json(
        { error: "학생 개인 일정을 불러오는 중 오류가 발생했습니다." },
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

// POST /api/student-schedules - 새 학생 개인 일정 생성
export async function POST(request: NextRequest) {
  try {
    const body: TablesInsert<"student_schedules"> = await request.json();

    // 필수 필드 검증
    if (!body.student_id || !body.title || !body.start_time || !body.end_time || body.day_of_week === undefined) {
      return NextResponse.json(
        { error: "필수 필드가 누락되었습니다." },
        { status: 400 }
      );
    }

    const supabase = createAdminSupabaseClient();

    const { data, error } = await supabase
      .from("student_schedules")
      .insert(body)
      .select(`
        *,
        student:students(
          id,
          name,
          grade
        )
      `)
      .single();

    if (error) {
      console.error("Error creating student schedule:", error);
      return NextResponse.json(
        { error: "학생 개인 일정 생성 중 오류가 발생했습니다." },
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