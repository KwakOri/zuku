import { useQuery } from "@tanstack/react-query";
import { fullScheduleApi, FullScheduleResponse } from "@/services/client/fullScheduleApi";

// Query Keys
export const fullScheduleKeys = {
  all: ["full-schedule"] as const,
  byStudent: (studentId: string) => [...fullScheduleKeys.all, studentId] as const,
};

// Hook
export function useFullSchedule(studentId: string) {
  return useQuery<FullScheduleResponse>({
    queryKey: fullScheduleKeys.byStudent(studentId),
    queryFn: () => fullScheduleApi.getFullSchedule(studentId),
    enabled: !!studentId,
    staleTime: 5 * 60 * 1000, // 5분
  });
}
