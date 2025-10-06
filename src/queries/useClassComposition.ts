import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getClassCompositions,
  createClassComposition,
  updateClassComposition,
  deleteClassComposition,
} from "@/services/client/classCompositionApi";
import { ClassComposition } from "@/types/schedule";
import { toast } from "react-hot-toast";
import { classKeys } from "./useClasses";

// 특정 수업의 시간 구성 조회
export function useClassCompositions(classId?: string) {
  return useQuery({
    queryKey: ["classCompositions", classId],
    queryFn: () => getClassCompositions(classId),
    enabled: !!classId,
  });
}

// 시간 구성 생성
export function useCreateClassComposition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createClassComposition,
    onSuccess: () => {
      // 전체 시간 구성 목록 무효화
      queryClient.invalidateQueries({
        queryKey: ["classCompositions"],
      });
      // 수업 목록도 무효화 (class_composition 데이터 포함)
      queryClient.invalidateQueries({
        queryKey: classKeys.all,
      });

      toast.success("시간표가 성공적으로 추가되었습니다.");
    },
    onError: (error: Error) => {
      toast.error(error.message || "시간표 추가 중 오류가 발생했습니다.");
    },
  });
}

// 시간 구성 수정
export function useUpdateClassComposition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateClassComposition,
    onSuccess: (updatedComposition) => {
      // 해당 수업의 시간 구성 목록 무효화
      queryClient.invalidateQueries({
        queryKey: ["classCompositions", updatedComposition.classId],
      });
      // 전체 시간 구성 목록도 무효화
      queryClient.invalidateQueries({
        queryKey: ["classCompositions"],
      });
    },
  });
}

// 시간 구성 삭제
export function useDeleteClassComposition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteClassComposition,
    onSuccess: () => {
      // 모든 시간 구성 목록 무효화
      queryClient.invalidateQueries({
        queryKey: ["classCompositions"],
      });
      // 수업 목록도 무효화 (class_composition 데이터 포함)
      queryClient.invalidateQueries({
        queryKey: classKeys.all,
      });

      toast.success("시간표가 성공적으로 삭제되었습니다.");
    },
    onError: (error: Error) => {
      toast.error(error.message || "시간표 삭제 중 오류가 발생했습니다.");
    },
  });
}
