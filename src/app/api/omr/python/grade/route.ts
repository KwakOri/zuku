/**
 * OMR 자동 채점 API Route (Python API 호출)
 * POST /api/omr/python/grade
 */

import { NextRequest, NextResponse } from "next/server";
import { gradeExam } from "@/services/server/omrService";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const scan = formData.get("scan") as File | null;
    const answerKeyStr = formData.get("answer_key") as string | null;
    const method = (formData.get("method") as "sift" | "contour") || "sift";
    const threshold = parseFloat(
      (formData.get("threshold") as string) || "0.35"
    );
    const scorePerQuestion = parseFloat(
      (formData.get("score_per_question") as string) || "1.0"
    );

    // 유효성 검사
    if (!scan) {
      return NextResponse.json(
        { success: false, error: "scan 파라미터는 필수입니다." },
        { status: 400 }
      );
    }

    if (!(scan instanceof File)) {
      return NextResponse.json(
        { success: false, error: "scan은 이미지 파일이어야 합니다." },
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

    // Python API 호출
    const result = await gradeExam(
      scan,
      answerKey,
      method,
      threshold,
      scorePerQuestion
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("OMR Grade API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "채점에 실패했습니다.",
        detail: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
