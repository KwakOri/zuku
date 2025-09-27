import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { teacherApi } from "@/services/client/teacherApi";
import { Tables, TablesInsert, TablesUpdate } from "@/types/supabase";
import { toast } from "react-hot-toast";

// Query Keys
export const teacherKeys = {
  all: ["teachers"] as const,
  lists: () => [...teacherKeys.all, "list"] as const,
  list: (filters?: Record<string, unknown>) => [...teacherKeys.lists(), { filters }] as const,
  details: () => [...teacherKeys.all, "detail"] as const,
  detail: (id: string) => [...teacherKeys.details(), id] as const,
  bySubject: (subject: string) => [...teacherKeys.all, "bySubject", subject] as const,
};

// Queries
export function useTeachers() {
  return useQuery({
    queryKey: teacherKeys.lists(),
    queryFn: () => teacherApi.getTeachers(),
    staleTime: 5 * 60 * 1000, // 5분
  });
}

export function useTeacher(id: string) {
  return useQuery({
    queryKey: teacherKeys.detail(id),
    queryFn: () => teacherApi.getTeacherById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

export function useTeachersBySubject(subject: string) {
  return useQuery({
    queryKey: teacherKeys.bySubject(subject),
    queryFn: () => teacherApi.getTeachersBySubject(subject),
    enabled: !!subject,
    staleTime: 5 * 60 * 1000,
  });
}

// Mutations
export function useCreateTeacher() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: TablesInsert<"teachers">) => teacherApi.createTeacher(data),
    onSuccess: () => {
      // 강사 목록 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: teacherKeys.lists() });
      
      // 과목별 쿼리 무효화
      queryClient.invalidateQueries({
        queryKey: teacherKeys.all,
        predicate: (query) => query.queryKey.includes("bySubject")
      });

      toast.success("강사가 성공적으로 등록되었습니다.");
    },
    onError: (error: Error) => {
      toast.error(error.message || "강사 등록 중 오류가 발생했습니다.");
    },
  });
}

export function useUpdateTeacher() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: TablesUpdate<"teachers"> }) =>
      teacherApi.updateTeacher(id, data),
    onSuccess: (updatedTeacher, variables) => {
      // 해당 강사의 상세 정보 쿼리 업데이트
      queryClient.setQueryData(
        teacherKeys.detail(variables.id),
        updatedTeacher
      );

      // 강사 목록 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: teacherKeys.lists() });
      
      // 과목별 쿼리 무효화 (과목이 변경될 수 있음)
      queryClient.invalidateQueries({ 
        queryKey: teacherKeys.all,
        predicate: (query) => query.queryKey.includes("bySubject")
      });

      toast.success("강사 정보가 성공적으로 수정되었습니다.");
    },
    onError: (error: Error) => {
      toast.error(error.message || "강사 정보 수정 중 오류가 발생했습니다.");
    },
  });
}

export function useDeleteTeacher() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => teacherApi.deleteTeacher(id),
    onSuccess: (_, deletedId) => {
      // 해당 강사의 모든 쿼리 제거
      queryClient.removeQueries({ queryKey: teacherKeys.detail(deletedId) });

      // 강사 목록 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: teacherKeys.lists() });
      
      // 과목별 쿼리들 무효화
      queryClient.invalidateQueries({ 
        queryKey: teacherKeys.all,
        predicate: (query) => query.queryKey.includes("bySubject")
      });

      toast.success("강사가 성공적으로 삭제되었습니다.");
    },
    onError: (error: Error) => {
      toast.error(error.message || "강사 삭제 중 오류가 발생했습니다.");
    },
  });
}

// 낙관적 업데이트를 위한 훅
export function useOptimisticUpdateTeacher() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: TablesUpdate<"teachers"> }) =>
      teacherApi.updateTeacher(id, data),
    onMutate: async ({ id, data }) => {
      // 진행 중인 refetch 취소
      await queryClient.cancelQueries({ queryKey: teacherKeys.detail(id) });

      // 이전 데이터 백업
      const previousTeacher = queryClient.getQueryData(teacherKeys.detail(id));

      // 낙관적 업데이트
      queryClient.setQueryData(teacherKeys.detail(id), (old: Tables<"teachers"> | undefined) => {
        if (!old) return old;
        return { ...old, ...data };
      });

      return { previousTeacher };
    },
    onError: (error, variables, context) => {
      // 에러 발생 시 롤백
      if (context?.previousTeacher) {
        queryClient.setQueryData(
          teacherKeys.detail(variables.id),
          context.previousTeacher
        );
      }
      toast.error(error.message || "강사 정보 수정 중 오류가 발생했습니다.");
    },
    onSettled: (data, error, variables) => {
      // 성공/실패 관계없이 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: teacherKeys.detail(variables.id) });
    },
    onSuccess: () => {
      toast.success("강사 정보가 성공적으로 수정되었습니다.");
    },
  });
}