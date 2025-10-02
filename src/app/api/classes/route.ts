import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase-server";
import { TablesInsert } from "@/types/supabase";

export async function GET() {
  try {
    const supabase = createAdminSupabaseClient();
    
    const { data: classes, error } = await supabase
      .from("classes")
      .select(`
        *,
        teacher:teachers(id, name),
        subject:subjects(id, subject_name)
      `)
      .order("day_of_week")
      .order("start_time");

    if (error) {
      console.error("Classes fetch error:", error);
      return NextResponse.json(
        { error: "Failed to fetch classes" },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: classes });
  } catch (error) {
    console.error("Classes API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      subjectId,
      description,
      dayOfWeek,
      startTime,
      endTime,
      teacherId,
      room,
      maxStudents,
      studentIds,
      courseType
    } = body;

    // 필수 필드 검증 (시간 관련 필드는 선택사항)
    if (!title || !subjectId || !teacherId) {
      return NextResponse.json(
        { error: "필수 필드가 누락되었습니다 (제목, 과목, 강사)" },
        { status: 400 }
      );
    }

    // 학생 ID 배열 검증 (선택사항)
    const hasStudents = studentIds && Array.isArray(studentIds) && studentIds.length > 0;

    // 시간 형식 검증 및 변환 (HH:MM -> HH:MM:SS)
    const formatTime = (time: string | undefined) => {
      if (!time) return null;
      if (time.length === 5) { // HH:MM 형식
        return `${time}:00`;
      }
      return time;
    };

    const formattedStartTime = formatTime(startTime);
    const formattedEndTime = formatTime(endTime);

    const supabase = createAdminSupabaseClient();

    // 과목 정보 조회
    const { data: subject, error: subjectError } = await supabase
      .from("subjects")
      .select("subject_name")
      .eq("id", subjectId)
      .single();

    if (subjectError || !subject) {
      return NextResponse.json(
        { error: "과목 정보를 찾을 수 없습니다" },
        { status: 400 }
      );
    }

    // 시간 중복 검사 (시간이 설정된 경우에만)
    if (dayOfWeek !== undefined && startTime && endTime) {
      const { data: conflictingClasses, error: conflictError } = await supabase
        .from("classes")
        .select("id, title, start_time, end_time")
        .eq("teacher_id", teacherId)
        .eq("day_of_week", dayOfWeek)
        .or(`and(start_time.lte.${formattedEndTime},end_time.gt.${formattedStartTime})`);

      if (conflictError) {
        console.error("Conflict check error:", conflictError);
      } else if (conflictingClasses && conflictingClasses.length > 0) {
        return NextResponse.json(
          {
            error: "해당 시간대에 이미 강사의 다른 수업이 있습니다",
            conflictingClasses
          },
          { status: 409 }
        );
      }
    }

    // 과목별 기본 색상 설정
    const subjectColors: { [key: string]: string } = {
      "수학": "#3b82f6", // blue-500
      "영어": "#10b981", // emerald-500
      "과학": "#f59e0b", // amber-500
      "국어": "#ef4444", // red-500
      "사회": "#8b5cf6", // violet-500
      "역사": "#f97316", // orange-500
      "물리": "#06b6d4", // cyan-500
      "화학": "#84cc16", // lime-500
      "생물": "#22c55e", // green-500
      "지구과학": "#a855f7", // purple-500
    };

    // 수업 생성
    const classData: TablesInsert<"classes"> = {
      title,
      subject_id: subjectId,
      description: description || null,
      day_of_week: dayOfWeek || null,
      start_time: formattedStartTime,
      end_time: formattedEndTime,
      teacher_id: teacherId,
      room: room || null,
      max_students: maxStudents || null,
      color: subjectColors[subject.subject_name || ''] || "#6b7280", // 기본값: gray-500
      course_type: courseType || "regular", // 기본값: regular
      rrule: null
    };

    const { data: newClass, error: classError } = await supabase
      .from("classes")
      .insert([classData])
      .select(`
        *,
        teacher:teachers(id, name, email),
        subject:subjects(id, subject_name)
      `)
      .single();

    if (classError) {
      console.error("Class creation error:", classError);
      return NextResponse.json(
        { error: "Failed to create class" },
        { status: 500 }
      );
    }

    // 학생들을 수업에 등록 (있는 경우)
    if (hasStudents) {
      const classStudentInserts = studentIds.map((studentId: string) => ({
        class_id: newClass.id,
        student_id: studentId,
        status: "active",
        enrolled_date: new Date().toISOString().split('T')[0] // YYYY-MM-DD 형식
      }));

      const { error: studentsError } = await supabase
        .from("class_students")
        .insert(classStudentInserts);

      if (studentsError) {
        console.error("Students enrollment error:", studentsError);
        // 수업은 생성되었지만 학생 등록에 실패한 경우 경고와 함께 응답
        return NextResponse.json({
          data: newClass,
          warning: "수업은 생성되었지만 일부 학생 등록에 실패했습니다",
          error: studentsError.message
        }, { status: 201 });
      }
    }

    // 생성된 수업 정보를 학생 정보와 함께 다시 조회
    const { data: createdClass, error: fetchError } = await supabase
      .from("classes")
      .select(`
        *,
        teacher:teachers(id, name, email),
        subject:subjects(id, subject_name),
        class_students(
          student_id,
          status,
          students(
            id,
            name,
            grade
          )
        )
      `)
      .eq("id", newClass.id)
      .single();

    if (fetchError) {
      console.error("Created class fetch error:", fetchError);
      // 기본 수업 정보라도 반환
      return NextResponse.json({ data: newClass }, { status: 201 });
    }

    return NextResponse.json({
      data: createdClass,
      message: "수업이 성공적으로 생성되었습니다"
    }, { status: 201 });

  } catch (error) {
    console.error("Class creation API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}