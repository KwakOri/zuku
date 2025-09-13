import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { studentApi } from "@/services/client/studentApi";
import { Tables, TablesInsert, TablesUpdate } from "@/types/supabase";
import { toast } from "react-hot-toast";

// Query Keys
export const studentKeys = {
  all: ["students"] as const,
  lists: () => [...studentKeys.all, "list"] as const,
  list: (filters?: Record<string, unknown>) => [...studentKeys.lists(), { filters }] as const,
  details: () => [...studentKeys.all, "detail"] as const,
  detail: (id: number) => [...studentKeys.details(), id] as const,
  byGrade: (grade: number) => [...studentKeys.all, "byGrade", grade] as const,
  search: (term: string) => [...studentKeys.all, "search", term] as const,
};

// Queries
export function useStudents() {
  return useQuery({
    queryKey: studentKeys.lists(),
    queryFn: () => studentApi.getStudents(),
    staleTime: 5 * 60 * 1000, // 5분
  });
}

export function useStudent(id: number) {
  return useQuery({
    queryKey: studentKeys.detail(id),
    queryFn: () => studentApi.getStudentById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

export function useStudentsByGrade(grade: number) {
  return useQuery({
    queryKey: studentKeys.byGrade(grade),
    queryFn: () => studentApi.getStudentsByGrade(grade),
    enabled: !!grade,
    staleTime: 5 * 60 * 1000,
  });
}

export function useSearchStudents(searchTerm: string) {
  return useQuery({
    queryKey: studentKeys.search(searchTerm),
    queryFn: () => studentApi.searchStudents(searchTerm),
    enabled: !!searchTerm && searchTerm.length >= 2,
    staleTime: 2 * 60 * 1000, // 검색 결과는 2분간 캐시
  });
}

// Mutations
export function useCreateStudent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: TablesInsert<"students">) => studentApi.createStudent(data),
    onSuccess: (newStudent) => {
      // 학생 목록 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: studentKeys.lists() });
      
      // 학년별 쿼리 무효화
      queryClient.invalidateQueries({ 
        queryKey: studentKeys.byGrade(newStudent.grade) 
      });

      toast.success("학생이 성공적으로 등록되었습니다.");
    },
    onError: (error: Error) => {
      toast.error(error.message || "학생 등록 중 오류가 발생했습니다.");
    },
  });
}

export function useUpdateStudent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: TablesUpdate<"students"> }) =>
      studentApi.updateStudent(id, data),
    onSuccess: (updatedStudent, variables) => {
      // 해당 학생의 상세 정보 쿼리 업데이트
      queryClient.setQueryData(
        studentKeys.detail(variables.id),
        updatedStudent
      );

      // 학생 목록 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: studentKeys.lists() });
      
      // 학년별 쿼리 무효화 (학년이 변경될 수 있음)
      queryClient.invalidateQueries({ 
        queryKey: studentKeys.all,
        predicate: (query) => query.queryKey.includes("byGrade")
      });

      toast.success("학생 정보가 성공적으로 수정되었습니다.");
    },
    onError: (error: Error) => {
      toast.error(error.message || "학생 정보 수정 중 오류가 발생했습니다.");
    },
  });
}

export function useDeleteStudent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => studentApi.deleteStudent(id),
    onSuccess: (_, deletedId) => {
      // 해당 학생의 모든 쿼리 제거
      queryClient.removeQueries({ queryKey: studentKeys.detail(deletedId) });

      // 학생 목록 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: studentKeys.lists() });
      
      // 학년별 쿼리 무효화
      queryClient.invalidateQueries({ 
        queryKey: studentKeys.all,
        predicate: (query) => query.queryKey.includes("byGrade")
      });

      toast.success("학생이 성공적으로 삭제되었습니다.");
    },
    onError: (error: Error) => {
      toast.error(error.message || "학생 삭제 중 오류가 발생했습니다.");
    },
  });
}

// 낙관적 업데이트를 위한 훅
export function useOptimisticUpdateStudent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: TablesUpdate<"students"> }) =>
      studentApi.updateStudent(id, data),
    onMutate: async ({ id, data }) => {
      // 진행 중인 refetch 취소
      await queryClient.cancelQueries({ queryKey: studentKeys.detail(id) });

      // 이전 데이터 백업
      const previousStudent = queryClient.getQueryData(studentKeys.detail(id));

      // 낙관적 업데이트
      queryClient.setQueryData(studentKeys.detail(id), (old: Tables<"students"> | undefined) => {
        if (!old) return old;
        return { ...old, ...data };
      });

      return { previousStudent };
    },
    onError: (error, variables, context) => {
      // 에러 발생 시 롤백
      if (context?.previousStudent) {
        queryClient.setQueryData(
          studentKeys.detail(variables.id),
          context.previousStudent
        );
      }
      toast.error(error.message || "학생 정보 수정 중 오류가 발생했습니다.");
    },
    onSettled: (data, error, variables) => {
      // 성공/실패 관계없이 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: studentKeys.detail(variables.id) });
    },
    onSuccess: () => {
      toast.success("학생 정보가 성공적으로 수정되었습니다.");
    },
  });
}