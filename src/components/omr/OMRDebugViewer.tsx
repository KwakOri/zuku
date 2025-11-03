"use client";

import { OMRProcessResult } from "@/types/omr";
import { DEFAULT_OMR_TEMPLATE } from "@/lib/omr/defaultTemplate";
import { useState } from "react";
import { ZoomIn, ZoomOut, RotateCcw, CheckCircle, XCircle } from "lucide-react";

interface OMRDebugViewerProps {
  results: OMRProcessResult[];
}

export default function OMRDebugViewer({ results }: OMRDebugViewerProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [showMarkers, setShowMarkers] = useState(true);
  const [showAlignmentMarkers, setShowAlignmentMarkers] = useState(true);

  const template = DEFAULT_OMR_TEMPLATE;
  const currentResult = results[selectedIndex];

  if (!currentResult) {
    return (
      <div className="p-8 text-center text-gray-500">
        처리된 결과가 없습니다.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">OMR 정렬 디버그 뷰</h2>
          <p className="text-sm text-gray-600 mt-1">
            정렬된 이미지와 마커 위치를 확인하세요
          </p>
        </div>

        {/* 파일 선택 */}
        {results.length > 1 && (
          <select
            value={selectedIndex}
            onChange={(e) => setSelectedIndex(parseInt(e.target.value))}
            className="px-4 py-2 border rounded-lg"
          >
            {results.map((result, idx) => (
              <option key={idx} value={idx}>
                {result.fileName}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* 정렬 정보 */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 border rounded-lg bg-blue-50">
          <div className="flex items-center gap-2 mb-2">
            {currentResult.alignmentSuccess ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : (
              <XCircle className="w-5 h-5 text-red-600" />
            )}
            <span className="font-semibold text-gray-700">정렬 상태</span>
          </div>
          <p className="text-2xl font-bold text-blue-600">
            {currentResult.alignmentSuccess ? "성공" : "실패"}
          </p>
        </div>

        <div className="p-4 border rounded-lg bg-purple-50">
          <div className="flex items-center gap-2 mb-2">
            <RotateCcw className="w-5 h-5 text-purple-600" />
            <span className="font-semibold text-gray-700">회전 각도</span>
          </div>
          <p className="text-2xl font-bold text-purple-600">
            {currentResult.detectedAngle?.toFixed(2) || "0.00"}°
          </p>
        </div>

        <div className="p-4 border rounded-lg bg-green-50">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="font-semibold text-gray-700">인식된 답안</span>
          </div>
          <p className="text-2xl font-bold text-green-600">
            {Object.keys(currentResult.answers).length} / {template.totalQuestions}
          </p>
        </div>
      </div>

      {/* 컨트롤 */}
      <div className="flex items-center gap-4 p-4 border rounded-lg bg-gray-50">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
            className="p-2 border rounded-lg hover:bg-gray-200"
            title="축소"
          >
            <ZoomOut className="w-5 h-5" />
          </button>
          <span className="text-sm font-medium min-w-[60px] text-center">
            {(zoom * 100).toFixed(0)}%
          </span>
          <button
            onClick={() => setZoom(Math.min(3, zoom + 0.1))}
            className="p-2 border rounded-lg hover:bg-gray-200"
            title="확대"
          >
            <ZoomIn className="w-5 h-5" />
          </button>
        </div>

        <div className="h-6 w-px bg-gray-300" />

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={showMarkers}
            onChange={(e) => setShowMarkers(e.target.checked)}
            className="w-4 h-4"
          />
          <span className="text-sm font-medium">답안 마커 표시</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={showAlignmentMarkers}
            onChange={(e) => setShowAlignmentMarkers(e.target.checked)}
            className="w-4 h-4"
          />
          <span className="text-sm font-medium">정렬 마커 표시</span>
        </label>
      </div>

      {/* 이미지 뷰어 */}
      <div className="border rounded-lg overflow-auto bg-gray-100 p-4">
        <div
          className="relative mx-auto"
          style={{
            width: "fit-content",
            transform: `scale(${zoom})`,
            transformOrigin: "top left",
          }}
        >
          {/* 정렬된 이미지 */}
          {currentResult.alignedImageBase64 && (
            <img
              src={`data:image/jpeg;base64,${currentResult.alignedImageBase64}`}
              alt={currentResult.fileName}
              className="block max-w-full"
              style={{ maxHeight: "800px" }}
            />
          )}

          {/* 답안 마커 오버레이 */}
          {showMarkers &&
            template.markers.map((marker, index) => {
              const hasAnswer = currentResult.answers[marker.questionNumber];
              const isSelected =
                hasAnswer &&
                currentResult.answers[marker.questionNumber] ===
                  marker.optionNumber.toString();

              return (
                <div
                  key={index}
                  className={`absolute border-2 transition-all ${
                    isSelected
                      ? "border-green-500 bg-green-200/30"
                      : "border-blue-400 bg-blue-200/20"
                  }`}
                  style={{
                    left: `${marker.x}%`,
                    top: `${marker.y}%`,
                    width: `${marker.width}%`,
                    height: `${marker.height}%`,
                    pointerEvents: "none",
                  }}
                  title={`Q${marker.questionNumber}-${marker.optionNumber}`}
                />
              );
            })}

          {/* 정렬 마커 오버레이 */}
          {showAlignmentMarkers &&
            template.alignmentMarkers?.map((marker, index) => (
              <div
                key={`align-${index}`}
                className="absolute border-4 border-red-500 bg-red-200/40"
                style={{
                  left: `${marker.x}%`,
                  top: `${marker.y}%`,
                  width: `${marker.width}%`,
                  height: `${marker.height}%`,
                  pointerEvents: "none",
                }}
                title={`정렬 마커 ${index + 1}`}
              >
                <div className="absolute -top-6 left-0 bg-red-500 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                  정렬 마커 {index + 1}
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* 범례 */}
      <div className="flex gap-4 p-4 border rounded-lg bg-gray-50">
        <div className="flex items-center gap-2">
          <div className="w-6 h-4 border-2 border-blue-400 bg-blue-200/20" />
          <span className="text-sm">답안 마커</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-4 border-2 border-green-500 bg-green-200/30" />
          <span className="text-sm">인식된 답안</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-4 border-2 border-red-500 bg-red-200/40" />
          <span className="text-sm">정렬 마커</span>
        </div>
      </div>

      {/* 답안 상세 */}
      <div className="border rounded-lg p-4">
        <h3 className="font-semibold text-lg mb-3">인식된 답안</h3>
        <div className="grid grid-cols-10 gap-2">
          {Array.from({ length: template.totalQuestions }, (_, i) => i + 1).map(
            (num) => (
              <div
                key={num}
                className={`p-2 text-center border rounded ${
                  currentResult.answers[num]
                    ? "bg-green-50 border-green-300"
                    : "bg-gray-50 border-gray-300"
                }`}
              >
                <div className="text-xs text-gray-600">{num}번</div>
                <div className="text-lg font-bold">
                  {currentResult.answers[num]
                    ? `${currentResult.answers[num]}번`
                    : "-"}
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
