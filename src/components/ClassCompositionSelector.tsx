"use client";

import { useState } from "react";
import { ClassComposition } from "@/types/schedule";
import { Clock, Plus, Trash2 } from "lucide-react";
import { useClassCompositions, useCreateClassComposition, useDeleteClassComposition } from "@/queries/useClassComposition";

interface ClassCompositionSelectorProps {
  classId: string;
  splitType: string; // "single" | "split"
  selectedCompositionId?: string;
  onSelect?: (compositionId: string) => void;
  editMode?: boolean;
}

const DAYS_OF_WEEK = ["일", "월", "화", "수", "목", "금", "토"];

export default function ClassCompositionSelector({
  classId,
  splitType,
  selectedCompositionId,
  onSelect,
  editMode = false,
}: ClassCompositionSelectorProps) {
  const { data: compositions = [], isLoading } = useClassCompositions(classId);
  const createComposition = useCreateClassComposition();
  const deleteComposition = useDeleteClassComposition();

  const [showAddForm, setShowAddForm] = useState(false);
  const [newComposition, setNewComposition] = useState({
    type: "class" as "class" | "clinic",
    dayOfWeek: 1,
    startTime: "16:00",
    endTime: "18:00",
  });

  const handleAddComposition = async () => {
    try {
      await createComposition.mutateAsync({
        classId,
        ...newComposition,
      });
      setShowAddForm(false);
      setNewComposition({
        type: "class",
        dayOfWeek: 1,
        startTime: "16:00",
        endTime: "18:00",
      });
    } catch (error) {
      console.error("Failed to create composition:", error);
    }
  };

  const handleDeleteComposition = async (id: string) => {
    if (!confirm("이 시간대를 삭제하시겠습니까?")) return;

    try {
      await deleteComposition.mutateAsync(id);
    } catch (error) {
      console.error("Failed to delete composition:", error);
    }
  };

  if (isLoading) {
    return <div className="text-sm text-gray-500">시간대 로딩 중...</div>;
  }

  // 단일 수업인 경우 시간 구성 선택 UI 표시 안 함
  if (splitType === "single") {
    return null;
  }

  const classCompositions = compositions.filter((c) => c.type === "class");
  const clinicCompositions = compositions.filter((c) => c.type === "clinic");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-gray-700">수업 시간 구성</h4>
        {editMode && (
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-1 px-2 py-1 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded"
          >
            <Plus className="w-3 h-3" />
            시간대 추가
          </button>
        )}
      </div>

      {/* 앞타임 (class) */}
      <div>
        <h5 className="text-xs font-medium text-gray-600 mb-2">앞타임</h5>
        <div className="space-y-2">
          {classCompositions.map((comp) => (
            <CompositionItem
              key={comp.id}
              composition={comp}
              selected={selectedCompositionId === comp.id}
              onSelect={onSelect}
              onDelete={editMode ? handleDeleteComposition : undefined}
            />
          ))}
          {classCompositions.length === 0 && (
            <p className="text-xs text-gray-400">앞타임이 설정되지 않았습니다.</p>
          )}
        </div>
      </div>

      {/* 뒤타임 (clinic) */}
      <div>
        <h5 className="text-xs font-medium text-gray-600 mb-2">뒤타임</h5>
        <div className="space-y-2">
          {clinicCompositions.map((comp) => (
            <CompositionItem
              key={comp.id}
              composition={comp}
              selected={selectedCompositionId === comp.id}
              onSelect={onSelect}
              onDelete={editMode ? handleDeleteComposition : undefined}
            />
          ))}
          {clinicCompositions.length === 0 && (
            <p className="text-xs text-gray-400">뒤타임이 설정되지 않았습니다.</p>
          )}
        </div>
      </div>

      {/* 시간대 추가 폼 */}
      {showAddForm && editMode && (
        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              타입
            </label>
            <select
              value={newComposition.type}
              onChange={(e) =>
                setNewComposition({
                  ...newComposition,
                  type: e.target.value as "class" | "clinic",
                })
              }
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="class">앞타임</option>
              <option value="clinic">뒤타임</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              요일
            </label>
            <select
              value={newComposition.dayOfWeek}
              onChange={(e) =>
                setNewComposition({
                  ...newComposition,
                  dayOfWeek: parseInt(e.target.value),
                })
              }
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {DAYS_OF_WEEK.map((day, index) => (
                <option key={index} value={index}>
                  {day}요일
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                시작 시간
              </label>
              <input
                type="time"
                value={newComposition.startTime}
                onChange={(e) =>
                  setNewComposition({
                    ...newComposition,
                    startTime: e.target.value,
                  })
                }
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                종료 시간
              </label>
              <input
                type="time"
                value={newComposition.endTime}
                onChange={(e) =>
                  setNewComposition({
                    ...newComposition,
                    endTime: e.target.value,
                  })
                }
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleAddComposition}
              disabled={createComposition.isPending}
              className="flex-1 px-3 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded disabled:opacity-50"
            >
              {createComposition.isPending ? "추가 중..." : "추가"}
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              className="flex-1 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded"
            >
              취소
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

interface CompositionItemProps {
  composition: ClassComposition;
  selected: boolean;
  onSelect?: (id: string) => void;
  onDelete?: (id: string) => void;
}

function CompositionItem({
  composition,
  selected,
  onSelect,
  onDelete,
}: CompositionItemProps) {
  return (
    <div
      className={`flex items-center justify-between p-2 rounded-lg border transition-colors ${
        selected
          ? "border-blue-500 bg-blue-50"
          : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
      } ${onSelect ? "cursor-pointer" : ""}`}
      onClick={() => onSelect?.(composition.id)}
    >
      <div className="flex items-center gap-2">
        <Clock className="w-4 h-4 text-gray-400" />
        <div>
          <p className="text-sm font-medium text-gray-900">
            {DAYS_OF_WEEK[composition.dayOfWeek]}요일
          </p>
          <p className="text-xs text-gray-500">
            {composition.startTime} - {composition.endTime}
          </p>
        </div>
      </div>
      {onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(composition.id);
          }}
          className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
