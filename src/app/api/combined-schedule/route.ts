import { NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase-server";
import { Tables } from "@/types/supabase";

// Types for the nested query response
interface ClassStudent extends Pick<Tables<"relations_classes_students">, "id" | "class_id" | "enrolled_date" | "status"> {
  class?: Pick<Tables<"classes">, "id" | "title" | "color" | "split_type"> & {
    subject?: Pick<Tables<"subjects">, "id" | "subject_name"> | null;
    teacher?: Pick<Tables<"teachers">, "id" | "name"> | null;
  } | null;
}

interface CompositionStudent extends Pick<Tables<"relations_compositions_students">, "id" | "class_id" | "student_id" | "composition_id" | "enrolled_date" | "status"> {
  composition?: Pick<Tables<"class_compositions">, "id" | "class_id" | "day_of_week" | "start_time" | "end_time" | "type"> | null;
}

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
        relations_classes_students!relations_classes_students_student_id_fkey(
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
      .eq("relations_classes_students.status", "active")
      .order("grade", { ascending: true })
      .order("name", { ascending: true });

    if (studentsError) {
      console.error("Combined schedule fetch error:", studentsError);
      return NextResponse.json(
        { error: "Failed to fetch combined schedule data" },
        { status: 500 }
      );
    }

    // 2. 모든 student_id와 class_id 쌍 수집
    const studentClassPairs = students?.flatMap(student =>
      student.relations_classes_students.map((cs: ClassStudent) => ({
        student_id: student.id,
        class_id: cs.class_id
      }))
    ) || [];

    // 3. compositions_students 별도로 조회 (새로운 테이블 구조)
    let compositionsStudents: CompositionStudent[] = [];

    if (studentClassPairs.length > 0) {
      const { data, error: compositionsError } = await supabase
        .from("relations_compositions_students")
        .select(`
          id,
          class_id,
          student_id,
          composition_id,
          enrolled_date,
          status,
          composition:class_compositions(
            id,
            class_id,
            day_of_week,
            start_time,
            end_time,
            type
          )
        `)
        .eq("status", "active");

      if (compositionsError) {
        console.error("Student compositions fetch error:", compositionsError);
      } else {
        compositionsStudents = data || [];
      }
    }

    // 4. compositions_students를 relations_classes_students에 매핑
    const enrichedStudents = students?.map(student => ({
      ...student,
      relations_classes_students: student.relations_classes_students.map((cs: ClassStudent) => ({
        ...cs,
        student_compositions: compositionsStudents.filter(
          sc => sc.student_id === student.id && sc.class_id === cs.class_id
        )
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
