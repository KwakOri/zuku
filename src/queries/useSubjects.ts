import { useQuery } from "@tanstack/react-query";
import { subjectApi } from "@/services/client/subjectApi";

// Query Keys
export const subjectKeys = {
  all: ["subjects"] as const,
  lists: () => [...subjectKeys.all, "list"] as const,
};

// Queries
export function useSubjects() {
  return useQuery({
    queryKey: subjectKeys.lists(),
    queryFn: () => subjectApi.getSubjects(),
    staleTime: 10 * 60 * 1000, // 10분 - 과목은 자주 바뀌지 않음
  });
}