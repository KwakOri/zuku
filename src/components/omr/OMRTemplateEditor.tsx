"use client";

import { useState, useRef, useEffect } from "react";
import { OMRTemplate, OMRMarkerPosition } from "@/types/omr";
import { Save, Download, Upload, Plus, Trash2, Grid, Move } from "lucide-react";
import { DEFAULT_OMR_TEMPLATE } from "@/lib/omr/defaultTemplate";

interface OMRTemplateEditorProps {
  onTemplateChange?: (template: OMRTemplate) => void;
  initialTemplate?: OMRTemplate;
}

export default function OMRTemplateEditor({
  onTemplateChange,
  initialTemplate,
}: OMRTemplateEditorProps) {
  const [template, setTemplate] = useState<OMRTemplate>(
    initialTemplate || DEFAULT_OMR_TEMPLATE
  );

  const [selectedMarker, setSelectedMarker] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  // 그리드 설정
  const [gridSettings, setGridSettings] = useState({
    horizontalSpacing: 3, // 가로 간격 (%) - 촘촘하게
    verticalSpacing: 1.8, // 세로 간격 (%)
    markerWidth: 1.8, // 마커 너비 (%) - 정사각형에 가깝게
    markerHeight: 1.5, // 마커 높이 (%)
    columns: [
      { start: 1, end: 20, startX: 10, startY: 5 },   // 1열
      { start: 21, end: 34, startX: 40, startY: 5 },  // 2열
      { start: 35, end: 45, startX: 70, startY: 5 },  // 3열
    ],
  });

  // 그룹 이동 모드
  const [groupMoveMode, setGroupMoveMode] = useState(true); // 기본값: 그룹 이동

  // 템플릿 변경 시 콜백 호출
  useEffect(() => {
    onTemplateChange?.(template);
  }, [template, onTemplateChange]);

  // 새 마커 추가
  const addMarker = (questionNum: number, optionNum: number) => {
    const newMarker: OMRMarkerPosition = {
      questionNumber: questionNum,
      optionNumber: optionNum,
      x: 10 + (optionNum - 1) * 5, // 기본 X 위치
      y: 10 + (questionNum - 1) * 2, // 기본 Y 위치
      width: 3,
      height: 2,
    };

    setTemplate((prev) => ({
      ...prev,
      markers: [...prev.markers, newMarker],
    }));
  };

  // 마커 삭제
  const removeMarker = (index: number) => {
    setTemplate((prev) => ({
      ...prev,
      markers: prev.markers.filter((_, i) => i !== index),
    }));
    setSelectedMarker(null);
  };

  // 마커 위치 업데이트
  const updateMarkerPosition = (
    index: number,
    updates: Partial<OMRMarkerPosition>
  ) => {
    setTemplate((prev) => ({
      ...prev,
      markers: prev.markers.map((marker, i) =>
        i === index ? { ...marker, ...updates } : marker
      ),
    }));
  };

  // 마우스 다운 (드래그 시작)
  const handleMouseDown = (
    e: React.MouseEvent,
    index: number
  ) => {
    e.stopPropagation();
    setSelectedMarker(index);
    setIsDragging(true);

    const rect = imageRef.current?.getBoundingClientRect();
    if (rect) {
      setDragStart({
        x: ((e.clientX - rect.left) / rect.width) * 100,
        y: ((e.clientY - rect.top) / rect.height) * 100,
      });
    }
  };

  // 마우스 이동 (드래그 중)
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || selectedMarker === null || !dragStart) return;

    const rect = imageRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const deltaX = x - dragStart.x;
    const deltaY = y - dragStart.y;

    if (groupMoveMode) {
      // 그룹 이동: 같은 문제의 모든 선택지를 함께 이동
      const currentMarker = template.markers[selectedMarker];
      const questionNumber = currentMarker.questionNumber;

      setTemplate((prev) => ({
        ...prev,
        markers: prev.markers.map((marker) => {
          if (marker.questionNumber === questionNumber) {
            return {
              ...marker,
              x: marker.x + deltaX,
              y: marker.y + deltaY,
            };
          }
          return marker;
        }),
      }));
    } else {
      // 개별 이동
      updateMarkerPosition(selectedMarker, { x, y });
    }

    setDragStart({ x, y });
  };

  // 마우스 업 (드래그 종료)
  const handleMouseUp = () => {
    setIsDragging(false);
    setDragStart(null);
  };

  // 이미지 클릭 (빈 공간 클릭 시)
  const handleImageClick = (e: React.MouseEvent) => {
    const rect = imageRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    console.log(`클릭 좌표: (${x.toFixed(2)}%, ${y.toFixed(2)}%)`);
  };

  // 자동 그리드 생성 (열 기반)
  const generateGrid = () => {
    const markers: OMRMarkerPosition[] = [];
    const { optionsPerQuestion } = template;
    const {
      horizontalSpacing,
      verticalSpacing,
      markerWidth,
      markerHeight,
      columns,
    } = gridSettings;

    // 각 열마다 마커 생성
    columns.forEach((column) => {
      for (let q = column.start; q <= column.end; q++) {
        // 해당 열 내에서의 인덱스 (0부터 시작)
        const indexInColumn = q - column.start;

        for (let opt = 1; opt <= optionsPerQuestion; opt++) {
          markers.push({
            questionNumber: q,
            optionNumber: opt,
            x: column.startX + (opt - 1) * horizontalSpacing,
            y: column.startY + indexInColumn * verticalSpacing,
            width: markerWidth,
            height: markerHeight,
          });
        }
      }
    });

    setTemplate((prev) => ({ ...prev, markers }));
  };

  // JSON 다운로드
  const downloadTemplate = () => {
    const json = JSON.stringify(template, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `omr-template-${template.name}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // JSON 업로드
  const uploadTemplate = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        setTemplate(json);
      } catch (error) {
        alert("템플릿 파일을 읽을 수 없습니다.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      {/* 컨트롤 패널 */}
      <div className="border rounded-lg p-4 bg-gray-50">
        <div className="flex flex-wrap gap-4 items-center justify-between mb-4">
          <div className="flex gap-2 items-center">
            <label className="font-semibold text-gray-700">템플릿 이름:</label>
            <input
              type="text"
              value={template.name}
              onChange={(e) =>
                setTemplate((prev) => ({ ...prev, name: e.target.value }))
              }
              className="px-3 py-2 border rounded-lg"
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            <button
              onClick={generateGrid}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Grid className="h-4 w-4" />
              자동 그리드 생성
            </button>

            <button
              onClick={() => setGroupMoveMode(!groupMoveMode)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                groupMoveMode
                  ? "bg-orange-600 text-white hover:bg-orange-700"
                  : "bg-gray-300 text-gray-700 hover:bg-gray-400"
              }`}
            >
              <Move className="h-4 w-4" />
              {groupMoveMode ? "그룹 이동 ON" : "개별 이동"}
            </button>

            <button
              onClick={downloadTemplate}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Download className="h-4 w-4" />
              저장
            </button>

            <label className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 cursor-pointer">
              <Upload className="h-4 w-4" />
              불러오기
              <input
                type="file"
                accept=".json"
                onChange={uploadTemplate}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* 그리드 설정 */}
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">그리드 자동 생성 설정</h3>
          <p className="text-xs text-blue-600 mb-3">
            💡 마커 크기와 간격을 조정하세요. 각 열의 문항 범위와 X 위치를 설정할 수 있습니다.
          </p>

          {/* 열 설정 */}
          <div className="mb-4 space-y-3">
            <h4 className="text-sm font-semibold text-blue-800">열(Column) 설정</h4>
            {gridSettings.columns.map((column, index) => (
              <div key={index} className="grid grid-cols-4 gap-2 p-3 bg-white rounded-lg border border-blue-300">
                <div>
                  <label className="text-xs text-gray-600">시작 문항</label>
                  <input
                    type="number"
                    value={column.start}
                    onChange={(e) => {
                      const newColumns = [...gridSettings.columns];
                      newColumns[index].start = parseInt(e.target.value) || 1;
                      setGridSettings((prev) => ({ ...prev, columns: newColumns }));
                    }}
                    className="w-full px-2 py-1 border rounded text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-600">끝 문항</label>
                  <input
                    type="number"
                    value={column.end}
                    onChange={(e) => {
                      const newColumns = [...gridSettings.columns];
                      newColumns[index].end = parseInt(e.target.value) || 1;
                      setGridSettings((prev) => ({ ...prev, columns: newColumns }));
                    }}
                    className="w-full px-2 py-1 border rounded text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-600">X 위치 (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={column.startX}
                    onChange={(e) => {
                      const newColumns = [...gridSettings.columns];
                      newColumns[index].startX = parseFloat(e.target.value) || 0;
                      setGridSettings((prev) => ({ ...prev, columns: newColumns }));
                    }}
                    className="w-full px-2 py-1 border rounded text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-600">Y 위치 (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={column.startY}
                    onChange={(e) => {
                      const newColumns = [...gridSettings.columns];
                      newColumns[index].startY = parseFloat(e.target.value) || 0;
                      setGridSettings((prev) => ({ ...prev, columns: newColumns }));
                    }}
                    className="w-full px-2 py-1 border rounded text-sm"
                  />
                </div>
              </div>
            ))}
            <button
              onClick={() => {
                const lastColumn = gridSettings.columns[gridSettings.columns.length - 1];
                setGridSettings((prev) => ({
                  ...prev,
                  columns: [
                    ...prev.columns,
                    {
                      start: lastColumn.end + 1,
                      end: lastColumn.end + 10,
                      startX: lastColumn.startX + 30,
                      startY: lastColumn.startY,
                    },
                  ],
                }));
              }}
              className="text-xs px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              + 열 추가
            </button>
          </div>

          {/* 공통 설정 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="text-xs text-blue-700 font-medium">가로 간격 (%)</label>
              <input
                type="number"
                step="0.1"
                value={gridSettings.horizontalSpacing}
                onChange={(e) =>
                  setGridSettings((prev) => ({
                    ...prev,
                    horizontalSpacing: parseFloat(e.target.value) || 0,
                  }))
                }
                className="w-full px-3 py-2 border rounded-lg text-sm"
              />
            </div>

            <div>
              <label className="text-xs text-blue-700 font-medium">세로 간격 (%)</label>
              <input
                type="number"
                step="0.1"
                value={gridSettings.verticalSpacing}
                onChange={(e) =>
                  setGridSettings((prev) => ({
                    ...prev,
                    verticalSpacing: parseFloat(e.target.value) || 0,
                  }))
                }
                className="w-full px-3 py-2 border rounded-lg text-sm"
              />
            </div>

            <div>
              <label className="text-xs text-blue-700 font-medium">마커 너비 (%)</label>
              <input
                type="number"
                step="0.1"
                value={gridSettings.markerWidth}
                onChange={(e) =>
                  setGridSettings((prev) => ({
                    ...prev,
                    markerWidth: parseFloat(e.target.value) || 0,
                  }))
                }
                className="w-full px-3 py-2 border rounded-lg text-sm"
              />
            </div>

            <div>
              <label className="text-xs text-blue-700 font-medium">마커 높이 (%)</label>
              <input
                type="number"
                step="0.1"
                value={gridSettings.markerHeight}
                onChange={(e) =>
                  setGridSettings((prev) => ({
                    ...prev,
                    markerHeight: parseFloat(e.target.value) || 0,
                  }))
                }
                className="w-full px-3 py-2 border rounded-lg text-sm"
              />
            </div>
          </div>

          <div className="mt-3 text-xs text-blue-600">
            💡 위 설정값을 조정한 후 &quot;자동 그리드 생성&quot; 버튼을 클릭하세요
          </div>
        </div>

        {/* 템플릿 설정 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="text-sm text-gray-600">전체 문항</label>
            <input
              type="number"
              value={template.totalQuestions || ""}
              onChange={(e) => {
                const value = parseInt(e.target.value);
                if (!isNaN(value) && value > 0) {
                  setTemplate((prev) => ({
                    ...prev,
                    totalQuestions: value,
                  }));
                }
              }}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">선택지 개수</label>
            <input
              type="number"
              value={template.optionsPerQuestion || ""}
              onChange={(e) => {
                const value = parseInt(e.target.value);
                if (!isNaN(value) && value > 0) {
                  setTemplate((prev) => ({
                    ...prev,
                    optionsPerQuestion: value,
                  }));
                }
              }}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">마커 개수</label>
            <div className="px-3 py-2 bg-white border rounded-lg">
              {template.markers.length}
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-600">확대/축소</label>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={scale}
              onChange={(e) => setScale(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* 이미지 편집 영역 */}
      <div className="border rounded-lg overflow-auto bg-gray-100 p-4">
        <div
          ref={imageRef}
          className="relative mx-auto cursor-crosshair"
          style={{
            transform: `scale(${scale})`,
            transformOrigin: "top left",
            width: "fit-content",
          }}
          onClick={handleImageClick}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* 배경 이미지 */}
          <img
            src={template.imageUrl}
            alt="OMR Template"
            className="block max-w-full"
            draggable={false}
          />

          {/* 마커들 */}
          {template.markers.map((marker, index) => (
            <div
              key={index}
              className={`absolute border-2 cursor-move transition-all ${
                selectedMarker === index
                  ? "border-blue-500 bg-blue-200/50"
                  : "border-green-500 bg-green-200/30"
              } hover:border-blue-500 hover:bg-blue-200/50`}
              style={{
                left: `${marker.x}%`,
                top: `${marker.y}%`,
                width: `${marker.width}%`,
                height: `${marker.height}%`,
              }}
              onMouseDown={(e) => handleMouseDown(e, index)}
              onClick={(e) => e.stopPropagation()}
            >
              {/* 마커 레이블 - 선택된 마커에만 표시 */}
              {selectedMarker === index && (
                <div className="absolute -top-6 left-0 bg-black/70 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                  Q{marker.questionNumber}-{marker.optionNumber}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 선택된 마커 정보 */}
      {selectedMarker !== null && (
        <div className="border rounded-lg p-4 bg-blue-50">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-lg">
              마커 편집: Q{template.markers[selectedMarker].questionNumber}-
              {template.markers[selectedMarker].optionNumber}
            </h3>
            <button
              onClick={() => removeMarker(selectedMarker)}
              className="flex items-center gap-2 px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              <Trash2 className="h-4 w-4" />
              삭제
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm text-gray-600">X 위치 (%)</label>
              <input
                type="number"
                step="0.1"
                value={template.markers[selectedMarker].x.toFixed(2)}
                onChange={(e) =>
                  updateMarkerPosition(selectedMarker, {
                    x: parseFloat(e.target.value),
                  })
                }
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="text-sm text-gray-600">Y 위치 (%)</label>
              <input
                type="number"
                step="0.1"
                value={template.markers[selectedMarker].y.toFixed(2)}
                onChange={(e) =>
                  updateMarkerPosition(selectedMarker, {
                    y: parseFloat(e.target.value),
                  })
                }
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="text-sm text-gray-600">너비 (%)</label>
              <input
                type="number"
                step="0.1"
                value={template.markers[selectedMarker].width.toFixed(2)}
                onChange={(e) =>
                  updateMarkerPosition(selectedMarker, {
                    width: parseFloat(e.target.value),
                  })
                }
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="text-sm text-gray-600">높이 (%)</label>
              <input
                type="number"
                step="0.1"
                value={template.markers[selectedMarker].height.toFixed(2)}
                onChange={(e) =>
                  updateMarkerPosition(selectedMarker, {
                    height: parseFloat(e.target.value),
                  })
                }
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
