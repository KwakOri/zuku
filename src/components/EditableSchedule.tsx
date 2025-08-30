"use client";

import { EditMode } from "@/types/schedule";
import { BarChart3, Edit, Eye, Settings, Shield } from "lucide-react";
import { useState } from "react";
import CanvasSchedule from "./CanvasSchedule";

export default function EditableSchedule() {
  const [editMode, setEditMode] = useState<EditMode>("view");
  const [showDensity, setShowDensity] = useState(false);

  const modeOptions = [
    {
      value: "view" as EditMode,
      label: "조회 모드",
      icon: Eye,
      description: "시간표를 보기만 할 수 있습니다",
    },
    {
      value: "edit" as EditMode,
      label: "편집 모드",
      icon: Edit,
      description: "수업 정보를 수정할 수 있습니다",
    },
    {
      value: "admin" as EditMode,
      label: "관리자 모드",
      icon: Shield,
      description: "모든 기능을 사용할 수 있습니다",
    },
  ];

  return (
    <div className="w-full space-y-6">
      {/* 모드 선택 */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center gap-2 mb-4">
          <Settings className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-800">시간표 모드</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {modeOptions.map((option) => {
            const IconComponent = option.icon;
            return (
              <button
                key={option.value}
                onClick={() => setEditMode(option.value)}
                className={`p-4 border rounded-lg text-left transition-all duration-200 ${
                  editMode === option.value
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <IconComponent
                    className={`w-4 h-4 ${
                      editMode === option.value
                        ? "text-blue-600"
                        : "text-gray-500"
                    }`}
                  />
                  <span className="font-medium">{option.label}</span>
                </div>
                <p className="text-xs opacity-80">{option.description}</p>
              </button>
            );
          })}
        </div>

        {/* 학생 일정 밀집도 토글 */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={showDensity}
              onChange={(e) => setShowDensity(e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
            />
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">
                학생 일정 밀집도 표시
              </span>
            </div>
          </label>
          <p className="text-xs text-gray-500 mt-1 ml-7">
            시간대별 학생들의 개인 일정 수를 히트맵으로 표시합니다
          </p>
        </div>
      </div>

      {/* 시간표 */}
      <CanvasSchedule editMode={editMode} showDensity={showDensity} />

      {/* 사용법 안내 */}
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <h4 className="font-semibold text-gray-800 mb-2">사용법</h4>
        <div className="text-sm text-gray-600 space-y-1">
          <p>
            <span className="font-medium">조회 모드:</span> 시간표를 확인할 수
            있습니다.
          </p>
          <p>
            <span className="font-medium">편집 모드:</span> 수업 블록을 클릭하여
            수업 정보를 수정할 수 있습니다.
          </p>
          <p>
            <span className="font-medium">관리자 모드:</span> 편집 기능에 더해
            드래그 앤 드롭으로 수업 시간을 변경할 수 있습니다.
          </p>
        </div>
      </div>
    </div>
  );
}
