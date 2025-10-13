import { useQuery } from "@tanstack/react-query";
import { combinedScheduleApi } from "@/services/client/combinedScheduleApi";

// Query Keys
export const combinedScheduleKeys = {
  all: ["combinedSchedule"] as const,
  studentsWithSchedules: () => [...combinedScheduleKeys.all, "studentsWithSchedules"] as const,
};

// Queries
export function useCombinedSchedule() {
  return useQuery({
    queryKey: combinedScheduleKeys.studentsWithSchedules(),
    queryFn: () => combinedScheduleApi.getStudentsWithSchedules(),
    staleTime: 2 * 60 * 1000, // 2분
  });
}
