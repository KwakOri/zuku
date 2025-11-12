/**
 * OMR 답안 검출 API Route (채점하지 않음)
 * POST /api/omr/detect
 */

import { NextRequest, NextResponse } from "next/server";
import { detectAnswers } from "@/services/server/omrService";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const scan = formData.get("scan") as File | null;
    const method = (formData.get("method") as "sift" | "contour") || "sift";
    const threshold = parseFloat(
      (formData.get("threshold") as string) || "0.35"
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
    const result = await detectAnswers(scan, method, threshold);

    return NextResponse.json(result);
  } catch (error) {
    console.error("OMR Detect API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "답안 검출에 실패했습니다.",
        detail: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
