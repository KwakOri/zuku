/**
 * OMR 배치 채점 API Route
 * POST /api/omr/batch-grade
 */

import { NextRequest, NextResponse } from "next/server";
import { batchGradeExams } from "@/services/server/omrService";

export async function POST(request: NextRequest) {
  console.log("=== API Route: Batch Grade Started ===");

  try {
    const formData = await request.formData();
    const scans = formData.getAll("scans") as File[];
    const answerKeyStr = formData.get("answer_key") as string | null;
    const method = (formData.get("method") as "sift" | "contour") || "sift";
    const threshold = parseFloat(
      (formData.get("threshold") as string) || "0.35"
    );
    const scorePerQuestion = parseFloat(
      (formData.get("score_per_question") as string) || "1.0"
    );

    console.log("Received files:", scans.length);
    console.log("Answer key string:", answerKeyStr);
    console.log("Method:", method);
    console.log("Threshold:", threshold);

    // 유효성 검사
    if (!scans || scans.length === 0) {
      return NextResponse.json(
        { success: false, error: "scans 파라미터는 필수입니다." },
        { status: 400 }
      );
    }

    // 모든 파일이 File 인스턴스인지 확인
    const allFilesValid = scans.every((scan) => scan instanceof File);
    if (!allFilesValid) {
      return NextResponse.json(
        { success: false, error: "scans는 이미지 파일들이어야 합니다." },
        { status: 400 }
      );
    }

    if (!answerKeyStr) {
      return NextResponse.json(
        { success: false, error: "answer_key 파라미터는 필수입니다." },
        { status: 400 }
      );
    }

    // 정답 배열 파싱
    let answerKey: number[];
    try {
      answerKey = JSON.parse(answerKeyStr);
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: "answer_key는 유효한 JSON 배열이어야 합니다.",
        },
        { status: 400 }
      );
    }

    if (!Array.isArray(answerKey)) {
      return NextResponse.json(
        { success: false, error: "answer_key는 배열이어야 합니다." },
        { status: 400 }
      );
    }

    if (answerKey.length !== 45) {
      return NextResponse.json(
        {
          success: false,
          error: "answer_key는 45개의 정답을 포함해야 합니다.",
        },
        { status: 400 }
      );
    }

    // 정답이 모두 1~5 범위인지 확인
    const isValidAnswers = answerKey.every(
      (ans) => Number.isInteger(ans) && ans >= 1 && ans <= 5
    );
    if (!isValidAnswers) {
      return NextResponse.json(
        {
          success: false,
          error: "answer_key의 모든 값은 1~5 사이의 정수여야 합니다.",
        },
        { status: 400 }
      );
    }

    if (threshold < 0 || threshold > 1) {
      return NextResponse.json(
        {
          success: false,
          error: "threshold는 0.0 ~ 1.0 사이의 값이어야 합니다.",
        },
        { status: 400 }
      );
    }

    console.log("All validations passed. Calling Python API...");

    // Python API 호출
    const result = await batchGradeExams(
      scans,
      answerKey,
      method,
      threshold,
      scorePerQuestion
    );

    console.log("Python API call successful");
    console.log("Result summary:", {
      success: result.success,
      total: result.total,
      successful: result.successful,
      failed: result.failed,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("=== OMR Batch Grade API Error ===");
    console.error("Error type:", error?.constructor?.name);
    console.error("Error message:", error instanceof Error ? error.message : "Unknown error");
    console.error("Full error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "배치 채점에 실패했습니다.",
        detail: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
