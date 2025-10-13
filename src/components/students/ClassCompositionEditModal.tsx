"use client";

import { useState, useMemo, useEffect } from "react";
import { X, BookOpen, CheckCircle, AlertCircle, Trash2 } from "lucide-react";
import { useStudentCompositions } from "@/queries/useStudentCompositions";
import { useEnrollComposition, useUnenrollComposition } from "@/queries/useStudentCompositions";
import { Tables } from "@/types/supabase";
import CanvasSchedule from "@/components/common/schedule/CanvasSchedule";
import { ClassBlock } from "@/types/schedule";

interface ClassCompositionEditModalProps {
  classStudentId: string;
  classId: string;
  className: string;
  classColor: string;
  subjectName?: string;
  teacherName?: string;
  studentName: string;
  allCompositions: any[]; // class_composition 전체 목록
  onClose: () => void;
  onSuccess?: () => void;
}

export default function ClassCompositionEditModal({
  classStudentId,
  classId,
  className,
  classColor,
  subjectName,
  teacherName,
  studentName,
  allCompositions,
  onClose,
  onSuccess,
}: ClassCompositionEditModalProps) {
  const [selectedCompositions, setSelectedCompositions] = useState<Set<string>>(new Set());

  // 현재 학생이 등록한 구성들 조회
  const { data: enrolledCompositions = [], isLoading } = useStudentCompositions({
    class_student_id: classStudentId,
  });

  const enrollComposition = useEnrollComposition();
  const unenrollComposition = useUnenrollComposition();

  // 초기 선택 상태 설정
  useEffect(() => {
    if (enrolledCompositions.length > 0) {
      const initialSet = new Set(
        enrolledCompositions.map((ec: any) => ec.composition_id)
      );
      setSelectedCompositions(initialSet);
    }
  }, [enrolledCompositions]);

  // 앞/뒤타임 여부 확인
  const isSplitClass = useMemo(() => {
    const types = allCompositions.map((c) => c.type);
    return types.includes("class") && types.includes("clinic");
  }, [allCompositions]);

  // 시간표 블록으로 변환
  const scheduleBlocks = useMemo((): ClassBlock[] => {
    return allCompositions.map((composition) => {
      // 타입에 따라 색상 결정
      let blockColor = classColor;

      if (composition.type === "class") {
        blockColor = "#ef4444"; // 빨간색 (앞타임)
      } else if (composition.type === "clinic") {
        blockColor = "#3b82f6"; // 파란색 (뒤타임)
      }

      return {
        id: composition.id,
        title: className,
        subject: subjectName || "",
        teacherName: teacherName || "",
        startTime: composition.start_time.substring(0, 5),
        endTime: composition.end_time.substring(0, 5),
        dayOfWeek: composition.day_of_week,
        color: blockColor,
        room: "",
        type: composition.type || undefined,
        isEditable: false,
      };
    });
  }, [allCompositions, className, subjectName, teacherName, classColor]);

  // 앞/뒤타임이 있는 경우 각 타입별로 선택 여부 확인
  const hasSelectedClassComposition = useMemo(() => {
    const compositions = allCompositions.filter((c) =>
      selectedCompositions.has(c.id)
    );
    return compositions.some((c) => c.type === "class");
  }, [allCompositions, selectedCompositions]);

  const hasSelectedClinicComposition = useMemo(() => {
    const compositions = allCompositions.filter((c) =>
      selectedCompositions.has(c.id)
    );
    return compositions.some((c) => c.type === "clinic");
  }, [allCompositions, selectedCompositions]);

  // 변경 사항이 있는지 확인
  const hasChanges = useMemo(() => {
    const currentSet = new Set(
      enrolledCompositions.map((ec: any) => ec.composition_id)
    );
    if (currentSet.size !== selectedCompositions.size) return true;
    for (const id of selectedCompositions) {
      if (!currentSet.has(id)) return true;
    }
    return false;
  }, [enrolledCompositions, selectedCompositions]);

  // 저장 가능 여부 확인
  const canSave = useMemo(() => {
    if (!hasChanges) return false;
    if (selectedCompositions.size === 0) return false;
    if (isSplitClass) {
      return hasSelectedClassComposition && hasSelectedClinicComposition;
    }
    return true;
  }, [hasChanges, selectedCompositions, isSplitClass, hasSelectedClassComposition, hasSelectedClinicComposition]);

  const handleCompositionToggle = (compositionId: string) => {
    setSelectedCompositions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(compositionId)) {
        newSet.delete(compositionId);
      } else {
        newSet.add(compositionId);
      }
      return newSet;
    });
  };

  const handleBlockClick = (block: ClassBlock) => {
    handleCompositionToggle(block.id);
  };

  const handleSave = async () => {
    if (!canSave) return;

    try {
      const currentSet = new Set(
        enrolledCompositions.map((ec: any) => ec.composition_id)
      );

      // 추가할 구성들
      const toAdd = Array.from(selectedCompositions).filter(
        (id) => !currentSet.has(id)
      );

      // 제거할 구성들
      const toRemove = enrolledCompositions.filter(
        (ec: any) => !selectedCompositions.has(ec.composition_id)
      );

      const promises: Promise<any>[] = [];

      // 추가
      toAdd.forEach((compositionId) => {
        promises.push(
          enrollComposition.mutateAsync({
            class_student_id: classStudentId,
            composition_id: compositionId,
            enrolled_date: new Date().toISOString().split("T")[0],
            status: "active",
          })
        );
      });

      // 제거
      toRemove.forEach((ec: any) => {
        promises.push(unenrollComposition.mutateAsync(ec.id));
      });

      await Promise.all(promises);
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Failed to update compositions:", error);
    }
  };

  const handleRemoveFromClass = async () => {
    if (!confirm(`${studentName} 학생을 "${className}" 수업에서 제거하시겠습니까?`)) {
      return;
    }

    try {
      // 모든 등록된 구성 제거
      const promises = enrolledCompositions.map((ec: any) =>
        unenrollComposition.mutateAsync(ec.id)
      );
      await Promise.all(promises);
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Failed to remove from class:", error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden bg-white shadow-xl rounded-2xl">
        {/* Header */}
        <div className="flex items-center justify-between flex-shrink-0 p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">수업 구성 변경</h2>
            <p className="mt-1 text-sm text-gray-600">
              {studentName} 학생의 "{className}" 수업 시간대를 변경합니다
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-8 h-8 transition-colors rounded-lg hover:bg-gray-100"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          {/* 수업 정보 */}
          <div className="p-4 mb-4 rounded-lg bg-gray-50">
            <div className="flex items-center gap-3">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: classColor }}
              />
              <div>
                <h3 className="font-semibold text-gray-900">{className}</h3>
                <p className="text-sm text-gray-600">
                  {teacherName} • {subjectName}
                </p>
              </div>
            </div>
          </div>

          {/* 선택된 시간대 표시 */}
          {isSplitClass && (
            <div className="grid grid-cols-2 gap-3 mb-4">
              {/* 앞타임 카드 */}
              <div className="relative p-4 border-2 border-red-300 rounded-lg bg-red-50">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-semibold text-red-800">앞타임 (정규)</h4>
                  <div className="w-5 h-5 rounded" style={{ backgroundColor: "#ef4444" }}></div>
                </div>
                <div className="min-h-[60px] space-y-1">
                  {allCompositions
                    .filter((c) => c.type === "class" && selectedCompositions.has(c.id))
                    .map((composition) => {
                      const days = ["일", "월", "화", "수", "목", "금", "토"];
                      return (
                        <div
                          key={composition.id}
                          className="px-2 py-1 text-xs font-medium text-red-900 bg-red-100 rounded"
                        >
                          {days[composition.day_of_week]} {composition.start_time.substring(0, 5)} ~ {composition.end_time.substring(0, 5)}
                        </div>
                      );
                    })}
                  {!hasSelectedClassComposition && (
                    <p className="text-xs text-red-600 italic">선택된 시간이 없습니다</p>
                  )}
                </div>
              </div>

              {/* 뒤타임 카드 */}
              <div className="relative p-4 border-2 border-blue-300 rounded-lg bg-blue-50">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-semibold text-blue-800">뒤타임 (클리닉)</h4>
                  <div className="w-5 h-5 rounded" style={{ backgroundColor: "#3b82f6" }}></div>
                </div>
                <div className="min-h-[60px] space-y-1">
                  {allCompositions
                    .filter((c) => c.type === "clinic" && selectedCompositions.has(c.id))
                    .map((composition) => {
                      const days = ["일", "월", "화", "수", "목", "금", "토"];
                      return (
                        <div
                          key={composition.id}
                          className="px-2 py-1 text-xs font-medium text-blue-900 bg-blue-100 rounded"
                        >
                          {days[composition.day_of_week]} {composition.start_time.substring(0, 5)} ~ {composition.end_time.substring(0, 5)}
                        </div>
                      );
                    })}
                  {!hasSelectedClinicComposition && (
                    <p className="text-xs text-blue-600 italic">선택된 시간이 없습니다</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 시간표 */}
          <div className="overflow-hidden border border-gray-200 rounded-lg" style={{ height: "450px", minHeight: "450px" }}>
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="w-6 h-6 border-b-2 rounded-full animate-spin border-primary-600"></div>
              </div>
            ) : scheduleBlocks.length > 0 ? (
              <CanvasSchedule
                key={`schedule-${classStudentId}`}
                customBlocks={scheduleBlocks}
                onBlockClick={handleBlockClick}
                editMode="view"
                showDensity={false}
                selectedBlockIds={Array.from(selectedCompositions)}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <BookOpen className="w-12 h-12 mb-4 text-gray-400" />
                <p className="text-sm font-medium text-gray-700">
                  시간표가 설정되지 않았습니다
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between flex-shrink-0 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={handleRemoveFromClass}
            disabled={unenrollComposition.isPending}
            className="flex items-center gap-2 px-4 py-2 text-red-700 transition-colors bg-white border border-red-300 rounded-lg hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4" />
            수업에서 제거
          </button>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 transition-colors bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              취소
            </button>
            <button
              onClick={handleSave}
              disabled={!canSave || enrollComposition.isPending || unenrollComposition.isPending}
              className="px-4 py-2 text-white transition-all duration-200 bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg hover:from-primary-600 hover:to-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {enrollComposition.isPending || unenrollComposition.isPending
                ? "저장 중..."
                : !hasChanges
                ? "변경사항 없음"
                : "저장"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
