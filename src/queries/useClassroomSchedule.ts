import {
  moveStudents,
  changeRoom,
  changeTime,
} from "@/services/client/classroomScheduleApi";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { combinedScheduleKeys } from "./useCombinedSchedule";
import { exceptionsKeys } from "./useExceptions";

/**
 * 학생 이동 mutation
 */
export function useMoveStudents() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: moveStudents,
    onSuccess: () => {
      // 강의실 시간표 데이터 갱신 (모든 주 데이터 무효화)
      queryClient.invalidateQueries({
        queryKey: combinedScheduleKeys.all
      });

      // 학생 예외 데이터 갱신
      queryClient.invalidateQueries({
        queryKey: exceptionsKeys.students()
      });

      // 레거시 키 호환성
      queryClient.invalidateQueries({ queryKey: ["classes"] });
    },
    onError: (error) => {
      console.error("학생 이동 실패:", error);
      alert(error instanceof Error ? error.message : "학생 이동에 실패했습니다.");
    },
  });
}

/**
 * 강의실 변경 mutation
 */
export function useChangeRoom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: changeRoom,
    onSuccess: () => {
      // 강의실 시간표 데이터 갱신 (모든 주 데이터 무효화)
      queryClient.invalidateQueries({
        queryKey: combinedScheduleKeys.all
      });

      // 수업 예외 데이터 갱신
      queryClient.invalidateQueries({
        queryKey: exceptionsKeys.compositions()
      });

      // 레거시 키 호환성
      queryClient.invalidateQueries({ queryKey: ["classes"] });
    },
    onError: (error) => {
      console.error("강의실 변경 실패:", error);
      alert(error instanceof Error ? error.message : "강의실 변경에 실패했습니다.");
    },
  });
}

/**
 * 시간대 변경 mutation
 */
export function useChangeTime() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: changeTime,
    onSuccess: () => {
      // 강의실 시간표 데이터 갱신 (모든 주 데이터 무효화)
      queryClient.invalidateQueries({
        queryKey: combinedScheduleKeys.all
      });

      // 수업 예외 데이터 갱신
      queryClient.invalidateQueries({
        queryKey: exceptionsKeys.compositions()
      });

      // 레거시 키 호환성
      queryClient.invalidateQueries({ queryKey: ["classes"] });
    },
    onError: (error) => {
      console.error("시간대 변경 실패:", error);
      alert(error instanceof Error ? error.message : "시간대 변경에 실패했습니다.");
    },
  });
}
