"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type TooltipPosition = "top" | "bottom" | "left" | "right";

interface MousePosition {
  x: number;
  y: number;
}

interface GridPosition {
  row: 1 | 2 | 3; // 상, 중, 하
  col: 1 | 2 | 3; // 좌, 중, 우
  section: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9; // 분면 번호
}

// 분면에 따른 최적의 툴팁 위치 매핑
const sectionToPosition: Record<number, TooltipPosition> = {
  1: "bottom", // 왼쪽 위 → 아래로
  2: "bottom", // 위쪽 중앙 → 아래로
  3: "bottom", // 오른쪽 위 → 아래로
  4: "right",  // 왼쪽 중앙 → 오른쪽으로
  5: "top",    // 가운데 → 위로 (기본값)
  6: "left",   // 오른쪽 중앙 → 왼쪽으로
  7: "top",    // 왼쪽 아래 → 위로
  8: "top",    // 아래쪽 중앙 → 위로
  9: "top",    // 오른쪽 아래 → 위로
};

export const useTooltipPosition = (
  containerRef: React.RefObject<HTMLElement>,
  debounceMs = 100
) => {
  const [mousePosition, setMousePosition] = useState<MousePosition>({ x: 0, y: 0 });
  const [gridPosition, setGridPosition] = useState<GridPosition>({ row: 2, col: 2, section: 5 });
  const [tooltipPosition, setTooltipPosition] = useState<TooltipPosition>("top");
  
  const debounceTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // 마우스 위치를 9분면으로 변환하는 함수
  const calculateGridPosition = useCallback((
    mouseX: number,
    mouseY: number,
    containerRect: DOMRect
  ): GridPosition => {
    // 컨테이너 내 상대 위치 (0~1)
    const relativeX = (mouseX - containerRect.left) / containerRect.width;
    const relativeY = (mouseY - containerRect.top) / containerRect.height;

    // 3x3 그리드로 분할
    const col = relativeX < 1/3 ? 1 : relativeX < 2/3 ? 2 : 3;
    const row = relativeY < 1/3 ? 1 : relativeY < 2/3 ? 2 : 3;

    // 분면 번호 계산 (1~9)
    const section = ((row - 1) * 3 + col) as GridPosition['section'];

    return { row: row as GridPosition['row'], col: col as GridPosition['col'], section };
  }, []);

  // 마우스 이동 핸들러
  const handleMouseMove = useCallback((event: MouseEvent) => {
    if (!containerRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const newMousePosition = { x: event.clientX, y: event.clientY };

    // debounce 적용
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(() => {
      const newGridPosition = calculateGridPosition(
        event.clientX,
        event.clientY,
        containerRect
      );

      setMousePosition(newMousePosition);
      setGridPosition(newGridPosition);
      setTooltipPosition(sectionToPosition[newGridPosition.section]);
    }, debounceMs);
  }, [containerRef, calculateGridPosition, debounceMs]);

  // 이벤트 리스너 등록/해제
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener("mousemove", handleMouseMove);
    
    return () => {
      container.removeEventListener("mousemove", handleMouseMove);
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [handleMouseMove, containerRef]);

  return {
    mousePosition,
    gridPosition,
    tooltipPosition,
    // 디버깅용 헬퍼 함수들
    getGridDescription: () => {
      const rowNames = { 1: "상단", 2: "중앙", 3: "하단" };
      const colNames = { 1: "왼쪽", 2: "중앙", 3: "오른쪽" };
      return `${rowNames[gridPosition.row]} ${colNames[gridPosition.col]} (${gridPosition.section}분면)`;
    },
    getSectionName: () => {
      const sectionNames = {
        1: "왼쪽 위", 2: "위쪽 중앙", 3: "오른쪽 위",
        4: "왼쪽 중앙", 5: "정중앙", 6: "오른쪽 중앙", 
        7: "왼쪽 아래", 8: "아래쪽 중앙", 9: "오른쪽 아래"
      };
      return sectionNames[gridPosition.section];
    }
  };
};