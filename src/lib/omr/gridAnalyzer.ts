// OMR 그리드 분석 및 답안 매핑

import { Circle, OMRGrid, StudentAnswers, ImageProcessingConfig, DEFAULT_CONFIG } from "@/types/omr";

/**
 * 검출된 원들을 2D 그리드로 정렬
 */
export function organizeCirclesIntoGrid(
  circles: Circle[],
  config: ImageProcessingConfig = DEFAULT_CONFIG
): OMRGrid {
  if (circles.length === 0) {
    return [];
  }

  // 1. Y 좌표 기준으로 행(row) 그룹화
  const rows = groupByProximity(circles, "y", config.gridTolerance);

  // 2. 각 행에서 X 좌표 기준으로 정렬
  const grid = rows.map((row) => {
    return row.sort((a, b) => a.x - b.x);
  });

  return grid;
}

/**
 * 근접한 값들을 그룹화 (행 또는 열 그룹화)
 */
function groupByProximity(
  items: Circle[],
  axis: "x" | "y",
  threshold: number
): Circle[][] {
  if (items.length === 0) {
    return [];
  }

  // 축 기준으로 정렬
  const sorted = [...items].sort((a, b) => a[axis] - b[axis]);

  const groups: Circle[][] = [];
  let currentGroup: Circle[] = [sorted[0]];

  for (let i = 1; i < sorted.length; i++) {
    const diff = Math.abs(sorted[i][axis] - sorted[i - 1][axis]);

    if (diff < threshold) {
      // 같은 그룹에 추가
      currentGroup.push(sorted[i]);
    } else {
      // 새로운 그룹 시작
      groups.push(currentGroup);
      currentGroup = [sorted[i]];
    }
  }

  // 마지막 그룹 추가
  groups.push(currentGroup);

  return groups;
}

/**
 * 그리드를 학생 답안으로 매핑
 * @param grid 2D 그리드
 * @param optionsPerQuestion 문제당 선택지 개수 (기본: 5지선다)
 */
export function mapGridToAnswers(
  grid: OMRGrid,
  optionsPerQuestion: number = 5
): StudentAnswers {
  const answers: StudentAnswers = {};

  let questionNumber = 1;

  for (const row of grid) {
    // 각 행을 선택지 개수만큼 묶어서 하나의 문제로 처리
    for (let i = 0; i < row.length; i += optionsPerQuestion) {
      const options = row.slice(i, i + optionsPerQuestion);

      // 실제로 선택지가 있는 경우만 처리
      if (options.length === 0) {
        continue;
      }

      // 마킹된 선택지 찾기
      const markedIndices = options
        .map((opt, idx) => (opt.filled ? idx : -1))
        .filter((idx) => idx !== -1);

      if (markedIndices.length === 1) {
        // 정상적으로 하나만 마킹됨
        answers[questionNumber] = String(markedIndices[0] + 1);
      } else if (markedIndices.length > 1) {
        // 중복 마킹 (에러)
        answers[questionNumber] = "MULTIPLE";
      }
      // markedIndices.length === 0 이면 미응답 (답안에 추가하지 않음)

      questionNumber++;
    }
  }

  return answers;
}

/**
 * 그리드 유효성 검증
 */
export function validateGrid(
  grid: OMRGrid,
  optionsPerQuestion: number = 5
): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (grid.length === 0) {
    errors.push("그리드가 비어있습니다.");
    return { isValid: false, errors, warnings };
  }

  // 각 행의 원 개수 확인
  for (let i = 0; i < grid.length; i++) {
    const row = grid[i];

    if (row.length === 0) {
      warnings.push(`${i + 1}번째 행이 비어있습니다.`);
      continue;
    }

    // 선택지 개수의 배수인지 확인
    if (row.length % optionsPerQuestion !== 0) {
      warnings.push(
        `${i + 1}번째 행의 원 개수(${row.length})가 선택지 개수(${optionsPerQuestion})의 배수가 아닙니다.`
      );
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * 그리드 구조 분석 (디버깅용)
 */
export function analyzeGridStructure(grid: OMRGrid): {
  totalRows: number;
  totalCircles: number;
  averageCirclesPerRow: number;
  estimatedQuestions: number;
  optionsPerQuestion: number;
} {
  const totalRows = grid.length;
  const totalCircles = grid.reduce((sum, row) => sum + row.length, 0);
  const averageCirclesPerRow =
    totalRows > 0 ? totalCircles / totalRows : 0;

  // 가장 흔한 행 길이를 선택지 개수로 추정
  const rowLengths = grid.map((row) => row.length);
  const optionsPerQuestion = mostCommon(rowLengths) || 5;

  const estimatedQuestions = Math.floor(totalCircles / optionsPerQuestion);

  return {
    totalRows,
    totalCircles,
    averageCirclesPerRow,
    estimatedQuestions,
    optionsPerQuestion,
  };
}

/**
 * 배열에서 가장 흔한 값 찾기
 */
function mostCommon(arr: number[]): number | null {
  if (arr.length === 0) return null;

  const counts = new Map<number, number>();

  for (const value of arr) {
    counts.set(value, (counts.get(value) || 0) + 1);
  }

  let maxCount = 0;
  let mostCommonValue: number | null = null;

  for (const [value, count] of counts.entries()) {
    if (count > maxCount) {
      maxCount = count;
      mostCommonValue = value;
    }
  }

  return mostCommonValue;
}
