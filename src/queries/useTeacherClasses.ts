import { useQuery } from "@tanstack/react-query";
import { teacherApi, TeacherClassWithStudents } from "@/services/client/teacherApi";

// Query Keys
export const teacherClassKeys = {
  all: ["teacher-classes"] as const,
  lists: () => [...teacherClassKeys.all, "list"] as const,
  list: (teacherId: string) => [...teacherClassKeys.lists(), teacherId] as const,
};

// 강사의 담당 수업 목록 조회
export function useTeacherClasses(teacherId: string) {
  return useQuery({
    queryKey: teacherClassKeys.list(teacherId),
    queryFn: () => teacherApi.getTeacherClasses(teacherId),
    enabled: !!teacherId,
    staleTime: 5 * 60 * 1000, // 5분
    select: (data: TeacherClassWithStudents[]) => {
      // 수업 제목으로 정렬
      return data.sort((a, b) => {
        return a.title.localeCompare(b.title);
      });
    },
  });
}