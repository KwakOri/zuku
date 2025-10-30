"use client";

import { AlertCircle, Calendar, Clock } from "lucide-react";

interface MoveConfirmModalProps {
  isOpen: boolean;
  type: "student" | "class" | "time";
  title: string;
  description: string;
  onClose: () => void;
  onConfirmTemporary: (reason?: string) => void;
  onConfirmPermanent: () => void;
}

export default function MoveConfirmModal({
  isOpen,
  type,
  title,
  description,
  onClose,
  onConfirmTemporary,
  onConfirmPermanent,
}: MoveConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]"
      onClick={onClose}
    >
      <div
        className="flat-card rounded-2xl border-0 bg-white shadow-2xl p-6 max-w-md w-full mx-4 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="flex items-start gap-3 mb-4">
          <div className="p-2 bg-primary-100 rounded-xl">
            {type === "time" ? (
              <Clock className="h-6 w-6 text-primary-600" />
            ) : (
              <Calendar className="h-6 w-6 text-primary-600" />
            )}
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-600 mt-1">{description}</p>
          </div>
        </div>

        {/* 안내 메시지 */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-4">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-blue-800">
              <div className="font-medium mb-1">변경 유형을 선택하세요</div>
              <ul className="space-y-1 text-blue-700">
                <li>• <strong>일회성:</strong> 이번 주만 적용됩니다</li>
                <li>• <strong>영구:</strong> 앞으로 계속 적용됩니다</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 액션 버튼 */}
        <div className="flex gap-3">
          <button
            onClick={() => {
              const reason = prompt("일회성 변경 사유를 입력하세요 (선택사항):");
              onConfirmTemporary(reason || undefined);
            }}
            className="flex-1 px-4 py-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl font-medium transition-colors"
          >
            일회성 변경
          </button>
          <button
            onClick={() => {
              if (
                confirm(
                  "영구적으로 변경하시겠습니까?\n이 변경은 앞으로 모든 수업에 적용됩니다."
                )
              ) {
                onConfirmPermanent();
              }
            }}
            className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium transition-colors"
          >
            영구 변경
          </button>
        </div>

        {/* 취소 버튼 */}
        <button
          onClick={onClose}
          className="w-full mt-3 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors"
        >
          취소
        </button>
      </div>
    </div>
  );
}
