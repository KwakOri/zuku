import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase-server";

// 타입 정의
interface ClassStudentRecord {
  class: {
    id: string;
    title: string;
    course_type: string;
    subject: {
      id: string;
      subject_name: string | null;
    } | null;
  } | null;
}

// GET /api/students/[id]/subjects - 학생의 수강 과목 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: studentId } = await params;

    if (!studentId) {
      return NextResponse.json(
        { error: "학생 ID가 필요합니다." },
        { status: 400 }
      );
    }

    const supabase = createAdminSupabaseClient();

    // 학생이 수강하는 class들의 subject 정보 조회
    const { data: classStudents, error } = await supabase
      .from("relations_classes_students")
      .select(`
        class:classes(
          id,
          title,
          course_type,
          subject:subjects(
            id,
            subject_name
          )
        )
      `)
      .eq("student_id", studentId);

    if (error) {
      console.error("Error fetching student subjects:", error);
      return NextResponse.json(
        { error: "학생의 수강 과목을 불러오는 중 오류가 발생했습니다." },
        { status: 500 }
      );
    }

    // 중복 제거 (같은 과목을 여러 반에서 수강하는 경우)
    const subjectMap = new Map();

    classStudents?.forEach((cs: ClassStudentRecord) => {
      if (cs.class?.subject?.subject_name) {
        const subject = cs.class.subject;
        if (!subjectMap.has(subject.id)) {
          subjectMap.set(subject.id, {
            id: subject.id,
            subject_name: subject.subject_name,
            classes: [],
          });
        }
        subjectMap.get(subject.id).classes.push({
          id: cs.class.id,
          title: cs.class.title,
          course_type: cs.class.course_type,
        });
      }
    });

    const subjects = Array.from(subjectMap.values());

    return NextResponse.json({ data: subjects });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "예상치 못한 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
