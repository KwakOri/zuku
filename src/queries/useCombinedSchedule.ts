import { useQuery } from "@tanstack/react-query";
import { combinedScheduleApi } from "@/services/client/combinedScheduleApi";

// Query Keys
export const combinedScheduleKeys = {
  all: ["combinedSchedule"] as const,
  studentsWithSchedules: () => [...combinedScheduleKeys.all, "studentsWithSchedules"] as const,
  classesWithSchedules: () => [...combinedScheduleKeys.all, "classesWithSchedules"] as const,
  teachersWithSchedules: () => [...combinedScheduleKeys.all, "teachersWithSchedules"] as const,
  classroomSchedule: () => [...combinedScheduleKeys.all, "classroomSchedule"] as const,
};

// Queries
export function useCombinedSchedule() {
  return useQuery({
    queryKey: combinedScheduleKeys.studentsWithSchedules(),
    queryFn: () => combinedScheduleApi.getStudentsWithSchedules(),
    staleTime: 2 * 60 * 1000, // 2분
  });
}

export function useCombinedClassSchedule() {
  return useQuery({
    queryKey: combinedScheduleKeys.classesWithSchedules(),
    queryFn: () => combinedScheduleApi.getClassesWithSchedules(),
    staleTime: 2 * 60 * 1000, // 2분
  });
}

export function useCombinedTeacherSchedule() {
  return useQuery({
    queryKey: combinedScheduleKeys.teachersWithSchedules(),
    queryFn: () => combinedScheduleApi.getTeachersWithSchedules(),
    staleTime: 2 * 60 * 1000, // 2분
  });
}

export function useClassroomSchedule() {
  return useQuery({
    queryKey: combinedScheduleKeys.classroomSchedule(),
    queryFn: () => combinedScheduleApi.getClassroomSchedule(),
    staleTime: 2 * 60 * 1000, // 2분
  });
}
