/**
 * OMR 이미지 정렬 API Route
 * POST /api/omr/align
 */

import { NextRequest, NextResponse } from "next/server";
import { alignImage } from "@/services/server/omrService";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const scan = formData.get("scan") as File | null;
    const method = (formData.get("method") as "sift" | "contour") || "sift";
    const enhance = formData.get("enhance") === "true";
    const returnImage = formData.get("return_image") === "true";

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

    // Python API 호출
    const result = await alignImage(scan, method, enhance, returnImage);

    // 이미지 반환
    if (returnImage && result instanceof Blob) {
      return new NextResponse(result, {
        headers: {
          "Content-Type": "image/png",
        },
      });
    }

    // JSON 응답
    return NextResponse.json(result);
  } catch (error) {
    console.error("OMR Align API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "이미지 정렬에 실패했습니다.",
        detail: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
