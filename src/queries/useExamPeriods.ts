import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getExamPeriods,
  createExamPeriod,
  updateExamPeriod,
  deleteExamPeriod,
  CreateExamPeriodParams,
  UpdateExamPeriodParams,
  ExamPeriodWithSchool,
} from "@/services/client/examPeriodApi";

/**
 * Query key factory for exam periods
 */
export const examPeriodKeys = {
  all: ["exam-periods"] as const,
  bySchool: (schoolId: string) => ["exam-periods", schoolId] as const,
};

/**
 * Hook to fetch all exam periods or filter by school
 */
export function useExamPeriods(schoolId?: string) {
  return useQuery({
    queryKey: schoolId ? examPeriodKeys.bySchool(schoolId) : examPeriodKeys.all,
    queryFn: () => getExamPeriods(schoolId),
  });
}

/**
 * Hook to create a new exam period
 */
export function useCreateExamPeriod() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: CreateExamPeriodParams) => createExamPeriod(params),
    onSuccess: () => {
      // Invalidate all exam period queries
      queryClient.invalidateQueries({ queryKey: examPeriodKeys.all });
    },
  });
}

/**
 * Hook to update an existing exam period
 */
export function useUpdateExamPeriod() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, params }: { id: string; params: UpdateExamPeriodParams }) =>
      updateExamPeriod(id, params),
    onSuccess: () => {
      // Invalidate all exam period queries
      queryClient.invalidateQueries({ queryKey: examPeriodKeys.all });
    },
  });
}

/**
 * Hook to delete an exam period
 */
export function useDeleteExamPeriod() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteExamPeriod(id),
    onSuccess: () => {
      // Invalidate all exam period queries
      queryClient.invalidateQueries({ queryKey: examPeriodKeys.all });
    },
  });
}
