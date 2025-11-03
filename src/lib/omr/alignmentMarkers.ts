// OMR 답안지 정렬 마커 검출 및 정렬
import sharp from "sharp";

export interface AlignmentMarker {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface AlignmentResult {
  markers: AlignmentMarker[];
  angle: number; // 회전 각도 (도)
  aligned: boolean;
}

/**
 * 오른쪽 하단 영역에서 정렬 마커 검출
 */
export async function detectAlignmentMarkers(
  imageBuffer: Buffer
): Promise<AlignmentResult> {
  const image = sharp(imageBuffer);
  const metadata = await image.metadata();

  if (!metadata.width || !metadata.height) {
    throw new Error("이미지 메타데이터를 읽을 수 없습니다.");
  }

  const width = metadata.width;
  const height = metadata.height;

  // 오른쪽 하단 영역만 추출 (전체의 10% x 20% 영역)
  const searchWidth = Math.floor(width * 0.1);
  const searchHeight = Math.floor(height * 0.2);
  const searchLeft = width - searchWidth;
  const searchTop = height - searchHeight;

  // 해당 영역을 추출하고 이진화
  const { data } = await image
    .extract({
      left: searchLeft,
      top: searchTop,
      width: searchWidth,
      height: searchHeight,
    })
    .greyscale()
    .threshold(128) // 이진화: 128 이하는 0(검정), 초과는 255(흰색)
    .raw()
    .toBuffer({ resolveWithObject: true });

  // 검은 영역(blob) 찾기
  const blobs = findBlobs(data, searchWidth, searchHeight);

  if (blobs.length < 2) {
    console.warn(
      `정렬 마커를 충분히 찾지 못했습니다. (발견: ${blobs.length}개)`
    );
    return {
      markers: [],
      angle: 0,
      aligned: false,
    };
  }

  // 크기 순으로 정렬하여 가장 큰 2개 선택
  blobs.sort((a, b) => b.area - a.area);
  const topMarkers = blobs.slice(0, 2);

  // 원본 이미지 좌표로 변환
  const markers: AlignmentMarker[] = topMarkers.map((blob) => ({
    x: searchLeft + blob.centerX,
    y: searchTop + blob.centerY,
    width: blob.width,
    height: blob.height,
  }));

  // Y 좌표 기준으로 정렬 (위쪽 마커가 먼저)
  markers.sort((a, b) => a.y - b.y);

  // 두 마커 사이의 각도 계산
  const [topMarker, bottomMarker] = markers;
  const dx = bottomMarker.x - topMarker.x;
  const dy = bottomMarker.y - topMarker.y;
  const angleRad = Math.atan2(dx, dy); // atan2(x, y)는 세로선 기준
  const angleDeg = (angleRad * 180) / Math.PI;

  console.log(
    `정렬 마커 검출 완료: 각도=${angleDeg.toFixed(2)}°, 마커=${markers.length}개`
  );

  return {
    markers,
    angle: angleDeg,
    aligned: true,
  };
}

/**
 * 이미지를 정렬 마커 기준으로 회전 및 정렬
 */
export async function alignImage(
  imageBuffer: Buffer,
  alignmentResult: AlignmentResult
): Promise<Buffer> {
  if (!alignmentResult.aligned || alignmentResult.markers.length < 2) {
    console.warn("정렬 정보가 없습니다. 원본 이미지를 반환합니다.");
    return imageBuffer;
  }

  const { angle } = alignmentResult;

  // 각도가 너무 작으면 회전하지 않음 (±2도 이내)
  if (Math.abs(angle) < 2) {
    console.log("각도가 충분히 작아 회전을 생략합니다.");
    return imageBuffer;
  }

  // 이미지 회전 (반대 방향으로)
  const rotatedBuffer = await sharp(imageBuffer)
    .rotate(-angle, { background: { r: 255, g: 255, b: 255 } }) // 흰색 배경
    .toBuffer();

  console.log(`이미지 회전 완료: ${angle.toFixed(2)}° → 0°`);

  return rotatedBuffer;
}

/**
 * 간단한 blob 검출 (연결된 검은 픽셀 그룹)
 */
interface Blob {
  centerX: number;
  centerY: number;
  width: number;
  height: number;
  area: number;
}

function findBlobs(
  data: Buffer,
  width: number,
  height: number,
  minArea: number = 50 // 최소 영역 크기
): Blob[] {
  const visited = new Set<number>();
  const blobs: Blob[] = [];

  // 픽셀이 검은색인지 확인
  const isBlack = (x: number, y: number): boolean => {
    const idx = y * width + x;
    return data[idx] === 0; // 0 = 검정
  };

  // BFS로 연결된 검은 픽셀 찾기
  const exploreBlob = (startX: number, startY: number): Blob | null => {
    const queue: [number, number][] = [[startX, startY]];
    const pixels: [number, number][] = [];
    const startIdx = startY * width + startX;

    if (visited.has(startIdx)) return null;
    visited.add(startIdx);

    while (queue.length > 0) {
      const [x, y] = queue.shift()!;
      pixels.push([x, y]);

      // 상하좌우 탐색
      const neighbors = [
        [x - 1, y],
        [x + 1, y],
        [x, y - 1],
        [x, y + 1],
      ];

      for (const [nx, ny] of neighbors) {
        if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue;

        const idx = ny * width + nx;
        if (visited.has(idx)) continue;
        if (!isBlack(nx, ny)) continue;

        visited.add(idx);
        queue.push([nx, ny]);
      }
    }

    if (pixels.length < minArea) return null;

    // Blob의 경계 계산
    const xs = pixels.map((p) => p[0]);
    const ys = pixels.map((p) => p[1]);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);

    return {
      centerX: (minX + maxX) / 2,
      centerY: (minY + maxY) / 2,
      width: maxX - minX,
      height: maxY - minY,
      area: pixels.length,
    };
  };

  // 전체 이미지 스캔
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (isBlack(x, y)) {
        const blob = exploreBlob(x, y);
        if (blob) {
          blobs.push(blob);
        }
      }
    }
  }

  return blobs;
}
