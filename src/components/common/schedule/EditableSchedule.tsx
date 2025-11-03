"use client";

import { Calendar, Shield } from "lucide-react";
import CanvasSchedule from "./CanvasSchedule";

export default function EditableSchedule() {
  // 기본적으로 관리자 모드로 설정
  const editMode = "admin";

  return (
    <div className="w-full space-y-6">
      {/* 시간표 관리 정보 */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-800">
                수업 시간표 관리
              </h3>
            </div>
            <div className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full border border-blue-200">
              관리자 모드
            </div>
          </div>
        </div>

        <p className="text-sm text-gray-600 mt-2">
          드래그 앤 드롭으로 수업 시간을 변경하고, 수업을 추가/삭제할 수
          있습니다.
        </p>
      </div>

      {/* 시간표 */}
      <CanvasSchedule editMode={editMode} />

      {/* 사용법 안내 */}
      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
        <div className="flex items-center gap-2 mb-2">
          <Calendar className="w-4 h-4 text-blue-600" />
          <h4 className="font-semibold text-blue-800">시간표 관리 기능</h4>
        </div>
        <div className="text-sm text-blue-700 space-y-1">
          <p>
            • <span className="font-medium">수업 추가:</span> 빈 시간대를
            클릭하여 새 수업을 생성
          </p>
          <p>
            • <span className="font-medium">수업 편집:</span> 수업 블록을
            클릭하여 정보 수정
          </p>
          <p>
            • <span className="font-medium">시간 변경:</span> 드래그 앤 드롭으로
            수업 시간 이동
          </p>
          <p>
            • <span className="font-medium">수업 삭제:</span> 수업 편집 시 삭제
            버튼 사용
          </p>
        </div>
      </div>
    </div>
  );
}
