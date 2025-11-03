// OMR API 클라이언트 서비스

import { OMRProcessResult, AnswerKey, GradingResult } from "@/types/omr";

/**
 * OMR 이미지 처리 API 호출
 */
export async function processOMRImages(
  images: File[]
): Promise<{
  success: boolean;
  results: OMRProcessResult[];
  errors?: { fileName: string; error: string }[];
  summary: {
    total: number;
    succeeded: number;
    failed: number;
  };
}> {
  const formData = new FormData();

  images.forEach((image) => {
    formData.append("images", image);
  });

  const response = await fetch("/api/omr/process", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "OMR 처리에 실패했습니다.");
  }

  return await response.json();
}

/**
 * OMR 채점 API 호출
 */
export async function gradeOMRResults(
  processResults: OMRProcessResult[],
  answerKey: AnswerKey,
  totalQuestions: number
): Promise<{
  success: boolean;
  results: GradingResult[];
  summary: {
    totalStudents: number;
    averageScore: number;
    highestScore: number;
    lowestScore: number;
  };
}> {
  const response = await fetch("/api/omr/grade", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      processResults,
      answerKey,
      totalQuestions,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "채점에 실패했습니다.");
  }

  return await response.json();
}
