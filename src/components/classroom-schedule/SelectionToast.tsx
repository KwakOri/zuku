"use client";

import { X, Users, Calendar } from "lucide-react";
import { ClassBlock } from "@/types/schedule";
import { getGrade } from "@/lib/utils";

interface SelectedStudent {
  id: string;
  name: string;
  grade: number | null;
  blockId: string;
  school: {
    id: string;
    name: string;
    level: string;
  } | null;
}

interface SelectionToastProps {
  selectedStudents: SelectedStudent[];
  selectedStudentsClass: ClassBlock | null;
  selectedClass: ClassBlock | null;
  isMovingStudents: boolean;
  isMovingClass: boolean;
  onMoveStudents: () => void;
  onMoveClass: () => void;
  onChangeTime: () => void;
  onClearSelection: () => void;
}

export default function SelectionToast({
  selectedStudents,
  selectedStudentsClass,
  selectedClass,
  isMovingStudents,
  isMovingClass,
  onMoveStudents,
  onMoveClass,
  onChangeTime,
  onClearSelection,
}: SelectionToastProps) {
  // 학생 선택 상태
  if (selectedStudents.length > 0) {
    return (
      <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2 duration-300">
        <div className="flat-card rounded-2xl border-0 bg-white shadow-lg p-4 min-w-[320px] max-w-[400px]">
          {/* 헤더 */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary-600" />
              <span className="text-sm font-semibold text-gray-900">
                선택된 학생 {selectedStudents.length}명
              </span>
            </div>
            <button
              onClick={onClearSelection}
              className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-4 w-4 text-gray-500" />
            </button>
          </div>

          {/* 수업 정보 */}
          {selectedStudentsClass && (
            <div className="mb-3 p-3 bg-primary-50 rounded-lg border border-primary-100">
              <div className="text-sm font-semibold text-primary-900 mb-1">
                {selectedStudentsClass.title}
              </div>
              <div className="text-xs text-primary-700 space-y-0.5">
                <div>{selectedStudentsClass.subject}</div>
                <div>{selectedStudentsClass.teacherName} 강사</div>
                <div>
                  {selectedStudentsClass.room} · {selectedStudentsClass.startTime} -{" "}
                  {selectedStudentsClass.endTime}
                </div>
              </div>
            </div>
          )}

          {/* 학생 목록 */}
          <div className="space-y-1 mb-3 max-h-[200px] overflow-y-auto">
            {selectedStudents.map((student, index) => (
              <div
                key={`${student.blockId}-${student.id}`}
                className="flex items-center justify-between text-sm px-3 py-2 bg-gray-50 rounded-lg"
              >
                {/* 왼쪽: 학교/학년 */}
                <span className="text-gray-600 text-xs font-medium">
                  {student.school && student.grade
                    ? `${student.school.name.replace(/중학교|고등학교/g, "")} ${getGrade(student.grade, "half")}`
                    : "정보 없음"}
                </span>
                {/* 오른쪽: 이름 */}
                <span className="text-gray-900 font-semibold">
                  {student.name}
                </span>
              </div>
            ))}
          </div>

          {/* 액션 버튼 */}
          <div className="flex gap-2">
            {!isMovingStudents ? (
              <>
                <button
                  onClick={onMoveStudents}
                  className="flex-1 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-medium text-sm transition-colors"
                >
                  학생 이동
                </button>
                <div className="text-xs text-gray-500 flex items-center px-2">
                  또는 ⌘+X
                </div>
              </>
            ) : (
              <div className="flex-1 px-4 py-2 bg-yellow-500 text-white rounded-xl font-medium text-sm text-center">
                이동할 수업을 선택하세요
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 수업 선택 상태
  if (selectedClass) {
    return (
      <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2 duration-300">
        <div className="flat-card rounded-2xl border-0 bg-white shadow-lg p-4 min-w-[280px] max-w-[400px]">
          {/* 헤더 */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary-600" />
              <span className="text-sm font-semibold text-gray-900">
                선택된 수업
              </span>
            </div>
            <button
              onClick={onClearSelection}
              className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-4 w-4 text-gray-500" />
            </button>
          </div>

          {/* 수업 정보 */}
          <div className="mb-3 p-3 bg-gray-50 rounded-lg">
            <div className="text-sm font-medium text-gray-900 mb-1">
              {selectedClass.title}
            </div>
            <div className="text-xs text-gray-600 space-y-0.5">
              <div>{selectedClass.subject}</div>
              <div>{selectedClass.teacherName} 강사</div>
              <div>
                {selectedClass.room} · {selectedClass.startTime} -{" "}
                {selectedClass.endTime}
              </div>
            </div>
          </div>

          {/* 액션 버튼 */}
          <div className="space-y-2">
            <button
              onClick={onMoveClass}
              className="w-full px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-medium text-sm transition-colors"
            >
              강의실 이동
            </button>
            <button
              onClick={onChangeTime}
              className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium text-sm transition-colors"
            >
              시간대 변경
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
