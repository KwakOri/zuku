import { OMRTemplate, OMRMarkerPosition } from "@/types/omr";

// ===== 여기서 좌표를 수정하세요 =====
const GRID_CONFIG = {
  // 선택지 간 간격 (%)
  horizontalSpacing: 1.48, // 가로 간격
  verticalSpacing: 3.76, // 세로 간격

  // 마커 크기 (%)
  markerWidth: 1.4,
  markerHeight: 2,

  // 각 열의 설정
  columns: [
    { start: 1, end: 20, startX: 59.4, startY: 17.92 },   // 1열
    { start: 21, end: 34, startX: 72.4, startY: 17.92 },  // 2열
    { start: 35, end: 45, startX: 84.5, startY: 17.92 },  // 3열
  ],
};
// =====================================

// 마커 자동 생성
function generateMarkers(): OMRMarkerPosition[] {
  const markers: OMRMarkerPosition[] = [];
  const optionsPerQuestion = 5; // 선택지 개수 (1~5)

  GRID_CONFIG.columns.forEach((column) => {
    for (let q = column.start; q <= column.end; q++) {
      const indexInColumn = q - column.start;

      for (let opt = 1; opt <= optionsPerQuestion; opt++) {
        markers.push({
          questionNumber: q,
          optionNumber: opt,
          x: column.startX + (opt - 1) * GRID_CONFIG.horizontalSpacing,
          y: column.startY + indexInColumn * GRID_CONFIG.verticalSpacing,
          width: GRID_CONFIG.markerWidth,
          height: GRID_CONFIG.markerHeight,
        });
      }
    }
  });

  return markers;
}

// 기본 템플릿 export
export const DEFAULT_OMR_TEMPLATE: OMRTemplate = {
  name: "기본 OMR 템플릿 (45문항)",
  totalQuestions: 45,
  optionsPerQuestion: 5,
  imageUrl: "/omr_card.jpg",
  markers: generateMarkers(),
  alignmentMarkers: [
    // 오른쪽 하단 상단 마커
    { x: 94, y: 90, width: 2, height: 3 },
    // 오른쪽 하단 하단 마커
    { x: 94, y: 95, width: 2, height: 3 },
  ],
};
