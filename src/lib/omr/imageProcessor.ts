// OMR 이미지 처리 유틸리티

import sharp from "sharp";
import {
  Circle,
  ImageProcessingConfig,
  DEFAULT_CONFIG,
} from "@/types/omr";

/**
 * 이미지에서 모든 원형 마킹 영역을 자동으로 검출
 */
export async function detectAllCircles(
  imageBuffer: Buffer,
  config: ImageProcessingConfig = DEFAULT_CONFIG
): Promise<Circle[]> {
  // 1. 이미지 전처리 (그레이스케일 + 이진화)
  const { data, info } = await sharp(imageBuffer)
    .greyscale()
    .threshold(config.threshold)
    .raw()
    .toBuffer({ resolveWithObject: true });

  const circles: Circle[] = [];
  const stepSize = 5; // 슬라이딩 윈도우 스텝 (최적화)

  // 2. 슬라이딩 윈도우로 원형 패턴 검색
  for (
    let y = 0;
    y < info.height - config.maxCircleRadius * 2;
    y += stepSize
  ) {
    for (
      let x = 0;
      x < info.width - config.maxCircleRadius * 2;
      x += stepSize
    ) {
      const radius = Math.floor(
        (config.minCircleRadius + config.maxCircleRadius) / 2
      );

      if (isCircularRegion(data, info.width, x + radius, y + radius, radius)) {
        const filled = isRegionFilled(
          data,
          info.width,
          x,
          y,
          radius * 2,
          radius * 2,
          config.fillThreshold
        );

        circles.push({
          x: x + radius,
          y: y + radius,
          radius,
          filled,
        });

        // 중복 검출 방지: 검출된 원 주변은 스킵
        x += radius * 2;
      }
    }
  }

  // 3. 중복 제거 (너무 가까운 원들)
  return removeDuplicateCircles(circles, config.minCircleRadius);
}

/**
 * 특정 영역이 원형 패턴인지 확인
 */
function isCircularRegion(
  pixels: Buffer,
  width: number,
  centerX: number,
  centerY: number,
  radius: number
): boolean {
  const samples = 16; // 16방향 샘플링
  let edgePixels = 0;

  for (let i = 0; i < samples; i++) {
    const angle = (Math.PI * 2 * i) / samples;
    const x = Math.round(centerX + Math.cos(angle) * radius);
    const y = Math.round(centerY + Math.sin(angle) * radius);

    const idx = y * width + x;

    // 이미지 범위 체크
    if (idx >= 0 && idx < pixels.length) {
      // 픽셀이 어두우면 (원의 테두리로 간주)
      if (pixels[idx] < 128) {
        edgePixels++;
      }
    }
  }

  // 원의 둘레가 60% 이상 어두우면 원형으로 판단
  return edgePixels / samples > 0.6;
}

/**
 * 영역 내부가 채워져 있는지 확인 (마킹 여부 판단)
 */
function isRegionFilled(
  pixels: Buffer,
  imgWidth: number,
  x: number,
  y: number,
  w: number,
  h: number,
  threshold: number
): boolean {
  let darkPixels = 0;
  let totalPixels = 0;

  for (let py = y; py < y + h; py++) {
    for (let px = x; px < x + w; px++) {
      const idx = py * imgWidth + px;

      if (idx >= 0 && idx < pixels.length) {
        const pixelValue = pixels[idx];

        if (pixelValue < 128) {
          darkPixels++;
        }
        totalPixels++;
      }
    }
  }

  if (totalPixels === 0) return false;

  // threshold 이상 어두우면 마킹된 것으로 판단
  return darkPixels / totalPixels > threshold;
}

/**
 * 중복된 원 제거 (거리 기반)
 */
function removeDuplicateCircles(
  circles: Circle[],
  minDistance: number
): Circle[] {
  const unique: Circle[] = [];

  for (const circle of circles) {
    const isDuplicate = unique.some((existing) => {
      const distance = Math.sqrt(
        Math.pow(circle.x - existing.x, 2) + Math.pow(circle.y - existing.y, 2)
      );
      return distance < minDistance;
    });

    if (!isDuplicate) {
      unique.push(circle);
    }
  }

  return unique;
}

/**
 * 이미지 크기 최적화 (너무 큰 이미지는 리사이징)
 */
export async function optimizeImage(
  imageBuffer: Buffer,
  maxWidth: number = 1200
): Promise<Buffer<ArrayBufferLike>> {
  const metadata = await sharp(imageBuffer).metadata();

  if (!metadata.width || metadata.width <= maxWidth) {
    return imageBuffer;
  }

  return await sharp(imageBuffer).resize({ width: maxWidth }).toBuffer();
}

/**
 * 이미지 회전 보정 (기울어진 스캔 보정)
 * TODO: 향후 구현 (현재는 수직/수평 스캔만 지원)
 */
export async function correctImageRotation(
  imageBuffer: Buffer
): Promise<Buffer<ArrayBufferLike>> {
  // 간단한 자동 회전 (EXIF 기반)
  return await sharp(imageBuffer).rotate().toBuffer();
}
