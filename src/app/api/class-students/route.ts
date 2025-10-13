import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase-server";
import { TablesInsert } from "@/types/supabase";

export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminSupabaseClient();
    const { searchParams } = new URL(request.url);
    const classId = searchParams.get("class_id");
    const studentId = searchParams.get("student_id");
    
    let query = supabase
      .from("class_students")
      .select(`
        *,
        student:students(
          id,
          name,
          grade,
          phone,
          parent_phone,
          email,
          school:schools(id, name, level)
        ),
        class:classes(id, title, subject:subjects(id, subject_name)),
        composition:class_composition(id, day_of_week, start_time, end_time, type)
      `)
      .eq("status", "active");

    // 특정 수업의 학생들만 조회하는 경우
    if (classId) {
      query = query.eq("class_id", classId);
    }

    // 특정 학생의 수업들만 조회하는 경우
    if (studentId) {
      query = query.eq("student_id", studentId);
    }

    const { data: classStudents, error } = await query.order("enrolled_date", { ascending: false });

    if (error) {
      console.error("Class students fetch error:", error);
      return NextResponse.json(
        { error: "Failed to fetch class students" },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: classStudents });
  } catch (error) {
    console.error("Class students API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const supabase = createAdminSupabaseClient();

    // 입력 데이터 검증 (composition_id 제거됨)
    const classStudentData: TablesInsert<"class_students"> = {
      class_id: body.class_id,
      student_id: body.student_id,
      enrolled_date: body.enrolled_date || new Date().toISOString().split('T')[0],
      status: body.status || "active",
    };

    // 중복 등록 체크
    const { data: existing } = await supabase
      .from("class_students")
      .select("id")
      .eq("class_id", body.class_id)
      .eq("student_id", body.student_id)
      .eq("status", "active")
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { error: "Student is already enrolled in this class" },
        { status: 400 }
      );
    }

    const { data: classStudent, error } = await supabase
      .from("class_students")
      .insert([classStudentData])
      .select(`
        *,
        student:students(
          id,
          name,
          grade,
          phone,
          parent_phone,
          email,
          school:schools(id, name, level)
        ),
        class:classes(id, title, subject:subjects(id, subject_name))
      `)
      .single();

    if (error) {
      console.error("Class student creation error:", error);

      // Handle database constraint violations with user-friendly messages
      if (error.code === '23505') {
        return NextResponse.json(
          { error: "Student is already enrolled in this class" },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { error: "Failed to enroll student in class" },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: classStudent }, { status: 201 });
  } catch (error) {
    console.error("Class student creation API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}