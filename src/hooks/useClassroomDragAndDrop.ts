import { useCallback, useState } from "react";
import { ClassBlock } from "@/types/schedule";

export interface DragState {
  isDragging: boolean;
  dragType: "class" | "student" | null;
  draggedBlock: ClassBlock | null;
  draggedStudent: { id: string; name: string; grade: number | null } | null;
  sourceRoom: number | null; // 0-based (0 = 1강의실)
  sourceTime: string | null;
}

export interface DropResult {
  targetRoom: number; // 0-based
  targetTime: string;
  changedRoom: boolean;
  changedTime: boolean;
}

export function useClassroomDragAndDrop() {
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    dragType: null,
    draggedBlock: null,
    draggedStudent: null,
    sourceRoom: null,
    sourceTime: null,
  });

  // 수업 카드 드래그 시작
  const handleClassDragStart = useCallback((block: ClassBlock) => {
    setDragState({
      isDragging: true,
      dragType: "class",
      draggedBlock: block,
      draggedStudent: null,
      sourceRoom: block.dayOfWeek, // dayOfWeek가 room index로 사용됨
      sourceTime: block.startTime,
    });
  }, []);

  // 학생 블록 드래그 시작
  const handleStudentDragStart = useCallback(
    (
      student: { id: string; name: string; grade: number | null },
      block: ClassBlock
    ) => {
      setDragState({
        isDragging: true,
        dragType: "student",
        draggedBlock: block, // 원본 수업 정보
        draggedStudent: student,
        sourceRoom: block.dayOfWeek,
        sourceTime: block.startTime,
      });
    },
    []
  );

  // 드래그 종료 및 드롭 처리
  const handleDrop = useCallback(
    (targetRoom: number, targetTime: string): DropResult | null => {
      if (!dragState.isDragging) return null;

      const result: DropResult = {
        targetRoom,
        targetTime,
        changedRoom: dragState.sourceRoom !== targetRoom,
        changedTime: dragState.sourceTime !== targetTime,
      };

      // 변경사항이 없으면 null 반환
      if (!result.changedRoom && !result.changedTime) {
        resetDrag();
        return null;
      }

      return result;
    },
    [dragState]
  );

  // 드래그 취소
  const resetDrag = useCallback(() => {
    setDragState({
      isDragging: false,
      dragType: null,
      draggedBlock: null,
      draggedStudent: null,
      sourceRoom: null,
      sourceTime: null,
    });
  }, []);

  return {
    dragState,
    handleClassDragStart,
    handleStudentDragStart,
    handleDrop,
    resetDrag,
  };
}
