// 템플릿 기반 OMR 분석
import sharp from "sharp";
import { OMRTemplate, OMRMarkerPosition } from "@/types/omr";
import { detectAlignmentMarkers, alignImage } from "./alignmentMarkers";

/**
 * 템플릿 기반으로 OMR 이미지 분석
 */
export async function analyzeOMRWithTemplate(
  imageBuffer: Buffer,
  template: OMRTemplate
): Promise<{
  answers: { [questionNumber: number]: string };
  alignedImageBase64: string;
  detectedAngle: number;
  alignmentSuccess: boolean;
}> {
  const answers: { [questionNumber: number]: string } = {};

  // 1단계: 정렬 마커 검출 및 이미지 정렬
  console.log("🔍 정렬 마커 검출 시작...");
  const alignmentResult = await detectAlignmentMarkers(imageBuffer);

  let processedBuffer = imageBuffer;
  let detectedAngle = 0;
  let alignmentSuccess = false;

  if (alignmentResult.aligned) {
    console.log("✓ 정렬 마커 검출 완료");
    processedBuffer = await alignImage(imageBuffer, alignmentResult);
    console.log("✓ 이미지 정렬 완료");
    detectedAngle = alignmentResult.angle;
    alignmentSuccess = true;
  } else {
    console.warn("⚠ 정렬 마커를 찾지 못했습니다. 원본 이미지로 진행합니다.");
  }

  // 2단계: 정렬된 이미지로 분석
  const image = sharp(processedBuffer);
  const metadata = await image.metadata();

  if (!metadata.width || !metadata.height) {
    throw new Error("이미지 메타데이터를 읽을 수 없습니다.");
  }

  const imgWidth = metadata.width;
  const imgHeight = metadata.height;

  // 그레이스케일로 변환하여 픽셀 데이터 추출
  const { data } = await image
    .greyscale()
    .raw()
    .toBuffer({ resolveWithObject: true });

  // 각 문항별로 분석
  for (let q = 1; q <= template.totalQuestions; q++) {
    const questionMarkers = template.markers.filter(
      (m) => m.questionNumber === q
    );

    if (questionMarkers.length === 0) continue;

    // 각 선택지의 밝기 값 계산
    const optionDarkness: { option: number; darkness: number }[] = [];

    for (const marker of questionMarkers) {
      const darkness = await calculateMarkerDarkness(
        data,
        imgWidth,
        imgHeight,
        marker
      );

      optionDarkness.push({
        option: marker.optionNumber,
        darkness,
      });
    }

    // 가장 어두운 (마킹된) 선택지 찾기
    optionDarkness.sort((a, b) => a.darkness - b.darkness);

    // 임계값: 가장 어두운 것과 두 번째로 어두운 것의 차이가 충분히 큰지 확인
    const darkest = optionDarkness[0];
    const secondDarkest = optionDarkness[1];

    // 디버그 로그 (처음 3문항만)
    if (q <= 3) {
      console.log(`[문항 ${q}] 밝기값:`, optionDarkness.map(o => `${o.option}번=${o.darkness.toFixed(1)}`).join(", "));
    }

    // 마킹 판단 기준:
    // 1. 가장 어두운 값이 임계값(예: 180) 이하
    // 2. 두 번째와의 차이가 충분히 큼 (예: 30 이상)
    const MARKING_THRESHOLD = 180; // 0-255 범위, 낮을수록 어두움
    const DIFFERENCE_THRESHOLD = 30;

    if (
      darkest.darkness < MARKING_THRESHOLD &&
      secondDarkest.darkness - darkest.darkness > DIFFERENCE_THRESHOLD
    ) {
      answers[q] = darkest.option.toString();
      if (q <= 3) {
        console.log(`[문항 ${q}] ✓ 마킹 인식: ${darkest.option}번 (차이: ${(secondDarkest.darkness - darkest.darkness).toFixed(1)})`);
      }
    } else {
      if (q <= 3) {
        console.log(`[문항 ${q}] ✗ 미인식: 가장 어두움=${darkest.darkness.toFixed(1)}, 차이=${(secondDarkest.darkness - darkest.darkness).toFixed(1)}`);
      }
    }
    // 마킹이 없거나 불분명한 경우 빈 문자열
  }

  // 정렬된 이미지를 base64로 변환
  const alignedImageBase64 = processedBuffer.toString("base64");

  return {
    answers,
    alignedImageBase64,
    detectedAngle,
    alignmentSuccess,
  };
}

/**
 * 특정 마커 영역의 어두운 정도 계산 (평균 픽셀 값)
 */
async function calculateMarkerDarkness(
  pixelData: Buffer,
  imgWidth: number,
  imgHeight: number,
  marker: OMRMarkerPosition
): Promise<number> {
  // 퍼센트를 픽셀 좌표로 변환
  const x = Math.floor((marker.x / 100) * imgWidth);
  const y = Math.floor((marker.y / 100) * imgHeight);
  const width = Math.floor((marker.width / 100) * imgWidth);
  const height = Math.floor((marker.height / 100) * imgHeight);

  let totalBrightness = 0;
  let pixelCount = 0;

  // 마커 영역의 픽셀들을 샘플링
  for (let py = y; py < y + height && py < imgHeight; py++) {
    for (let px = x; px < x + width && px < imgWidth; px++) {
      const index = py * imgWidth + px;
      if (index < pixelData.length) {
        totalBrightness += pixelData[index];
        pixelCount++;
      }
    }
  }

  // 평균 밝기 반환 (0~255, 낮을수록 어두움)
  return pixelCount > 0 ? totalBrightness / pixelCount : 255;
}

/**
 * 템플릿 로드 (JSON 파일 또는 기본 템플릿)
 */
export async function loadTemplate(
  templatePath?: string
): Promise<OMRTemplate> {
  if (templatePath) {
    // 사용자 정의 템플릿 로드
    const fs = await import("fs/promises");
    const path = await import("path");
    const fullPath = path.join(process.cwd(), "public", templatePath);
    const templateJson = await fs.readFile(fullPath, "utf-8");
    return JSON.parse(templateJson);
  } else {
    // 기본 템플릿 로드
    const fs = await import("fs/promises");
    const path = await import("path");
    const defaultPath = path.join(process.cwd(), "public", "omr-template.json");
    const templateJson = await fs.readFile(defaultPath, "utf-8");
    return JSON.parse(templateJson);
  }
}
