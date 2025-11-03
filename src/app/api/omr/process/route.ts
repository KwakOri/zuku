// OMR 이미지 처리 API

import { NextRequest, NextResponse } from "next/server";
import { optimizeImage, correctImageRotation } from "@/lib/omr/imageProcessor";
import { analyzeOMRWithTemplate, loadTemplate } from "@/lib/omr/templateAnalyzer";
import { OMRProcessResult } from "@/types/omr";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll("images") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        { success: false, error: "이미지 파일이 없습니다." },
        { status: 400 }
      );
    }

    // 템플릿 로드
    const template = await loadTemplate();

    const results: OMRProcessResult[] = [];
    const errors: { fileName: string; error: string }[] = [];

    for (const file of files) {
      try {
        // 파일 크기 검증
        if (file.size > MAX_FILE_SIZE) {
          errors.push({
            fileName: file.name,
            error: "파일 크기가 10MB를 초과합니다.",
          });
          continue;
        }

        // 파일 타입 검증
        if (!file.type.startsWith("image/")) {
          errors.push({
            fileName: file.name,
            error: "이미지 파일이 아닙니다.",
          });
          continue;
        }

        // 이미지 버퍼 변환
        const arrayBuffer = await file.arrayBuffer();
        let imageBuffer: Buffer<ArrayBufferLike> = Buffer.from(arrayBuffer);

        // 이미지 최적화 (크기 조정)
        imageBuffer = await optimizeImage(imageBuffer);

        // 회전 보정
        imageBuffer = await correctImageRotation(imageBuffer);

        // 템플릿 기반 OMR 분석
        const analysisResult = await analyzeOMRWithTemplate(imageBuffer, template);

        // 결과 저장
        results.push({
          fileName: file.name,
          answers: analysisResult.answers,
          totalDetected: Object.keys(analysisResult.answers).length,
          processedAt: new Date(),
          alignedImageBase64: analysisResult.alignedImageBase64,
          detectedAngle: analysisResult.detectedAngle,
          alignmentSuccess: analysisResult.alignmentSuccess,
        });
      } catch (error) {
        console.error(`파일 처리 오류 [${file.name}]:`, error);
        errors.push({
          fileName: file.name,
          error:
            error instanceof Error
              ? error.message
              : "파일 처리 중 오류가 발생했습니다.",
        });
      }
    }

    return NextResponse.json({
      success: true,
      results,
      errors: errors.length > 0 ? errors : undefined,
      summary: {
        total: files.length,
        succeeded: results.length,
        failed: errors.length,
      },
    });
  } catch (error) {
    console.error("OMR 처리 API 오류:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "OMR 처리 중 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}
