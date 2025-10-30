"use client";

import { useState } from "react";
import { X } from "lucide-react";

export type ExceptionType = "temporary" | "permanent";

interface ExceptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (type: ExceptionType, reason?: string) => void;
  title: string;
  description: string;
  dragType: "class" | "student";
}

export default function ExceptionModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  dragType,
}: ExceptionModalProps) {
  const [selectedType, setSelectedType] = useState<ExceptionType>("temporary");
  const [reason, setReason] = useState("");

  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm(selectedType, reason || undefined);
    setReason("");
    setSelectedType("temporary");
  };

  const handleClose = () => {
    onClose();
    setReason("");
    setSelectedType("temporary");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={handleClose}
      ></div>

      {/* Modal */}
      <div className="relative z-10 w-full max-w-md p-6 mx-4 bg-white shadow-2xl rounded-2xl">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{title}</h2>
            <p className="mt-1 text-sm text-gray-600">{description}</p>
          </div>
          <button
            onClick={handleClose}
            className="p-1 text-gray-400 transition-colors rounded-lg hover:text-gray-600 hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4">
          {/* 변경 타입 선택 */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              변경 적용 방식
            </label>
            <div className="space-y-2">
              {/* 일회성 변경 */}
              <button
                onClick={() => setSelectedType("temporary")}
                className={`
                  w-full p-4 text-left transition-all duration-200 border-2 rounded-xl
                  ${
                    selectedType === "temporary"
                      ? "border-primary-500 bg-primary-50"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }
                `}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`
                    mt-0.5 w-5 h-5 border-2 rounded-full transition-all
                    ${
                      selectedType === "temporary"
                        ? "border-primary-500 bg-primary-500"
                        : "border-gray-300"
                    }
                  `}
                  >
                    {selectedType === "temporary" && (
                      <div className="w-full h-full bg-white rounded-full scale-50"></div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">
                      이번 주만 변경 (일회성)
                    </div>
                    <div className="mt-1 text-sm text-gray-600">
                      {dragType === "class"
                        ? "선택한 날짜에만 수업 시간/강의실이 변경됩니다"
                        : "선택한 날짜에만 학생의 수강 정보가 변경됩니다"}
                    </div>
                  </div>
                </div>
              </button>

              {/* 영구 변경 */}
              <button
                onClick={() => setSelectedType("permanent")}
                className={`
                  w-full p-4 text-left transition-all duration-200 border-2 rounded-xl
                  ${
                    selectedType === "permanent"
                      ? "border-primary-500 bg-primary-50"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }
                `}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`
                    mt-0.5 w-5 h-5 border-2 rounded-full transition-all
                    ${
                      selectedType === "permanent"
                        ? "border-primary-500 bg-primary-500"
                        : "border-gray-300"
                    }
                  `}
                  >
                    {selectedType === "permanent" && (
                      <div className="w-full h-full bg-white rounded-full scale-50"></div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">
                      영구 변경
                    </div>
                    <div className="mt-1 text-sm text-gray-600">
                      {dragType === "class"
                        ? "매주 반복되는 수업 시간/강의실이 변경됩니다"
                        : "매주 반복되는 학생의 수강 정보가 변경됩니다"}
                    </div>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* 변경 사유 */}
          {selectedType === "temporary" && (
            <div className="space-y-2">
              <label
                htmlFor="reason"
                className="block text-sm font-medium text-gray-700"
              >
                변경 사유 (선택)
              </label>
              <textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="예) 특별 일정, 시설 문제, 보강 등"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                rows={3}
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-2 mt-6">
          <button
            onClick={handleClose}
            className="flex-1 px-4 py-2 text-gray-700 transition-colors bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            취소
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 px-4 py-2 text-white transition-colors bg-primary-600 rounded-lg hover:bg-primary-700"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
}
