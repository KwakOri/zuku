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
        // 요일이 null인 경우 처리
        if (a.day_of_week === null && b.day_of_week === null) {
          // 둘 다 null이면 시간으로 정렬
          if (!a.start_time && !b.start_time) return 0;
          if (!a.start_time) return 1;
          if (!b.start_time) return -1;
          return a.start_time.localeCompare(b.start_time);
        }
        if (a.day_of_week === null) return 1; // null인 것을 뒤로
        if (b.day_of_week === null) return -1; // null인 것을 뒤로

        if (a.day_of_week !== b.day_of_week) {
          return a.day_of_week - b.day_of_week;
        }

        // 시간이 null인 경우 처리
        if (!a.start_time && !b.start_time) return 0;
        if (!a.start_time) return 1; // null인 것을 뒤로
        if (!b.start_time) return -1; // null인 것을 뒤로

        return a.start_time.localeCompare(b.start_time);
      });
    },
  });
}