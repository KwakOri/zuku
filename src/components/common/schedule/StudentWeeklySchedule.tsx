"use client";

import { StudentScheduleBlock, StudentWeeklyView } from "@/types/schedule";
import { Book, Calendar, Clock, Edit3, MapPin, Plus, User } from "lucide-react";
import React, { useState } from "react";

interface StudentWeeklyScheduleProps {
  studentWeeklyView: StudentWeeklyView;
  viewMode?: "view" | "edit";
}

interface EditModalProps {
  block: StudentScheduleBlock | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (blockId: string, updatedData: Partial<StudentScheduleBlock>) => void;
  onDelete?: (blockId: string) => void;
}

function EditModal({
  block,
  isOpen,
  onClose,
  onSave,
  onDelete,
}: EditModalProps) {
  const [editData, setEditData] = useState({
    title: block?.title || "",
    type: block?.type || ("personal" as const),
    startTime: block?.startTime || "",
    endTime: block?.endTime || "",
    location: block?.location || "",
    description: block?.description || "",
  });

  React.useEffect(() => {
    if (block) {
      setEditData({
        title: block.title,
        type: block.type,
        startTime: block.startTime,
        endTime: block.endTime,
        location: block.location || "",
        description: block.description || "",
      });
    }
  }, [block]);

  if (!isOpen || !block || !block.isEditable) return null;

  const typeOptions = [
    { value: "personal", label: "개인 일정" },
    { value: "extracurricular", label: "과외활동" },
    { value: "study", label: "자습" },
    { value: "appointment", label: "약속" },
    { value: "other", label: "기타" },
  ];

  const handleSave = () => {
    onSave(block.id, editData);
    onClose();
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(block.id);
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">
            개인 일정 편집
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              제목
            </label>
            <input
              type="text"
              value={editData.title}
              onChange={(e) =>
                setEditData({ ...editData, title: e.target.value })
              }
              className="w-full border rounded-md px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              유형
            </label>
            <select
              value={editData.type}
              onChange={(e) =>
                setEditData({ ...editData, type: e.target.value as "personal" | "extracurricular" | "study" | "appointment" | "other" })
              }
              className="w-full border rounded-md px-3 py-2"
            >
              {typeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                시작 시간
              </label>
              <input
                type="time"
                value={editData.startTime}
                onChange={(e) =>
                  setEditData({ ...editData, startTime: e.target.value })
                }
                className="w-full border rounded-md px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                종료 시간
              </label>
              <input
                type="time"
                value={editData.endTime}
                onChange={(e) =>
                  setEditData({ ...editData, endTime: e.target.value })
                }
                className="w-full border rounded-md px-3 py-2"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              장소
            </label>
            <input
              type="text"
              value={editData.location}
              onChange={(e) =>
                setEditData({ ...editData, location: e.target.value })
              }
              className="w-full border rounded-md px-3 py-2"
              placeholder="선택사항"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              메모
            </label>
            <textarea
              value={editData.description}
              onChange={(e) =>
                setEditData({ ...editData, description: e.target.value })
              }
              className="w-full border rounded-md px-3 py-2 h-20 resize-none"
              placeholder="선택사항"
            />
          </div>
        </div>

        <div className="flex gap-3 pt-4 border-t mt-6">
          <button
            onClick={handleSave}
            className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 flex items-center justify-center gap-2"
          >
            <Edit3 className="w-4 h-4" />
            저장
          </button>
          {onDelete && (
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
            >
              삭제
            </button>
          )}
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
          >
            취소
          </button>
        </div>
      </div>
    </div>
  );
}

export default function StudentWeeklySchedule({
  studentWeeklyView,
  viewMode = "view",
}: StudentWeeklyScheduleProps) {
  const [scheduleBlocks, setScheduleBlocks] = useState(
    studentWeeklyView.scheduleBlocks
  );
  const [editingBlock, setEditingBlock] = useState<StudentScheduleBlock | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 요일별로 시간대를 나열하여 그리드 구성
  const timeSlots = studentWeeklyView.timeSlots;
  const weekDays = studentWeeklyView.weekDays;

  // 각 요일의 시간대별로 블록을 매핑
  const getBlocksForDayAndTime = (dayIndex: number, timeSlot: string) => {
    return scheduleBlocks.filter((block) => {
      if (block.dayOfWeek !== dayIndex) return false;

      const blockStart = block.startTime;
      const blockEnd = block.endTime;
      const slotTime = timeSlot;

      // 시간을 분 단위로 변환하여 비교
      const timeToMinutes = (time: string) => {
        const [hours, minutes] = time.split(":").map(Number);
        return hours * 60 + minutes;
      };

      const blockStartMin = timeToMinutes(blockStart);
      const blockEndMin = timeToMinutes(blockEnd);
      const slotMin = timeToMinutes(slotTime);

      return slotMin >= blockStartMin && slotMin < blockEndMin;
    });
  };

  // 블록의 높이 계산 (시간 지속 시간에 따라)
  const getBlockHeight = (block: StudentScheduleBlock) => {
    const timeToMinutes = (time: string) => {
      const [hours, minutes] = time.split(":").map(Number);
      return hours * 60 + minutes;
    };

    const startMin = timeToMinutes(block.startTime);
    const endMin = timeToMinutes(block.endTime);
    const duration = endMin - startMin;

    // 30분당 한 셀 높이
    const cellsSpanned = duration / 30;
    return `${cellsSpanned * 3}rem`; // 각 셀이 3rem 높이
  };

  // 블록 편집 핸들러
  const handleEditBlock = (block: StudentScheduleBlock) => {
    if (block.isEditable) {
      setEditingBlock(block);
      setIsModalOpen(true);
    }
  };

  const handleSaveBlock = (
    blockId: string,
    updatedData: Partial<StudentScheduleBlock>
  ) => {
    setScheduleBlocks((blocks) =>
      blocks.map((block) =>
        block.id === blockId ? { ...block, ...updatedData } : block
      )
    );
  };

  const handleDeleteBlock = (blockId: string) => {
    setScheduleBlocks((blocks) =>
      blocks.filter((block) => block.id !== blockId)
    );
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <User className="w-6 h-6 text-blue-500" />
            {studentWeeklyView.student.name}의 주간 시간표
          </h2>
          <p className="text-gray-600 mt-1">
            {studentWeeklyView.student.grade}학년 • 일주일 일정
          </p>
        </div>
        {viewMode === "edit" && (
          <button className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
            <Plus className="w-4 h-4" />
            개인 일정 추가
          </button>
        )}
      </div>

      {/* 그리드 시간표 */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="grid grid-cols-8 gap-0">
          {/* 첫 번째 행: 헤더 */}
          <div className="bg-gray-50 border-r border-b border-gray-200 p-3 font-semibold text-center text-gray-700">
            시간
          </div>
          {weekDays.map((day, dayIndex) => (
            <div
              key={day}
              className="bg-gray-50 border-r border-b border-gray-200 p-3 font-semibold text-center text-gray-700"
            >
              {day}요일
            </div>
          ))}

          {/* 시간대별 행 */}
          {timeSlots.map((timeSlot, timeIndex) => (
            <React.Fragment key={timeSlot}>
              {/* 시간 레이블 */}
              <div className="bg-gray-50 border-r border-b border-gray-200 p-3 text-center text-sm font-medium text-gray-600">
                {timeSlot}
              </div>

              {/* 각 요일의 해당 시간 셀 */}
              {weekDays.map((day, dayIndex) => {
                const blocksInCell = getBlocksForDayAndTime(dayIndex, timeSlot);
                const isFirstRowOfBlock =
                  blocksInCell.length > 0 &&
                  blocksInCell.every((block) => block.startTime === timeSlot);

                return (
                  <div
                    key={`${day}-${timeSlot}`}
                    className="border-r border-b border-gray-200 p-1 relative min-h-[3rem]"
                  >
                    {isFirstRowOfBlock &&
                      blocksInCell.map((block) => (
                        <div
                          key={block.id}
                          className={`absolute inset-1 rounded-lg p-2 cursor-pointer transition-all hover:shadow-md ${
                            block.isEditable && viewMode === "edit"
                              ? "hover:ring-2 hover:ring-blue-300"
                              : ""
                          }`}
                          style={{
                            backgroundColor: block.color,
                            height: getBlockHeight(block),
                            zIndex: 10,
                          }}
                          onClick={() =>
                            viewMode === "edit" && handleEditBlock(block)
                          }
                        >
                          <div className="text-white text-xs font-semibold mb-1 truncate">
                            {block.title}
                          </div>
                          <div className="flex items-center gap-1 text-white text-xs opacity-90">
                            <Clock className="w-3 h-3" />
                            <span>
                              {block.startTime} - {block.endTime}
                            </span>
                          </div>
                          {block.location && (
                            <div className="flex items-center gap-1 text-white text-xs opacity-90 mt-1">
                              <MapPin className="w-3 h-3" />
                              <span className="truncate">{block.location}</span>
                            </div>
                          )}
                          {block.teacherName && (
                            <div className="flex items-center gap-1 text-white text-xs opacity-90 mt-1">
                              <User className="w-3 h-3" />
                              <span className="truncate">
                                {block.teacherName}
                              </span>
                            </div>
                          )}
                          {block.subject && (
                            <div className="flex items-center gap-1 text-white text-xs opacity-90 mt-1">
                              <Book className="w-3 h-3" />
                              <span className="truncate">{block.subject}</span>
                            </div>
                          )}

                          {/* 편집 가능 표시 */}
                          {block.isEditable && viewMode === "edit" && (
                            <div className="absolute top-1 right-1 bg-white bg-opacity-20 rounded p-1">
                              <Edit3 className="w-3 h-3 text-white" />
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* 범례 */}
      <div className="mt-6 bg-gray-50 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          일정 유형
        </h3>
        <div className="flex flex-wrap gap-3 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-blue-500"></div>
            <span className="text-gray-600">수업</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-green-500"></div>
            <span className="text-gray-600">개인 일정</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-purple-500"></div>
            <span className="text-gray-600">과외활동</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-amber-500"></div>
            <span className="text-gray-600">자습</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-pink-500"></div>
            <span className="text-gray-600">약속</span>
          </div>
        </div>
        {viewMode === "edit" && (
          <div className="text-xs text-gray-500 mt-2">
            💡 개인 일정은 클릭하여 편집할 수 있습니다. 학원 수업은 편집할 수
            없습니다.
          </div>
        )}
      </div>

      {/* 편집 모달 */}
      <EditModal
        block={editingBlock}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingBlock(null);
        }}
        onSave={handleSaveBlock}
        onDelete={handleDeleteBlock}
      />
    </div>
  );
}
