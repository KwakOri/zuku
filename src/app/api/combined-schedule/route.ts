import { NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase-server";

export async function GET() {
  try {
    const supabase = createAdminSupabaseClient();

    // 1. 학생 데이터와 개인 일정, 수업 정보를 join해서 가져오기
    const { data: students, error: studentsError } = await supabase
      .from("students")
      .select(`
        *,
        school:schools(
          id,
          name,
          level
        ),
        student_schedules!student_schedules_student_id_fkey(
          id,
          title,
          description,
          start_time,
          end_time,
          day_of_week,
          type,
          color,
          location,
          recurring,
          status
        ),
        class_students!class_students_student_id_fkey(
          id,
          class_id,
          enrolled_date,
          status,
          class:classes(
            id,
            title,
            color,
            split_type,
            subject:subjects(
              id,
              subject_name
            ),
            teacher:teachers(
              id,
              name
            )
          )
        )
      `)
      .eq("is_active", true)
      .eq("student_schedules.status", "active")
      .eq("class_students.status", "active")
      .order("grade", { ascending: true })
      .order("name", { ascending: true });

    if (studentsError) {
      console.error("Combined schedule fetch error:", studentsError);
      return NextResponse.json(
        { error: "Failed to fetch combined schedule data" },
        { status: 500 }
      );
    }

    // 2. 모든 class_student_id 수집
    const classStudentIds = students?.flatMap(student =>
      student.class_students.map((cs: any) => cs.id)
    ) || [];

    // 3. student_compositions 별도로 조회
    const { data: studentCompositions, error: compositionsError } = await supabase
      .from("student_compositions")
      .select(`
        id,
        class_student_id,
        composition_id,
        enrolled_date,
        status,
        composition:class_composition(
          id,
          class_id,
          day_of_week,
          start_time,
          end_time,
          type
        )
      `)
      .in("class_student_id", classStudentIds)
      .eq("status", "active");

    if (compositionsError) {
      console.error("Student compositions fetch error:", compositionsError);
    }

    // 4. student_compositions를 class_students에 매핑
    const enrichedStudents = students?.map(student => ({
      ...student,
      class_students: student.class_students.map((cs: any) => ({
        ...cs,
        student_compositions: studentCompositions?.filter(
          sc => sc.class_student_id === cs.id
        ) || []
      }))
    }));

    return NextResponse.json({ data: enrichedStudents });
  } catch (error) {
    console.error("Combined schedule API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
