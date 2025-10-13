import { createAdminSupabaseClient } from "@/lib/supabase-server";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET: 학생의 전체 시간표 조회 (개인 일정 + 수업 일정)
 *
 * 새로운 데이터 구조:
 * students → class_students → student_compositions → class_composition
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: studentId } = await params;
    const supabase = createAdminSupabaseClient();

    // 1. 개인 일정 조회 (student_schedules)
    const { data: personalSchedules, error: personalError } = await supabase
      .from("student_schedules")
      .select("*")
      .eq("student_id", studentId)
      .eq("status", "active");

    if (personalError) {
      console.error("Personal schedules fetch error:", personalError);
      throw personalError;
    }

    // 2. 수업 일정 조회 (class_students → student_compositions → class_composition)
    const { data: classSchedules, error: classError } = await supabase
      .from("class_students")
      .select(`
        id,
        enrolled_date,
        class:classes (
          id,
          title,
          color,
          room,
          description,
          subject:subjects (
            id,
            subject_name
          ),
          teacher:teachers (
            id,
            name
          )
        )
      `)
      .eq("student_id", studentId)
      .eq("status", "active");

    if (classError) {
      console.error("Class schedules fetch error:", classError);
      throw classError;
    }

    // 3. 각 class_student에 대한 compositions 조회
    const classSchedulesWithCompositions = await Promise.all(
      (classSchedules || []).map(async (classStudent) => {
        const { data: compositions, error: compError } = await supabase
          .from("student_compositions")
          .select(`
            id,
            enrolled_date,
            composition:class_composition (
              id,
              day_of_week,
              start_time,
              end_time,
              type
            )
          `)
          .eq("class_student_id", classStudent.id)
          .eq("status", "active");

        if (compError) {
          console.error("Compositions fetch error:", compError);
          return { ...classStudent, compositions: [] };
        }

        return {
          ...classStudent,
          compositions: compositions || [],
        };
      })
    );

    // 4. 수업 일정을 시간표 형식으로 변환
    const formattedClassSchedules = classSchedulesWithCompositions.flatMap((classStudent) => {
      return classStudent.compositions.map((comp: any) => ({
        id: comp.id,
        student_id: studentId,
        title: classStudent.class?.title || "",
        description: classStudent.class?.description || null,
        start_time: comp.composition?.start_time || "",
        end_time: comp.composition?.end_time || "",
        day_of_week: comp.composition?.day_of_week || 0,
        type: "class", // 수업 일정
        color: classStudent.class?.color || "#3b82f6",
        location: classStudent.class?.room || null,
        recurring: true,
        status: "active",
        created_date: classStudent.enrolled_date,
        // 추가 정보
        class_id: classStudent.class?.id,
        class_student_id: classStudent.id,
        composition_id: comp.composition?.id,
        composition_type: comp.composition?.type, // "class" or "clinic"
        subject_name: classStudent.class?.subject?.subject_name || null,
        teacher_name: classStudent.class?.teacher?.name || null,
      }));
    });

    // 5. 개인 일정과 수업 일정 합치기
    const allSchedules = [
      ...(personalSchedules || []),
      ...formattedClassSchedules,
    ];

    // 6. 요일, 시작 시간 순으로 정렬
    allSchedules.sort((a, b) => {
      if (a.day_of_week !== b.day_of_week) {
        return a.day_of_week - b.day_of_week;
      }
      return a.start_time.localeCompare(b.start_time);
    });

    return NextResponse.json({
      data: {
        personal: personalSchedules || [],
        class: formattedClassSchedules,
        all: allSchedules,
      },
    });
  } catch (error) {
    console.error("Error fetching full student schedule:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to fetch full student schedule";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
