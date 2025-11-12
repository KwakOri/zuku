import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase-server";
import { getWeekStartDate, formatDateToYYYYMMDD } from "@/lib/utils";

/**
 * GET /api/middle-records/pending?week_of=2025-01-13
 * 이번 주 미입력 학생 목록 조회
 *
 * Query Parameters:
 * - week_of: 주차 시작일 YYYY-MM-DD 형식 (선택, 기본값: 이번 주)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const weekOfParam = searchParams.get("week_of");

    // 주차 계산 (파라미터가 없으면 이번 주)
    const weekOf = weekOfParam || formatDateToYYYYMMDD(getWeekStartDate());

    const supabase = createAdminSupabaseClient();

    console.log('[PendingStudents] Request params:', { weekOf });

    // 1. 모든 active 상태의 class_students 조회
    const { data: allClassStudents, error: studentsError } = await supabase
      .from("relations_classes_students")
      .select(`
        id,
        class_id,
        student_id,
        status,
        student:students(
          id,
          name,
          grade,
          phone,
          parent_phone,
          email
        ),
        class:classes(
          id,
          title,
          subject:subjects(id, subject_name)
        )
      `)
      .eq("status", "active");

    console.log('[PendingStudents] All class students count:', allClassStudents?.length || 0);
    if (allClassStudents && allClassStudents.length > 0) {
      console.log('[PendingStudents] Sample class student:', JSON.stringify(allClassStudents[0], null, 2));
    }

    if (studentsError) {
      console.error("[PendingStudents] Error fetching class students:", studentsError);
      return NextResponse.json(
        { error: "학생 목록을 불러오는 중 오류가 발생했습니다." },
        { status: 500 }
      );
    }

    if (!allClassStudents || allClassStudents.length === 0) {
      console.log('[PendingStudents] No class students found');
      // 학생이 없으면 빈 배열 반환
      return NextResponse.json({
        data: [],
        meta: {
          weekOf,
          totalStudents: 0,
          recordedStudents: 0,
          pendingStudents: 0,
        }
      });
    }

    // 2. 중등 학생들만 필터링 (7~9학년)
    const classStudents = allClassStudents.filter((cs) => {
      const grade = cs.student?.grade;
      return grade !== undefined && grade >= 7 && grade <= 9;
    });

    console.log('[PendingStudents] Middle school students count (7-9):', classStudents.length);

    if (classStudents.length === 0) {
      console.log('[PendingStudents] No middle school students found');
      // 중등 학생이 없으면 빈 배열 반환
      return NextResponse.json({
        data: [],
        meta: {
          weekOf,
          totalStudents: 0,
          recordedStudents: 0,
          pendingStudents: 0,
        }
      });
    }

    // 3. 해당 주차에 이미 기록된 학생들 조회
    const classIds = [...new Set(classStudents.map((cs) => cs.class_id))];
    console.log('[PendingStudents] Class IDs to check:', classIds);

    const { data: existingRecords, error: recordsError } = await supabase
      .from("homework_records_middle")
      .select("student_id, class_id")
      .in("class_id", classIds)
      .eq("week_of", weekOf);

    console.log('[PendingStudents] Existing records count:', existingRecords?.length || 0);
    if (existingRecords && existingRecords.length > 0) {
      console.log('[PendingStudents] Sample existing record:', existingRecords[0]);
    }

    if (recordsError) {
      console.error("[PendingStudents] Error fetching existing records:", recordsError);
      return NextResponse.json(
        { error: "기록을 불러오는 중 오류가 발생했습니다." },
        { status: 500 }
      );
    }

    // 4. 기록된 학생 Set 생성 (student_id + class_id 조합)
    const recordedSet = new Set(
      (existingRecords || []).map((r) => `${r.student_id}_${r.class_id}`)
    );

    console.log('[PendingStudents] Recorded student-class pairs:', Array.from(recordedSet));

    // 5. 미입력 학생 필터링
    const pendingStudents = classStudents.filter((cs) => {
      const key = `${cs.student_id}_${cs.class_id}`;
      const isPending = !recordedSet.has(key);
      if (isPending) {
        console.log('[PendingStudents] Pending student found:', {
          name: cs.student?.name,
          key,
        });
      }
      return isPending;
    });

    console.log('[PendingStudents] Final result:', {
      totalStudents: classStudents.length,
      recordedStudents: recordedSet.size,
      pendingStudents: pendingStudents.length,
    });

    return NextResponse.json({
      data: pendingStudents,
      meta: {
        weekOf,
        totalStudents: classStudents.length,
        recordedStudents: recordedSet.size,
        pendingStudents: pendingStudents.length,
      },
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "예상치 못한 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
