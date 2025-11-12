/**
 * 학생 수강 과목 클라이언트 API
 */

export interface StudentSubject {
  id: string;
  subject_name: string;
  classes: Array<{
    id: string;
    title: string;
    course_type: string;
  }>;
}

/**
 * 학생의 수강 과목 조회
 */
export async function fetchStudentSubjects(
  studentId: string
): Promise<StudentSubject[]> {
  const response = await fetch(`/api/students/${studentId}/subjects`);

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "수강 과목 조회에 실패했습니다.");
  }

  const result = await response.json();
  return result.data;
}
