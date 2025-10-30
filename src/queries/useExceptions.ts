import {
  useMutation,
  useQuery,
  useQueryClient,
  QueryClient,
} from "@tanstack/react-query";
import {
  compositionsExceptionsApi,
  compositionStudentsExceptionsApi,
  CreateCompositionsExceptionRequest,
  CreateCompositionStudentsExceptionRequest,
} from "@/services/client/exceptionsApi";

// Query Keys
export const exceptionsKeys = {
  all: ["exceptions"] as const,
  compositions: () => [...exceptionsKeys.all, "compositions"] as const,
  compositionsList: (params?: {
    startDate?: string;
    endDate?: string;
    compositionId?: string;
  }) => [...exceptionsKeys.compositions(), params] as const,
  students: () => [...exceptionsKeys.all, "students"] as const,
  studentsList: (params?: {
    startDate?: string;
    endDate?: string;
    studentId?: string;
    compositionIdFrom?: string;
  }) => [...exceptionsKeys.students(), params] as const,
};

// ============================================
// 수업 예외 (Compositions Exceptions)
// ============================================

// 수업 예외 조회
export function useCompositionsExceptions(params?: {
  startDate?: string;
  endDate?: string;
  compositionId?: string;
}) {
  return useQuery({
    queryKey: exceptionsKeys.compositionsList(params),
    queryFn: () => compositionsExceptionsApi.getCompositionsExceptions(params),
    staleTime: 2 * 60 * 1000, // 2분
  });
}

// 수업 예외 생성
export function useCreateCompositionsException() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (exception: CreateCompositionsExceptionRequest) =>
      compositionsExceptionsApi.createCompositionsException(exception),
    onSuccess: () => {
      // 모든 수업 예외 쿼리 무효화
      queryClient.invalidateQueries({
        queryKey: exceptionsKeys.compositions(),
      });
      // 강의실 시간표 쿼리 무효화 (예외가 시간표에 반영되도록)
      queryClient.invalidateQueries({
        queryKey: ["combined-schedule", "classroom"],
      });
    },
  });
}

// 수업 예외 수정
export function useUpdateCompositionsException() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<CreateCompositionsExceptionRequest>;
    }) => compositionsExceptionsApi.updateCompositionsException(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: exceptionsKeys.compositions(),
      });
      queryClient.invalidateQueries({
        queryKey: ["combined-schedule", "classroom"],
      });
    },
  });
}

// 수업 예외 삭제
export function useDeleteCompositionsException() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      compositionsExceptionsApi.deleteCompositionsException(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: exceptionsKeys.compositions(),
      });
      queryClient.invalidateQueries({
        queryKey: ["combined-schedule", "classroom"],
      });
    },
  });
}

// ============================================
// 학생 예외 (Composition Students Exceptions)
// ============================================

// 학생 예외 조회
export function useCompositionStudentsExceptions(params?: {
  startDate?: string;
  endDate?: string;
  studentId?: string;
  compositionIdFrom?: string;
}) {
  return useQuery({
    queryKey: exceptionsKeys.studentsList(params),
    queryFn: () =>
      compositionStudentsExceptionsApi.getCompositionStudentsExceptions(params),
    staleTime: 2 * 60 * 1000, // 2분
  });
}

// 학생 예외 생성
export function useCreateCompositionStudentsException() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (exception: CreateCompositionStudentsExceptionRequest) =>
      compositionStudentsExceptionsApi.createCompositionStudentsException(
        exception
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: exceptionsKeys.students(),
      });
      queryClient.invalidateQueries({
        queryKey: ["combined-schedule", "classroom"],
      });
    },
  });
}

// 학생 예외 수정
export function useUpdateCompositionStudentsException() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<CreateCompositionStudentsExceptionRequest>;
    }) =>
      compositionStudentsExceptionsApi.updateCompositionStudentsException(
        id,
        updates
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: exceptionsKeys.students(),
      });
      queryClient.invalidateQueries({
        queryKey: ["combined-schedule", "classroom"],
      });
    },
  });
}

// 학생 예외 삭제
export function useDeleteCompositionStudentsException() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      compositionStudentsExceptionsApi.deleteCompositionStudentsException(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: exceptionsKeys.students(),
      });
      queryClient.invalidateQueries({
        queryKey: ["combined-schedule", "classroom"],
      });
    },
  });
}
