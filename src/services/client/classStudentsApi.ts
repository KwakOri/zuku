/**
 * 수강 정보 클라이언트 API
 */

export interface StudentSubjectInfo {
  id: string;
  subject_name: string;
  classes: Array<{
    id: string;
    title: string;
    course_type: string;
  }>;
}

export type StudentSubjectsMap = Record<string, StudentSubjectInfo[]>;

/**
 * 여러 학생의 수강 과목 일괄 조회
 */
export async function fetchStudentSubjectsBatch(
  studentIds: string[]
): Promise<StudentSubjectsMap> {
  const response = await fetch(
    `/api/class-students/by-students?student_ids=${studentIds.join(",")}`
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "수강 과목 조회에 실패했습니다.");
  }

  const result = await response.json();
  return result.data;
}
