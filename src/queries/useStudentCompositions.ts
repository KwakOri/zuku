import { studentCompositionApi } from "@/services/client/studentCompositionApi";
import { Tables, TablesInsert } from "@/types/supabase";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

type StudentCompositionRow = Tables<"student_compositions">;

// Query Keys
export const studentCompositionKeys = {
  all: ["student-compositions"] as const,
  lists: () => [...studentCompositionKeys.all, "list"] as const,
  list: (filters?: Record<string, unknown>) =>
    [...studentCompositionKeys.lists(), { filters }] as const,
  byClassStudent: (classStudentId: string) =>
    [...studentCompositionKeys.all, "byClassStudent", classStudentId] as const,
  byStudent: (studentId: string) =>
    [...studentCompositionKeys.all, "byStudent", studentId] as const,
};

// Queries
export function useStudentCompositions(filters?: {
  class_student_id?: string;
  composition_id?: string;
  student_id?: string;
}) {
  return useQuery({
    queryKey: studentCompositionKeys.list(filters),
    queryFn: () => studentCompositionApi.getStudentCompositions(filters),
    staleTime: 5 * 60 * 1000, // 5분
  });
}

export function useCompositionsByClassStudent(classStudentId: string) {
  return useQuery({
    queryKey: studentCompositionKeys.byClassStudent(classStudentId),
    queryFn: () =>
      studentCompositionApi.getCompositionsByClassStudent(classStudentId),
    enabled: !!classStudentId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCompositionsByStudent(studentId: string) {
  return useQuery({
    queryKey: studentCompositionKeys.byStudent(studentId),
    queryFn: () => studentCompositionApi.getCompositionsByStudent(studentId),
    enabled: !!studentId,
    staleTime: 5 * 60 * 1000,
  });
}

// Mutations
export function useEnrollComposition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: TablesInsert<"student_compositions">) =>
      studentCompositionApi.enrollComposition(data),
    onSuccess: (newComposition) => {
      // 관련 쿼리들 무효화
      queryClient.invalidateQueries({
        queryKey: studentCompositionKeys.lists(),
      });
      if (newComposition.class_student_id) {
        queryClient.invalidateQueries({
          queryKey: studentCompositionKeys.byClassStudent(
            newComposition.class_student_id
          ),
        });
      }

      toast.success("구성(시간대)에 성공적으로 등록되었습니다.");
    },
    onError: (error: Error) => {
      toast.error(error.message || "구성 등록 중 오류가 발생했습니다.");
    },
  });
}

export function useUnenrollComposition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => studentCompositionApi.unenrollComposition(id),
    onSuccess: (updatedComposition) => {
      // 관련 쿼리들 무효화
      queryClient.invalidateQueries({
        queryKey: studentCompositionKeys.lists(),
      });
      if (updatedComposition.class_student_id) {
        queryClient.invalidateQueries({
          queryKey: studentCompositionKeys.byClassStudent(
            updatedComposition.class_student_id
          ),
        });
      }

      toast.success("구성에서 성공적으로 제거되었습니다.");
    },
    onError: (error: Error) => {
      toast.error(error.message || "구성 제거 중 오류가 발생했습니다.");
    },
  });
}

const studentCompositionModule = {
  studentCompositionApi,
  studentCompositionKeys,
};

export default studentCompositionModule;
