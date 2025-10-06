"use client";

import { useState } from "react";
import { X } from "lucide-react";

interface ClassCompositionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ClassCompositionFormData) => void;
  classData: {
    id: string;
    title: string;
    split_type: "single" | "split";
  };
}

export interface ClassCompositionFormData {
  class_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  type?: "class" | "clinic" | null;
}

const DAYS = ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"];

export default function ClassCompositionModal({
  isOpen,
  onClose,
  onSubmit,
  classData,
}: ClassCompositionModalProps) {
  const [dayOfWeek, setDayOfWeek] = useState<number>(1); // Default to Monday
  const [startTime, setStartTime] = useState<string>("09:00");
  const [endTime, setEndTime] = useState<string>("10:30");
  const [type, setType] = useState<"class" | "clinic" | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (startTime >= endTime) {
      alert("종료 시간은 시작 시간보다 늦어야 합니다.");
      return;
    }

    const formData: ClassCompositionFormData = {
      class_id: classData.id,
      day_of_week: dayOfWeek,
      start_time: startTime,
      end_time: endTime,
      type: classData.split_type === "split" ? type : null,
    };

    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-md p-6 bg-white rounded-2xl shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800">시간표 추가</h2>
          <button
            onClick={onClose}
            className="p-1 transition-colors rounded-lg hover:bg-gray-100"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Class Info */}
        <div className="mb-6 p-4 bg-primary-50 rounded-lg">
          <p className="text-sm text-gray-600">수업</p>
          <p className="font-semibold text-gray-800">{classData.title}</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Day of Week */}
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              요일 <span className="text-red-500">*</span>
            </label>
            <select
              value={dayOfWeek}
              onChange={(e) => setDayOfWeek(Number(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            >
              {DAYS.map((day, index) => (
                <option key={index} value={index}>
                  {day}
                </option>
              ))}
            </select>
          </div>

          {/* Start Time */}
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              시작 시간 <span className="text-red-500">*</span>
            </label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>

          {/* End Time */}
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              종료 시간 <span className="text-red-500">*</span>
            </label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>

          {/* Type (only for split classes) */}
          {classData.split_type === "split" && (
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                타임 구분 <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="type"
                    value="class"
                    checked={type === "class"}
                    onChange={(e) => setType(e.target.value as "class")}
                    className="mr-2"
                    required
                  />
                  <span className="text-sm text-gray-700">정규 수업</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="type"
                    value="clinic"
                    checked={type === "clinic"}
                    onChange={(e) => setType(e.target.value as "clinic")}
                    className="mr-2"
                    required
                  />
                  <span className="text-sm text-gray-700">클리닉</span>
                </label>
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 text-white bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg hover:from-primary-600 hover:to-primary-700 transition-all"
            >
              추가
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
