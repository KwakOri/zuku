/**
 * 학생 수강 과목 React Query Hook
 */

import { useQuery } from "@tanstack/react-query";
import { fetchStudentSubjects } from "@/services/client/studentSubjectsApi";

/**
 * 학생의 수강 과목 조회 Hook
 */
export function useStudentSubjects(studentId?: string) {
  return useQuery({
    queryKey: ["student-subjects", studentId],
    queryFn: () => fetchStudentSubjects(studentId!),
    enabled: !!studentId,
    staleTime: 1000 * 60 * 5, // 5분
  });
}
