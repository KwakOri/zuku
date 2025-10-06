"use client";

import { useState } from "react";
import { Split, Clock, Users, Edit2, Save, X } from "lucide-react";
import { useClassCompositions } from "@/queries/useClassComposition";
import ClassCompositionSelector from "./ClassCompositionSelector";
import toast from "react-hot-toast";

interface ClassCompositionManagerProps {
  classId: string;
  splitType: string; // "single" | "split"
  onTypeChange?: (newType: string) => void;
}

export default function ClassCompositionManager({
  classId,
  splitType,
  onTypeChange,
}: ClassCompositionManagerProps) {
  const [isEditingType, setIsEditingType] = useState(false);
  const [selectedType, setSelectedType] = useState<string>(splitType);

  const { data: compositions = [] } = useClassCompositions(classId);

  const handleSaveType = async () => {
    if (selectedType === splitType) {
      setIsEditingType(false);
      return;
    }

    try {
      const response = await fetch(`/api/classes/${classId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          split_type: selectedType,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update class type");
      }

      toast.success("수업 타입이 변경되었습니다.");
      onTypeChange?.(selectedType);
      setIsEditingType(false);
    } catch (error) {
      toast.error("수업 타입 변경에 실패했습니다.");
      console.error(error);
    }
  };

  const classCompositions = compositions.filter((c) => c.type === "class");
  const clinicCompositions = compositions.filter((c) => c.type === "clinic");

  return (
    <div className="space-y-6">
      {/* 수업 타입 설정 */}
      <div className="p-4 bg-white rounded-lg border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Split className="w-5 h-5 text-gray-600" />
            <h3 className="text-sm font-medium text-gray-900">수업 구성 타입</h3>
          </div>
          {!isEditingType && (
            <button
              onClick={() => setIsEditingType(true)}
              className="flex items-center gap-1 px-2 py-1 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded"
            >
              <Edit2 className="w-3 h-3" />
              변경
            </button>
          )}
        </div>

        {isEditingType ? (
          <div className="space-y-3">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as "single" | "split")}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="single">단일 수업</option>
              <option value="split">앞/뒤타임 수업</option>
            </select>

            <div className="flex gap-2">
              <button
                onClick={handleSaveType}
                className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
              >
                <Save className="w-3 h-3" />
                저장
              </button>
              <button
                onClick={() => {
                  setSelectedType(splitType);
                  setIsEditingType(false);
                }}
                className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg"
              >
                <X className="w-3 h-3" />
                취소
              </button>
            </div>

            {selectedType === "split" && splitType === "single" && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-xs text-yellow-800">
                  <strong>주의:</strong> 단일 수업에서 앞/뒤타임 수업으로 변경하면 기존 학생들의 시간 정보가 초기화됩니다.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              splitType === "split"
                ? "bg-blue-100 text-blue-700"
                : "bg-gray-100 text-gray-700"
            }`}>
              {splitType === "split" ? "앞/뒤타임 수업" : "단일 수업"}
            </div>
          </div>
        )}
      </div>

      {/* 앞/뒤타임 관리 (split 타입인 경우만) */}
      {splitType === "split" && (
        <div className="p-4 bg-white rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-gray-600" />
            <h3 className="text-sm font-medium text-gray-900">앞/뒤타임 설정</h3>
          </div>

          <ClassCompositionSelector
            classId={classId}
            splitType="split"
            editMode={true}
          />

          {/* 현황 요약 */}
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-gray-600">앞타임</p>
                <p className="font-medium text-gray-900">
                  {classCompositions.length}개 시간대
                </p>
              </div>
              <div>
                <p className="text-gray-600">뒤타임</p>
                <p className="font-medium text-gray-900">
                  {clinicCompositions.length}개 시간대
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 단일 수업 안내 */}
      {splitType === "single" && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 p-2 bg-blue-100 rounded-lg">
              <Clock className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h4 className="text-sm font-medium text-blue-900 mb-1">
                단일 수업
              </h4>
              <p className="text-xs text-blue-700">
                모든 학생이 동일한 시간에 수업을 받습니다. 앞/뒤타임으로 변경하려면 상단에서 수업 타입을 변경하세요.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
