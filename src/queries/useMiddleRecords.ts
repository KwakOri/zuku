import { middleRecordApi } from "@/services/client/middleRecordApi";
import { TablesInsert, TablesUpdate } from "@/types/supabase";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

interface FiltersProps {
  classId?: string;
  studentId?: string;
  weekOf?: string;
}

// Query Keys
export const middleRecordKeys = {
  all: ["middleRecords"] as const,
  lists: () => [...middleRecordKeys.all, "list"] as const,
  list: (filters: FiltersProps) =>
    [...middleRecordKeys.lists(), { filters }] as const,
  details: () => [...middleRecordKeys.all, "detail"] as const,
  detail: (id: string) => [...middleRecordKeys.details(), id] as const,
  byClass: (classId: string) =>
    [...middleRecordKeys.all, "byClass", classId] as const,
  byStudent: (studentId: string) =>
    [...middleRecordKeys.all, "byStudent", studentId] as const,
  byWeek: (classId?: string, weekOf?: string) =>
    [...middleRecordKeys.all, "byWeek", classId, weekOf] as const,
  pending: (teacherId: string, weekOf?: string) =>
    [...middleRecordKeys.all, "pending", teacherId, weekOf] as const,
};

// 중등 기록 목록 조회
export function useMiddleRecords(params?: FiltersProps) {
  return useQuery({
    queryKey: middleRecordKeys.list(params || {}),
    queryFn: () => middleRecordApi.getMiddleRecords(params),
    staleTime: 3 * 60 * 1000, // 3분
  });
}

// 특정 중등 기록 조회
export function useMiddleRecord(id: string) {
  return useQuery({
    queryKey: middleRecordKeys.detail(id),
    queryFn: () => middleRecordApi.getMiddleRecordById(id),
    enabled: !!id,
    staleTime: 3 * 60 * 1000,
  });
}

// 특정 주차의 기록들 조회
export function useWeeklyMiddleRecords(classId?: string, weekOf?: string) {
  return useQuery({
    queryKey: middleRecordKeys.byWeek(classId, weekOf),
    queryFn: () => middleRecordApi.getWeeklyRecords(classId!, weekOf!),
    enabled: !!classId && !!weekOf,
    staleTime: 3 * 60 * 1000,
  });
}

// 특정 학생의 기록들 조회
export function useStudentMiddleRecords(studentId: string, classId?: string) {
  return useQuery({
    queryKey: middleRecordKeys.byStudent(studentId),
    queryFn: () => middleRecordApi.getStudentRecords(studentId, classId),
    enabled: !!studentId,
    staleTime: 3 * 60 * 1000,
  });
}


// 새 중등 기록 생성
export function useCreateMiddleRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: TablesInsert<"homework_records_middle">) =>
      middleRecordApi.createMiddleRecord(data),
    onSuccess: (newRecord) => {
      // 관련 쿼리들 무효화
      queryClient.invalidateQueries({
        queryKey: middleRecordKeys.lists(),
      });

      queryClient.invalidateQueries({
        queryKey: middleRecordKeys.byClass(newRecord.class_id),
      });

      queryClient.invalidateQueries({
        queryKey: middleRecordKeys.byStudent(newRecord.student_id),
      });


      queryClient.invalidateQueries({
        queryKey: middleRecordKeys.byWeek(
          newRecord.class_id,
          newRecord.week_of
        ),
      });

      toast.success("중등 기록이 성공적으로 등록되었습니다.");
    },
    onError: (error: Error) => {
      toast.error(error.message || "중등 기록 등록 중 오류가 발생했습니다.");
    },
  });
}

// 중등 기록 수정
export function useUpdateMiddleRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: TablesUpdate<"homework_records_middle">;
    }) => middleRecordApi.updateMiddleRecord(id, data),
    onSuccess: (updatedRecord, variables) => {
      // 상세 정보 쿼리 업데이트
      queryClient.setQueryData(
        middleRecordKeys.detail(variables.id),
        updatedRecord
      );

      // 관련 쿼리들 무효화
      queryClient.invalidateQueries({
        queryKey: middleRecordKeys.lists(),
      });

      queryClient.invalidateQueries({
        queryKey: middleRecordKeys.byClass(updatedRecord.class_id),
      });

      queryClient.invalidateQueries({
        queryKey: middleRecordKeys.byStudent(updatedRecord.student_id),
      });


      queryClient.invalidateQueries({
        queryKey: middleRecordKeys.byWeek(
          updatedRecord.class_id,
          updatedRecord.week_of
        ),
      });

      toast.success("중등 기록이 성공적으로 수정되었습니다.");
    },
    onError: (error: Error) => {
      toast.error(error.message || "중등 기록 수정 중 오류가 발생했습니다.");
    },
  });
}

// 중등 기록 삭제
export function useDeleteMiddleRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => middleRecordApi.deleteMiddleRecord(id),
    onSuccess: (_, deletedId) => {
      // 상세 쿼리 제거
      queryClient.removeQueries({
        queryKey: middleRecordKeys.detail(deletedId),
      });

      // 관련 쿼리들 무효화
      queryClient.invalidateQueries({
        queryKey: middleRecordKeys.all,
      });

      toast.success("중등 기록이 성공적으로 삭제되었습니다.");
    },
    onError: (error: Error) => {
      toast.error(error.message || "중등 기록 삭제 중 오류가 발생했습니다.");
    },
  });
}

// 일괄 작업을 위한 유틸리티 훅
export function useBulkCreateMiddleRecords() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (records: TablesInsert<"homework_records_middle">[]) => {
      const results = await Promise.all(
        records.map((record) => middleRecordApi.createMiddleRecord(record))
      );
      return results;
    },
    onSuccess: (newRecords) => {
      // 모든 관련 쿼리 무효화
      queryClient.invalidateQueries({
        queryKey: middleRecordKeys.all,
      });

      toast.success(
        `${newRecords.length}개의 중등 기록이 성공적으로 등록되었습니다.`
      );
    },
    onError: (error: Error) => {
      toast.error(error.message || "일괄 등록 중 오류가 발생했습니다.");
    },
  });
}

// 미입력 학생 목록 조회
export function usePendingStudents(teacherId?: string, weekOf?: string) {
  return useQuery({
    queryKey: middleRecordKeys.pending(teacherId || "", weekOf),
    queryFn: () => middleRecordApi.getPendingStudents({
      teacherId: teacherId!,
      weekOf
    }),
    enabled: !!teacherId,
    staleTime: 1 * 60 * 1000, // 1분
  });
}
