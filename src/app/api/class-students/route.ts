import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase-server";
import { TablesInsert } from "@/types/supabase";

export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminSupabaseClient();
    const { searchParams } = new URL(request.url);
    const classId = searchParams.get("class_id");
    const studentId = searchParams.get("student_id");

    // 1. class_students 조회
    let query = supabase
      .from("relations_classes_students")
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

    // 2. 모든 class_id와 student_id 조합 수집
    const classStudentPairs = classStudents?.map(cs => ({
      class_id: cs.class_id,
      student_id: cs.student_id
    })) || [];

    // 3. compositions_students 별도 조회
    let compositionsQuery = supabase
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

    // classId 필터가 있으면 해당 수업의 compositions만 조회
    if (classId) {
      compositionsQuery = compositionsQuery.eq("class_id", classId);
    }

    const { data: studentCompositions, error: compositionsError } = await compositionsQuery;

    if (compositionsError) {
      console.error("Student compositions fetch error:", compositionsError);
    }

    // 4. compositions_students를 class_students에 매핑
    const enrichedClassStudents = classStudents?.map(cs => ({
      ...cs,
      student_compositions: studentCompositions?.filter(
        sc => sc.class_id === cs.class_id && sc.student_id === cs.student_id
      ) || [],
      // composition_id 필드 추가 (첫 번째 composition의 ID, 없으면 null)
      composition_id: studentCompositions?.find(
        sc => sc.class_id === cs.class_id && sc.student_id === cs.student_id
      )?.composition_id || null,
    }));

    return NextResponse.json({ data: enrichedClassStudents });
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

    // 입력 데이터 검증
    const classStudentData: TablesInsert<"relations_classes_students"> = {
      class_id: body.class_id,
      student_id: body.student_id,
      enrolled_date: body.enrolled_date || new Date().toISOString().split('T')[0],
      status: body.status || "active",
    };

    // 중복 등록 체크 - class_students에 이미 active 상태로 등록되어 있는지 확인
    const { data: existingClassStudent } = await supabase
      .from("relations_classes_students")
      .select("id")
      .eq("class_id", body.class_id)
      .eq("student_id", body.student_id)
      .eq("status", "active")
      .maybeSingle();

    let classStudentId: string;

    if (existingClassStudent) {
      // 이미 class_students에 등록되어 있으면 해당 ID 사용
      classStudentId = existingClassStudent.id;
      console.log(`Student already enrolled in class_students with id: ${classStudentId}`);
    } else {
      // 등록되어 있지 않으면 새로 생성
      const { data: newClassStudent, error: classStudentError } = await supabase
        .from("relations_classes_students")
        .insert([classStudentData])
        .select("id")
        .single();

      if (classStudentError) {
        console.error("Class student creation error:", classStudentError);

        // Handle database constraint violations with user-friendly messages
        if (classStudentError.code === '23505') {
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

      classStudentId = newClassStudent!.id;
      console.log(`Created new class_student with id: ${classStudentId}`);
    }

    // composition_id가 제공된 경우 compositions_students에 등록
    if (body.composition_id) {
      // 이미 해당 composition에 등록되어 있는지 확인
      const { data: existingComposition } = await supabase
        .from("relations_compositions_students")
        .select("id")
        .eq("class_id", body.class_id)
        .eq("student_id", body.student_id)
        .eq("composition_id", body.composition_id)
        .eq("status", "active")
        .maybeSingle();

      if (!existingComposition) {
        // compositions_students에 등록
        const { error: compositionError } = await supabase
          .from("relations_compositions_students")
          .insert([{
            class_id: body.class_id,
            student_id: body.student_id,
            composition_id: body.composition_id,
            enrolled_date: body.enrolled_date || new Date().toISOString().split('T')[0],
            status: "active",
          }]);

        if (compositionError) {
          console.error("Student composition creation error:", compositionError);
          // composition 등록 실패 시 에러는 로깅하지만 계속 진행
        } else {
          console.log(`Created composition enrollment for composition: ${body.composition_id}`);
        }
      } else {
        console.log(`Student already enrolled in composition: ${body.composition_id}`);
      }
    }

    // 최종 데이터 조회 (모든 관계 포함)
    const { data: finalClassStudent, error: fetchError } = await supabase
      .from("relations_classes_students")
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
      .eq("id", classStudentId)
      .single();

    if (fetchError) {
      console.error("Failed to fetch created class student:", fetchError);
      return NextResponse.json(
        { error: "Student enrolled but failed to fetch data" },
        { status: 500 }
      );
    }

    // compositions_students 조회
    const { data: compositions } = await supabase
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
      .eq("class_id", body.class_id)
      .eq("student_id", body.student_id)
      .eq("status", "active");

    // finalClassStudent에 student_compositions 추가
    const enrichedClassStudent = {
      ...finalClassStudent,
      student_compositions: compositions || [],
      composition_id: compositions?.[0]?.composition_id || null,
    };

    return NextResponse.json({ data: enrichedClassStudent }, { status: 201 });
  } catch (error) {
    console.error("Class student creation API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}