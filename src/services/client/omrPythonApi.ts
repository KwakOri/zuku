/**
 * Python OMR API 클라이언트 서비스
 * Next.js API Route를 통해 Python OMR API를 호출하는 함수들
 */

import {
  PythonAlignResponse,
  PythonDetectResponse,
  PythonGradingResponse,
  PythonBatchGradeResponse,
} from "@/types/omr";

/**
 * 이미지 정렬 API 호출
 */
export async function alignImage(
  imageFile: File,
  method: "sift" | "contour" = "sift",
  enhance: boolean = true,
  returnImage: boolean = false
): Promise<PythonAlignResponse | Blob> {
  const formData = new FormData();
  formData.append("scan", imageFile);
  formData.append("method", method);
  formData.append("enhance", enhance.toString());
  formData.append("return_image", returnImage.toString());

  const response = await fetch("/api/omr/python/align", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || errorData.error || "이미지 정렬에 실패했습니다.");
  }

  // 이미지 반환인 경우
  if (returnImage) {
    return await response.blob();
  }

  // JSON 응답
  return await response.json();
}

/**
 * OMR 답안 검출 API 호출 (채점하지 않음)
 */
export async function detectAnswers(
  imageFile: File,
  method: "sift" | "contour" = "sift",
  threshold: number = 0.35
): Promise<PythonDetectResponse> {
  const formData = new FormData();
  formData.append("scan", imageFile);
  formData.append("method", method);
  formData.append("threshold", threshold.toString());

  const response = await fetch("/api/omr/python/detect", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || errorData.error || "답안 검출에 실패했습니다.");
  }

  return await response.json();
}

/**
 * OMR 자동 채점 API 호출
 */
export async function gradeExam(
  imageFile: File,
  answerKey: number[],
  method: "sift" | "contour" = "sift",
  threshold: number = 0.35,
  scorePerQuestion: number = 1.0
): Promise<PythonGradingResponse> {
  const formData = new FormData();
  formData.append("scan", imageFile);
  formData.append("answer_key", JSON.stringify(answerKey));
  formData.append("method", method);
  formData.append("threshold", threshold.toString());
  formData.append("score_per_question", scorePerQuestion.toString());

  const response = await fetch("/api/omr/python/grade", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || errorData.error || "채점에 실패했습니다.");
  }

  return await response.json();
}

/**
 * 배치 채점 API 호출
 */
export async function batchGradeExams(
  imageFiles: File[],
  answerKey: number[],
  method: "sift" | "contour" = "sift",
  threshold: number = 0.35,
  scorePerQuestion: number = 1.0
): Promise<PythonBatchGradeResponse> {
  const formData = new FormData();

  // 여러 이미지 추가
  imageFiles.forEach((file) => {
    formData.append("scans", file);
  });

  formData.append("answer_key", JSON.stringify(answerKey));
  formData.append("method", method);
  formData.append("threshold", threshold.toString());
  formData.append("score_per_question", scorePerQuestion.toString());

  const response = await fetch("/api/omr/python/batch-grade", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || errorData.error || "배치 채점에 실패했습니다.");
  }

  return await response.json();
}
