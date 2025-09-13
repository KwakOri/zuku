import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getStudentSchedules,
  createStudentSchedule,
  updateStudentSchedule,
  deleteStudentSchedule,
  CreateStudentScheduleRequest,
  UpdateStudentScheduleRequest,
  StudentScheduleRow,
} from "@/services/client/studentScheduleApi";
import { toast } from "react-hot-toast";

// Query Keys
export const studentScheduleKeys = {
  all: ['student-schedules'] as const,
  lists: () => [...studentScheduleKeys.all, 'list'] as const,
  list: (studentId: number) => [...studentScheduleKeys.lists(), studentId] as const,
  details: () => [...studentScheduleKeys.all, 'detail'] as const,
  detail: (studentId: number, scheduleId: string) => [...studentScheduleKeys.details(), studentId, scheduleId] as const,
};

// 학생 개인 일정 목록 조회
export function useStudentSchedules(studentId: number) {
  return useQuery({
    queryKey: studentScheduleKeys.list(studentId),
    queryFn: () => getStudentSchedules(studentId),
    staleTime: 5 * 60 * 1000, // 5분
  });
}

// 새 개인 일정 추가
export function useCreateStudentSchedule(studentId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (scheduleData: CreateStudentScheduleRequest) => 
      createStudentSchedule(studentId, scheduleData),
    onSuccess: (newSchedule) => {
      // 캐시 업데이트
      queryClient.setQueryData(
        studentScheduleKeys.list(studentId),
        (oldData: StudentScheduleRow[] = []) => [...oldData, newSchedule]
      );
      
      // 관련 쿼리 무효화
      queryClient.invalidateQueries({
        queryKey: studentScheduleKeys.list(studentId),
      });

      toast.success("일정이 추가되었습니다.");
    },
    onError: (error: Error) => {
      toast.error(error.message || "일정 추가에 실패했습니다.");
    },
  });
}

// 개인 일정 수정
export function useUpdateStudentSchedule(studentId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ scheduleId, scheduleData }: { 
      scheduleId: string; 
      scheduleData: UpdateStudentScheduleRequest 
    }) => updateStudentSchedule(studentId, scheduleId, scheduleData),
    onSuccess: (updatedSchedule) => {
      // 캐시 업데이트
      queryClient.setQueryData(
        studentScheduleKeys.list(studentId),
        (oldData: StudentScheduleRow[] = []) =>
          oldData.map((schedule) =>
            schedule.id === updatedSchedule.id ? updatedSchedule : schedule
          )
      );

      // 관련 쿼리 무효화
      queryClient.invalidateQueries({
        queryKey: studentScheduleKeys.list(studentId),
      });

      toast.success("일정이 수정되었습니다.");
    },
    onError: (error: Error) => {
      toast.error(error.message || "일정 수정에 실패했습니다.");
    },
  });
}

// 개인 일정 삭제
export function useDeleteStudentSchedule(studentId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (scheduleId: string) => 
      deleteStudentSchedule(studentId, scheduleId),
    onSuccess: (deletedSchedule) => {
      // 캐시 업데이트
      queryClient.setQueryData(
        studentScheduleKeys.list(studentId),
        (oldData: StudentScheduleRow[] = []) =>
          oldData.filter((schedule) => schedule.id !== deletedSchedule.id)
      );

      // 관련 쿼리 무효화
      queryClient.invalidateQueries({
        queryKey: studentScheduleKeys.list(studentId),
      });

      toast.success("일정이 삭제되었습니다.");
    },
    onError: (error: Error) => {
      toast.error(error.message || "일정 삭제에 실패했습니다.");
    },
  });
}