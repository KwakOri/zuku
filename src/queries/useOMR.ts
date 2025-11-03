// OMR React Query Hooks

import { useMutation } from "@tanstack/react-query";
import { processOMRImages, gradeOMRResults } from "@/services/client/omrApi";
import { OMRProcessResult, AnswerKey } from "@/types/omr";

/**
 * OMR 이미지 처리 Mutation
 */
export function useProcessOMR() {
  return useMutation({
    mutationFn: (images: File[]) => processOMRImages(images),
    onError: (error: Error) => {
      console.error("OMR 처리 실패:", error);
    },
  });
}

/**
 * OMR 채점 Mutation
 */
export function useGradeOMR() {
  return useMutation({
    mutationFn: ({
      processResults,
      answerKey,
      totalQuestions,
    }: {
      processResults: OMRProcessResult[];
      answerKey: AnswerKey;
      totalQuestions: number;
    }) => gradeOMRResults(processResults, answerKey, totalQuestions),
    onError: (error: Error) => {
      console.error("채점 실패:", error);
    },
  });
}
