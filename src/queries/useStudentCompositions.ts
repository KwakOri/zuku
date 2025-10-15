import { studentCompositionApi } from "@/services/client/studentCompositionApi";
import { Tables, TablesInsert } from "@/types/supabase";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

type CompositionStudentRow = Tables<"compositions_students">;

// Query Keys
export const studentCompositionKeys = {
  all: ["student-compositions"] as const,
  lists: () => [...studentCompositionKeys.all, "list"] as const,
  list: (filters?: Record<string, unknown>) =>
    [...studentCompositionKeys.lists(), { filters }] as const,
  byClass: (classId: string) =>
    [...studentCompositionKeys.all, "byClass", classId] as const,
  byStudent: (studentId: string) =>
    [...studentCompositionKeys.all, "byStudent", studentId] as const,
};

// Queries
export function useStudentCompositions(filters?: {
  class_id?: string;
  composition_id?: string;
  student_id?: string;
}) {
  return useQuery({
    queryKey: studentCompositionKeys.list(filters),
    queryFn: () => studentCompositionApi.getStudentCompositions(filters),
    staleTime: 5 * 60 * 1000, // 5분
  });
}

export function useCompositionsByClass(classId: string) {
  return useQuery({
    queryKey: studentCompositionKeys.byClass(classId),
    queryFn: () => studentCompositionApi.getCompositionsByClass(classId),
    enabled: !!classId,
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
    mutationFn: (data: TablesInsert<"compositions_students">) =>
      studentCompositionApi.enrollComposition(data),
    onSuccess: (newComposition) => {
      // 관련 쿼리들 무효화
      queryClient.invalidateQueries({
        queryKey: studentCompositionKeys.lists(),
      });
      if (newComposition.class_id) {
        queryClient.invalidateQueries({
          queryKey: studentCompositionKeys.byClass(newComposition.class_id),
        });
      }
      if (newComposition.student_id) {
        queryClient.invalidateQueries({
          queryKey: studentCompositionKeys.byStudent(newComposition.student_id),
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
      if (updatedComposition.class_id) {
        queryClient.invalidateQueries({
          queryKey: studentCompositionKeys.byClass(updatedComposition.class_id),
        });
      }
      if (updatedComposition.student_id) {
        queryClient.invalidateQueries({
          queryKey: studentCompositionKeys.byStudent(updatedComposition.student_id),
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
