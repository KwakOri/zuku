/**
 * Python OMR API React Query Hooks
 */

import { useMutation } from "@tanstack/react-query";
import {
  alignImage,
  detectAnswers,
  gradeExam,
  batchGradeExams,
} from "@/services/client/omrPythonApi";
import {
  PythonAlignResponse,
  PythonDetectResponse,
  PythonGradingResponse,
  PythonBatchGradeResponse,
} from "@/types/omr";

/**
 * 이미지 정렬 Mutation
 */
export function useAlignImage() {
  return useMutation({
    mutationFn: ({
      imageFile,
      method = "sift",
      enhance = true,
      returnImage = false,
    }: {
      imageFile: File;
      method?: "sift" | "contour";
      enhance?: boolean;
      returnImage?: boolean;
    }) => alignImage(imageFile, method, enhance, returnImage),
    onError: (error: Error) => {
      console.error("이미지 정렬 실패:", error);
    },
  });
}

/**
 * OMR 답안 검출 Mutation
 */
export function useDetectAnswers() {
  return useMutation({
    mutationFn: ({
      imageFile,
      method = "sift",
      threshold = 0.35,
    }: {
      imageFile: File;
      method?: "sift" | "contour";
      threshold?: number;
    }) => detectAnswers(imageFile, method, threshold),
    onError: (error: Error) => {
      console.error("답안 검출 실패:", error);
    },
  });
}

/**
 * OMR 자동 채점 Mutation
 */
export function useGradeExam() {
  return useMutation({
    mutationFn: ({
      imageFile,
      answerKey,
      method = "sift",
      threshold = 0.35,
      scorePerQuestion = 1.0,
    }: {
      imageFile: File;
      answerKey: number[];
      method?: "sift" | "contour";
      threshold?: number;
      scorePerQuestion?: number;
    }) => gradeExam(imageFile, answerKey, method, threshold, scorePerQuestion),
    onError: (error: Error) => {
      console.error("채점 실패:", error);
    },
  });
}

/**
 * 배치 채점 Mutation
 */
export function useBatchGradeExams() {
  return useMutation({
    mutationFn: ({
      imageFiles,
      answerKey,
      method = "sift",
      threshold = 0.35,
      scorePerQuestion = 1.0,
    }: {
      imageFiles: File[];
      answerKey: number[];
      method?: "sift" | "contour";
      threshold?: number;
      scorePerQuestion?: number;
    }) =>
      batchGradeExams(imageFiles, answerKey, method, threshold, scorePerQuestion),
    onError: (error: Error) => {
      console.error("배치 채점 실패:", error);
    },
  });
}
