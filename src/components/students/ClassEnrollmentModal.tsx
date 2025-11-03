"use client";

import CanvasSchedule from "@/components/common/schedule/CanvasSchedule";
import { useClasses } from "@/queries/useClasses";
import { useEnrollStudent } from "@/queries/useClassStudents";
import { useEnrollComposition } from "@/queries/useStudentCompositions";
import { ClassBlock } from "@/types/schedule";
import { Tables } from "@/types/supabase";
import { AlertCircle, BookOpen, CheckCircle, Search, X } from "lucide-react";
import { useMemo, useState } from "react";

type Class = Tables<"classes"> & {
  subject?: Tables<"subjects"> | null;
  teacher?: Tables<"teachers"> | null;
  class_composition?: Tables<"class_compositions">[];
};

interface ClassEnrollmentModalProps {
  studentId: string;
  studentName: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function ClassEnrollmentModal({
  studentId,
  studentName,
  onClose,
  onSuccess,
}: ClassEnrollmentModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [selectedCompositions, setSelectedCompositions] = useState<Set<string>>(
    new Set()
  );

  const { data: classes = [], isLoading } = useClasses();
  const enrollStudent = useEnrollStudent();
  const enrollComposition = useEnrollComposition();

  const selectedClass = useMemo(
    () => classes.find((c) => c.id === selectedClassId),
    [classes, selectedClassId]
  );

  const isSplitClass = selectedClass?.split_type === "split";

  // 선택된 수업의 시간표를 ClassBlock 형태로 변환
  const scheduleBlocks = useMemo((): ClassBlock[] => {
    if (!selectedClass?.class_composition) return [];

    return selectedClass.class_composition.map((composition) => ({
      id: composition.id,
      classId: selectedClass.id,
      title: selectedClass.title,
      subject: selectedClass.subject?.subject_name || "",
      teacherName: selectedClass.teacher?.name || "",
      startTime: composition.start_time.substring(0, 5),
      endTime: composition.end_time.substring(0, 5),
      dayOfWeek: composition.day_of_week,
      color: selectedClass.color || "#3b82f6",
      room: selectedClass.room || "",
      type: composition.type || undefined,
      isEditable: false,
      studentCount: 0,
    }));
  }, [selectedClass]);

  // 앞/뒤타임이 있는 경우 각 타입별로 composition이 선택되었는지 확인
  const hasSelectedClassComposition = useMemo(() => {
    if (!selectedClass?.class_composition) return false;
    const compositions = selectedClass.class_composition.filter((c) =>
      selectedCompositions.has(c.id)
    );
    return compositions.some((c) => c.type === "class");
  }, [selectedClass, selectedCompositions]);

  const hasSelectedClinicComposition = useMemo(() => {
    if (!selectedClass?.class_composition) return false;
    const compositions = selectedClass.class_composition.filter((c) =>
      selectedCompositions.has(c.id)
    );
    return compositions.some((c) => c.type === "clinic");
  }, [selectedClass, selectedCompositions]);

  // 앞/뒤타임 수업인 경우 둘 다 선택되어야 함
  const canEnroll = useMemo(() => {
    if (!selectedClassId || selectedCompositions.size === 0) return false;
    if (isSplitClass) {
      return hasSelectedClassComposition && hasSelectedClinicComposition;
    }
    return true;
  }, [
    selectedClassId,
    selectedCompositions,
    isSplitClass,
    hasSelectedClassComposition,
    hasSelectedClinicComposition,
  ]);

  const filteredClasses = useMemo(() => {
    return classes.filter((cls) => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        cls.title.toLowerCase().includes(query) ||
        cls.subject?.subject_name?.toLowerCase().includes(query) ||
        cls.teacher?.name.toLowerCase().includes(query)
      );
    });
  }, [classes, searchQuery]);

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

  // 시간표 블록 클릭 핸들러
  const handleBlockClick = (block: ClassBlock) => {
    handleCompositionToggle(block.id);
  };

  const handleEnroll = async () => {
    if (!canEnroll || !selectedClassId) return;

    try {
      // 1단계: class_students 테이블에 학생-수업 관계 생성
      await enrollStudent.mutateAsync({
        class_id: selectedClassId,
        student_id: studentId,
        enrolled_date: new Date().toISOString().split("T")[0],
        status: "active",
      });

      // 2단계: compositions_students 테이블에 선택된 각 composition 등록
      const compositionPromises = Array.from(selectedCompositions).map(
        (compositionId) =>
          enrollComposition.mutateAsync({
            class_id: selectedClassId,
            student_id: studentId,
            composition_id: compositionId,
            enrolled_date: new Date().toISOString().split("T")[0],
            status: "active",
          })
      );

      await Promise.all(compositionPromises);
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Failed to enroll student:", error);
    }
  };

  const getDayOfWeekLabel = (dayOfWeek: number) => {
    return ["일", "월", "화", "수", "목", "금", "토"][dayOfWeek];
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-4xl mx-4 overflow-hidden bg-white shadow-xl rounded-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">수업 등록</h2>
            <p className="mt-1 text-sm text-gray-600">
              {studentName} 학생을 수업에 등록합니다
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
        <div className="flex" style={{ height: "600px" }}>
          {/* Left: Class List */}
          <div className="w-80 p-6 border-r border-gray-200 overflow-y-auto">
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                <input
                  type="text"
                  placeholder="수업 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full py-2 pl-10 pr-4 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="space-y-2">
              {isLoading ? (
                <div className="py-8 text-center">
                  <div className="w-6 h-6 mx-auto border-b-2 rounded-full animate-spin border-primary-600"></div>
                </div>
              ) : filteredClasses.length === 0 ? (
                <p className="py-8 text-sm text-center text-gray-500">
                  {searchQuery
                    ? "검색 결과가 없습니다."
                    : "등록 가능한 수업이 없습니다."}
                </p>
              ) : (
                filteredClasses.map((cls) => (
                  <button
                    key={cls.id}
                    onClick={() => {
                      setSelectedClassId(cls.id);
                      setSelectedCompositions(new Set());
                    }}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      selectedClassId === cls.id
                        ? "border-primary-500 bg-primary-50"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium text-gray-900">{cls.title}</h4>
                      <div
                        className={`px-2 py-0.5 rounded text-xs font-medium ${
                          cls.split_type === "split"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {cls.split_type === "split" ? "앞/뒤타임" : "단일"}
                      </div>
                    </div>
                    <p className="text-xs text-gray-500">
                      {cls.teacher?.name} • {cls.subject?.subject_name}
                    </p>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Right: Schedule Canvas */}
          <div className="flex-1 p-6 overflow-hidden">
            {selectedClass ? (
              <div className="flex flex-col h-full">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">
                    {selectedClass.title}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {selectedClass.teacher?.name} •{" "}
                    {selectedClass.subject?.subject_name}
                  </p>
                </div>

                {isSplitClass && (
                  <div className="flex items-start gap-2 p-3 mb-4 rounded-lg bg-amber-50 border border-amber-200">
                    <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-amber-800">
                      <p className="font-medium">앞/뒤타임 수업입니다</p>
                      <p className="mt-1">
                        시간표에서 앞타임(정규)과 뒤타임(클리닉)을 클릭하여
                        선택하세요.
                      </p>
                    </div>
                  </div>
                )}

                {selectedCompositions.size > 0 && (
                  <div className="flex items-center gap-4 p-3 mb-4 rounded-lg bg-blue-50 border border-blue-200">
                    <div className="flex items-center gap-2 text-sm text-blue-800">
                      <CheckCircle className="w-4 h-4" />
                      <span>{selectedCompositions.size}개 시간 선택됨</span>
                    </div>
                    {isSplitClass && (
                      <div className="flex items-center gap-3 text-xs text-blue-700">
                        <div className="flex items-center gap-1">
                          {hasSelectedClassComposition ? (
                            <CheckCircle className="w-3 h-3 text-green-600" />
                          ) : (
                            <div className="w-3 h-3 border-2 border-blue-400 rounded-full" />
                          )}
                          <span>정규</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {hasSelectedClinicComposition ? (
                            <CheckCircle className="w-3 h-3 text-green-600" />
                          ) : (
                            <div className="w-3 h-3 border-2 border-blue-400 rounded-full" />
                          )}
                          <span>클리닉</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex-1 overflow-hidden">
                  {scheduleBlocks.length > 0 ? (
                    <CanvasSchedule
                      key={`schedule-${selectedClassId}`}
                      customBlocks={scheduleBlocks}
                      editMode="view"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <BookOpen className="w-12 h-12 mb-4 text-gray-400" />
                      <p className="text-sm font-medium text-gray-700">
                        시간표가 설정되지 않았습니다
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        수업 관리에서 시간표를 먼저 설정해주세요
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <BookOpen className="w-12 h-12 mb-4 text-gray-400" />
                <p className="text-sm font-medium text-gray-700">
                  수업을 선택하세요
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  왼쪽 목록에서 등록할 수업을 선택하세요
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-600">
            {selectedCompositions.size > 0 && (
              <span>{selectedCompositions.size}개 시간 선택됨</span>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 transition-colors bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              취소
            </button>
            <button
              onClick={handleEnroll}
              disabled={
                !canEnroll ||
                enrollStudent.isPending ||
                enrollComposition.isPending
              }
              className="px-4 py-2 text-white transition-all duration-200 bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg hover:from-primary-600 hover:to-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {enrollStudent.isPending || enrollComposition.isPending
                ? "등록 중..."
                : "등록"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
