import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase-server";

// 타입 정의
interface ClassInfo {
  id: string;
  title: string;
  course_type: string;
}

interface SubjectInfo {
  id: string;
  subject_name: string;
  classes: ClassInfo[];
}

interface ClassStudentRecord {
  student_id: string;
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

// GET /api/class-students/by-students - 여러 학생의 수강 정보 일괄 조회
// relations_classes_students 테이블을 기반으로 학생별 수강 과목 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const studentIdsParam = searchParams.get("student_ids");

    if (!studentIdsParam) {
      return NextResponse.json(
        { error: "student_ids 파라미터가 필요합니다." },
        { status: 400 }
      );
    }

    const studentIds = studentIdsParam.split(",");

    const supabase = createAdminSupabaseClient();

    // relations_classes_students 테이블에서 학생들의 수강 정보 조회
    const { data: classStudents, error } = await supabase
      .from("relations_classes_students")
      .select(`
        student_id,
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
      .in("student_id", studentIds);

    if (error) {
      console.error("Error fetching class students:", error);
      return NextResponse.json(
        { error: "수강 정보를 불러오는 중 오류가 발생했습니다." },
        { status: 500 }
      );
    }

    // 학생별로 그룹화 (중복 제거)
    const studentSubjectsMap = new Map<string, SubjectInfo[]>();

    classStudents?.forEach((record: ClassStudentRecord) => {
      if (!studentSubjectsMap.has(record.student_id)) {
        studentSubjectsMap.set(record.student_id, []);
      }

      if (record.class?.subject?.subject_name) {
        const classData = record.class;
        const subjectData = classData.subject!; // 위 조건에서 이미 존재 확인함
        const subjectId = subjectData.id;
        const subjectName = subjectData.subject_name;
        const subjects = studentSubjectsMap.get(record.student_id)!;

        // 이미 같은 과목이 있는지 확인
        const existing = subjects.find((s) => s.id === subjectId);

        if (!existing) {
          // 새로운 과목 추가
          subjects.push({
            id: subjectId,
            subject_name: subjectName!, // 위 조건에서 이미 존재 확인함
            classes: [
              {
                id: classData.id,
                title: classData.title,
                course_type: classData.course_type,
              },
            ],
          });
        } else {
          // 같은 과목의 다른 클래스인 경우 클래스만 추가 (중복 체크)
          const classExists = existing.classes.some(
            (c: ClassInfo) => c.id === classData.id
          );
          if (!classExists) {
            existing.classes.push({
              id: classData.id,
              title: classData.title,
              course_type: classData.course_type,
            });
          }
        }
      }
    });

    // Map을 객체로 변환
    const result: Record<string, SubjectInfo[]> = {};
    studentSubjectsMap.forEach((subjects, studentId) => {
      result[studentId] = subjects;
    });

    return NextResponse.json({ data: result });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "예상치 못한 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
