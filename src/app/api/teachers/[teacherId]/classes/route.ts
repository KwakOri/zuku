import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase-server";

// GET: 특정 강사의 담당 수업 목록 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ teacherId: string }> }
) {
  try {
    const { teacherId } = await params;
    console.log("API called for teacher:", teacherId);

    const supabase = createAdminSupabaseClient();

    // 강사가 담당하는 수업 목록 조회 (학생 수 및 과목 정보 포함)
    const { data: classes, error } = await supabase
      .from("classes")
      .select(`
        *,
        subject:subjects(id, subject_name),
        class_students!inner(
          student_id,
          status,
          students(
            id,
            name,
            grade
          )
        )
      `)
      .eq("teacher_id", teacherId)
      .eq("class_students.status", "active")
      .order("day_of_week", { ascending: true })
      .order("start_time", { ascending: true });

    if (error) {
      console.error("Classes fetch error:", error);
      throw error;
    }

    // 수업별로 학생 정보를 정리
    const classesWithStudents = classes?.map(classItem => {
      const students = classItem.class_students?.map(cs => cs.students).filter(Boolean) || [];

      return {
        ...classItem,
        class_students: undefined, // 중복 제거
        students,
        student_count: students.length
      };
    }) || [];

    return NextResponse.json({ data: classesWithStudents });
  } catch (error) {
    console.error("Error fetching teacher classes:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to fetch teacher classes";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}