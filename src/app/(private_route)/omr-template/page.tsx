"use client";

import OMRTemplateEditor from "@/components/omr/OMRTemplateEditor";
import { OMRTemplate } from "@/types/omr";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function OMRTemplatePage() {
  const [template, setTemplate] = useState<OMRTemplate | null>(null);

  const handleTemplateSave = () => {
    if (!template) {
      alert("템플릿이 설정되지 않았습니다.");
      return;
    }

    // LocalStorage에 저장
    localStorage.setItem("omr-template", JSON.stringify(template));
    alert("템플릿이 저장되었습니다!");
  };

  return (
    <div className="p-6 mx-auto max-w-7xl">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="mb-2 text-3xl font-bold">OMR 템플릿 편집기</h1>
          <p className="text-gray-600">
            OMR 카드 이미지 위에 마킹 좌표를 직접 설정하세요
          </p>
        </div>

        <div className="flex gap-2">
          <Link
            href="/omr-grading"
            className="flex items-center gap-2 px-4 py-2 text-white bg-gray-600 rounded-lg hover:bg-gray-700"
          >
            <ArrowLeft className="w-4 h-4" />
            채점 페이지로
          </Link>

          <button
            onClick={handleTemplateSave}
            className="flex items-center gap-2 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            <Save className="w-4 h-4" />
            템플릿 적용
          </button>
        </div>
      </div>

      {/* 사용 방법 */}
      <div className="p-4 mb-6 border border-blue-200 rounded-lg bg-blue-50">
        <h3 className="mb-2 font-semibold text-blue-900">사용 방법</h3>
        <ol className="space-y-1 text-sm text-blue-700 list-decimal list-inside">
          <li>{`"자동 그리드 생성" 버튼으로 기본 마커 생성`}</li>
          <li>이미지 위의 마커를 드래그하여 정확한 위치로 이동</li>
          <li>마커를 클릭하면 세부 좌표 수정 가능</li>
          <li>{`"저장" 버튼으로 JSON 파일 다운로드`}</li>
          <li>{`"템플릿 적용" 버튼으로 채점 시스템에 적용`}</li>
        </ol>
      </div>

      {/* 편집기 */}
      <OMRTemplateEditor onTemplateChange={setTemplate} />
    </div>
  );
}
