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
      // 요일과 시간 순으로 정렬
      return data.sort((a, b) => {
        if (a.day_of_week !== b.day_of_week) {
          return a.day_of_week - b.day_of_week;
        }
        return a.start_time.localeCompare(b.start_time);
      });
    },
  });
}