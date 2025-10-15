"use client";

import { DAYS_OF_WEEK } from "@/constants/schedule";
import { defaultScheduleConfig, getDensityColor } from "@/lib/utils";
import { formatDisplayTime } from "@/lib/utils/time";
import { ClassBlock, EditMode, ScheduleConfig } from "@/types/schedule";
import { Check, Clock, Users, X } from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";

const days = DAYS_OF_WEEK;

interface CanvasScheduleProps {
  editMode?: EditMode;
  config?: ScheduleConfig;
  showDensity?: boolean;
  customBlocks?: ClassBlock[]; // 커스텀 블록 데이터
  onBlocksChange?: (blocks: ClassBlock[]) => void; // 블록 변경 콜백
  selectedClassId?: string; // 선택된 수업 ID (강사 모드용)
  selectedClassStudents?: string[]; // 선택된 수업의 학생 ID 목록 (밀집도 계산용)
  customDensityData?: { [key: string]: number }; // 외부에서 계산된 밀집도 데이터
  densityTooltipData?: {
    [key: string]: Array<{
      studentId: string;
      studentName: string;
      scheduleName: string;
    }>;
  }; // 툴팁용 상세 데이터
  onTimeSlotClick?: (timeSlot: {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
  }) => void; // 시간대 클릭 콜백
  onBlockClick?: (block: ClassBlock) => void; // 블록 클릭 콜백 (선택 모드용)
  selectedBlockIds?: string[]; // 선택된 블록 ID 목록 (하이라이트 표시용)
}

interface ClassModalProps {
  block: ClassBlock | null;
  editMode: EditMode;
  isOpen: boolean;
  onClose: () => void;
  onSave: (blockId: string, updatedData: Partial<ClassBlock>) => void;
}

function ClassModal({
  block,
  editMode,
  isOpen,
  onClose,
  onSave,
}: ClassModalProps) {
  const [editData, setEditData] = useState({
    title: block?.title || "",
    teacherName: block?.teacherName || "",
    room: block?.room || "",
    subject: block?.subject || "",
    startTime: block?.startTime || "",
    endTime: block?.endTime || "",
  });

  React.useEffect(() => {
    if (block) {
      setEditData({
        title: block.title,
        teacherName: block.teacherName,
        room: block.room || "",
        subject: block.subject,
        startTime: block.startTime,
        endTime: block.endTime,
      });
    }
  }, [block]);

  if (!isOpen || !block) return null;

  const canEdit = editMode === "admin" || editMode === "edit";

  const handleSave = () => {
    onSave(block.id, editData);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 text-[#2d2d2d]"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md p-6 mx-4 border-0 flat-card rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">수업 정보</h3>
          <button
            onClick={onClose}
            className="p-2 text-gray-600 transition-all duration-200 flat-card rounded-xl hover:flat-pressed hover:text-gray-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          {canEdit ? (
            <>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  수업명
                </label>
                <input
                  type="text"
                  value={editData.title}
                  onChange={(e) =>
                    setEditData({ ...editData, title: e.target.value })
                  }
                  className="w-full px-4 py-3 text-gray-800 transition-all duration-200 flat-surface rounded-xl placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  과목
                </label>
                <input
                  type="text"
                  value={editData.subject}
                  onChange={(e) =>
                    setEditData({ ...editData, subject: e.target.value })
                  }
                  className="w-full px-4 py-3 text-gray-800 transition-all duration-200 flat-surface rounded-xl placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  강사명
                </label>
                <input
                  type="text"
                  value={editData.teacherName}
                  onChange={(e) =>
                    setEditData({ ...editData, teacherName: e.target.value })
                  }
                  className="w-full px-4 py-3 text-gray-800 transition-all duration-200 flat-surface rounded-xl placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  강의실
                </label>
                <input
                  type="text"
                  value={editData.room}
                  onChange={(e) =>
                    setEditData({ ...editData, room: e.target.value })
                  }
                  className="w-full px-4 py-3 text-gray-800 transition-all duration-200 flat-surface rounded-xl placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    시작 시간
                  </label>
                  <input
                    type="time"
                    value={editData.startTime}
                    onChange={(e) =>
                      setEditData({ ...editData, startTime: e.target.value })
                    }
                    className="w-full px-4 py-3 text-gray-800 transition-all duration-200 flat-surface rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    종료 시간
                  </label>
                  <input
                    type="time"
                    value={editData.endTime}
                    onChange={(e) =>
                      setEditData({ ...editData, endTime: e.target.value })
                    }
                    className="w-full px-4 py-3 text-gray-800 transition-all duration-200 flat-surface rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              <div>
                <span className="block text-sm font-medium text-gray-700">
                  수업명
                </span>
                <p className="mt-2 font-medium text-gray-800">{block.title}</p>
              </div>

              <div>
                <span className="block text-sm font-medium text-gray-700">
                  과목
                </span>
                <p className="mt-2 font-medium text-gray-800">
                  {block.subject}
                </p>
              </div>

              <div>
                <span className="block text-sm font-medium text-gray-700">
                  강사명
                </span>
                <p className="mt-2 font-medium text-gray-800">
                  {block.teacherName}
                </p>
              </div>

              <div>
                <span className="block text-sm font-medium text-gray-700">
                  강의실
                </span>
                <p className="mt-2 font-medium text-gray-800">
                  {block.room || "미정"}
                </p>
              </div>
            </>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="block text-sm font-medium text-gray-700">
                시간
              </span>
              <div className="flex items-center mt-2">
                <Clock className="w-4 h-4 mr-2 text-gray-500" />
                <span className="font-medium text-gray-800">
                  {formatDisplayTime(block.startTime)} ~{" "}
                  {formatDisplayTime(block.endTime)}
                </span>
              </div>
            </div>

            <div>
              <span className="block text-sm font-medium text-gray-700">
                학생 수
              </span>
              <div className="flex items-center mt-2">
                <Users className="w-4 h-4 mr-2 text-gray-500" />
                <span className="font-medium text-gray-800">
                  {block.studentCount}
                  {block.maxStudents && `/${block.maxStudents}`}
                </span>
              </div>
            </div>
          </div>

          {canEdit && (
            <div className="flex gap-3 pt-6 border-t border-gray-300">
              <button
                onClick={handleSave}
                className="flex items-center justify-center flex-1 gap-2 px-4 py-3 font-medium transition-all duration-200 flat-card rounded-xl hover:flat-pressed text-primary-600"
              >
                <Check className="w-4 h-4" />
                저장
              </button>
              <button
                onClick={onClose}
                className="flex items-center justify-center flex-1 gap-2 px-4 py-3 font-medium text-gray-600 transition-all duration-200 flat-card rounded-xl hover:flat-pressed"
              >
                <X className="w-4 h-4" />
                취소
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CanvasSchedule({
  editMode = "view",
  config = defaultScheduleConfig,
  showDensity = false,
  customBlocks,
  onBlocksChange,
  selectedClassId,
  selectedClassStudents,
  customDensityData,
  densityTooltipData,
  onTimeSlotClick,
  onBlockClick,
  selectedBlockIds = [],
}: CanvasScheduleProps) {
  const timeCanvasRef = useRef<HTMLCanvasElement>(null);
  const headerCanvasRef = useRef<HTMLCanvasElement>(null);
  const scheduleCanvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const timeContainerRef = useRef<HTMLDivElement>(null);
  const headerContainerRef = useRef<HTMLDivElement>(null);
  const scheduleContainerRef = useRef<HTMLDivElement>(null);
  // 강사 모드에서는 선택된 수업만 표시
  const filteredBlocks = React.useMemo(() => {
    if (selectedClassId && customBlocks) {
      return customBlocks.filter((block) => block.id === selectedClassId);
    }
    return customBlocks || [];
  }, [selectedClassId, customBlocks]);

  const [classBlocks, setClassBlocks] = useState<ClassBlock[]>(
    () => filteredBlocks
  );
  const [modalBlock, setModalBlock] = useState<ClassBlock | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [containerWidth, setContainerWidth] = useState(1000);
  const [dragState, setDragState] = useState<{
    isDragging: boolean;
    draggedBlock: ClassBlock | null;
    startX: number;
    startY: number;
    offsetX: number;
    offsetY: number;
    previewPosition: {
      dayOfWeek: number;
      startTime: string;
      endTime: string;
    } | null;
  }>({
    isDragging: false,
    draggedBlock: null,
    startX: 0,
    startY: 0,
    offsetX: 0,
    offsetY: 0,
    previewPosition: null,
  });
  const [tooltip, setTooltip] = useState<{
    visible: boolean;
    x: number;
    y: number;
    dayOfWeek: number;
    time: string;
    studentCount: number;
  } | null>(null);

  // 동적 캔버스 설정
  const MIN_DAY_COLUMN_WIDTH = 120; // 요일당 최소 가로 길이
  const HEADER_HEIGHT = 60;
  const TIME_COLUMN_WIDTH = 80;
  const SLOT_HEIGHT = 10; // 10분당 10px
  const GRID_START_Y = HEADER_HEIGHT + 20;

  // 표시할 요일 수 계산 (최소 1일, 최대 7일)
  const availableWidth = containerWidth - TIME_COLUMN_WIDTH;
  const visibleDays = Math.min(
    7,
    Math.max(1, Math.floor(availableWidth / MIN_DAY_COLUMN_WIDTH))
  );
  const visibleDaysArray = days.slice(0, visibleDays);
  const DAY_COLUMN_WIDTH = availableWidth / visibleDays;

  // 동적 크기 계산
  const TIME_CANVAS_WIDTH = TIME_COLUMN_WIDTH;
  const HEADER_CANVAS_WIDTH = DAY_COLUMN_WIDTH * 7; // 전체 7일 너비
  const SCHEDULE_CANVAS_WIDTH = DAY_COLUMN_WIDTH * 7; // 전체 7일 너비
  const TIME_CANVAS_HEIGHT = 900; // 충분히 긴 높이로 스크롤 가능하게
  const SCHEDULE_CANVAS_HEIGHT = 900; // 충분히 긴 높이로 스크롤 가능하게
  const CANVAS_HEIGHT = 1000;

  // 시간 파싱 유틸리티
  const parseTime = (time: string): number => {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
  };

  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}`;
  };

  // formatDisplayTime은 이미 import되어 있으므로 제거

  // 모서리가 둥근 사각형을 그리는 함수
  const drawRoundedRect = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number
  ) => {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  };

  // 시간 캔버스 그리기 함수 (고정, 세로 스크롤만)
  const drawTimeCanvas = useCallback(() => {
    const canvas = timeCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // 고해상도 설정
    const dpr = window.devicePixelRatio || 1;
    canvas.width = TIME_CANVAS_WIDTH * dpr;
    canvas.height = TIME_CANVAS_HEIGHT * dpr;
    canvas.style.width = `${TIME_CANVAS_WIDTH}px`;
    canvas.style.height = `${TIME_CANVAS_HEIGHT}px`;
    ctx.scale(dpr, dpr);

    // 배경 클리어 (neumorphism background)
    ctx.fillStyle = "#fafbfa"; // neu-50 (much lighter)
    ctx.fillRect(0, 0, TIME_CANVAS_WIDTH, TIME_CANVAS_HEIGHT);

    // 시간 레이블
    ctx.fillStyle = "#6f756f"; // neu-700
    ctx.font = "12px sans-serif";
    ctx.textAlign = "right";
    for (let hour = config.startHour; hour <= config.endHour; hour++) {
      const y =
        (((hour - config.startHour) * 60) / config.timeSlotMinutes) *
          SLOT_HEIGHT +
        20;
      ctx.fillText(`${hour}:00`, TIME_CANVAS_WIDTH - 10, y + 5);
    }
  }, [config]);

  // 헤더 캔버스 그리기 함수 (고정, 가로 스크롤만)
  const drawHeaderCanvas = useCallback(() => {
    const canvas = headerCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // 고해상도 설정
    const dpr = window.devicePixelRatio || 1;
    canvas.width = HEADER_CANVAS_WIDTH * dpr;
    canvas.height = HEADER_HEIGHT * dpr;
    canvas.style.width = `${HEADER_CANVAS_WIDTH}px`;
    canvas.style.height = `${HEADER_HEIGHT}px`;
    ctx.scale(dpr, dpr);

    // 배경 클리어 (neumorphism background)
    ctx.fillStyle = "#fafbfa"; // neu-50 (much lighter)
    ctx.fillRect(0, 0, HEADER_CANVAS_WIDTH, HEADER_HEIGHT);

    // 헤더 하단 경계선
    ctx.strokeStyle = "#e4e6e4"; // neu-300
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, HEADER_HEIGHT - 1);
    ctx.lineTo(HEADER_CANVAS_WIDTH, HEADER_HEIGHT - 1);
    ctx.stroke();

    // 요일 헤더
    ctx.fillStyle = "#4a504a"; // neu-800
    ctx.font = "bold 14px sans-serif";
    ctx.textAlign = "center";

    days.forEach((day, index) => {
      const x = index * DAY_COLUMN_WIDTH + DAY_COLUMN_WIDTH / 2;
      ctx.fillText(day, x, HEADER_HEIGHT / 2 + 5);

      // 세로 구분선
      if (index > 0) {
        ctx.strokeStyle = "#e4e6e4"; // neu-300
        ctx.beginPath();
        ctx.moveTo(index * DAY_COLUMN_WIDTH, 0);
        ctx.lineTo(index * DAY_COLUMN_WIDTH, HEADER_HEIGHT);
        ctx.stroke();
      }
    });
  }, [DAY_COLUMN_WIDTH]);

  // 스케줄 캔버스 그리기 함수 (세로 스크롤만)
  const drawScheduleCanvas = useCallback(() => {
    const canvas = scheduleCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // 고해상도 설정
    const dpr = window.devicePixelRatio || 1;
    canvas.width = SCHEDULE_CANVAS_WIDTH * dpr;
    canvas.height = SCHEDULE_CANVAS_HEIGHT * dpr;
    canvas.style.width = `${SCHEDULE_CANVAS_WIDTH}px`;
    canvas.style.height = `${SCHEDULE_CANVAS_HEIGHT}px`;
    ctx.scale(dpr, dpr);

    // 배경 클리어 (neumorphism background)
    ctx.fillStyle = "#fafbfa"; // neu-50 (much lighter)
    ctx.fillRect(0, 0, SCHEDULE_CANVAS_WIDTH, SCHEDULE_CANVAS_HEIGHT);

    // 세로 구분선
    ctx.strokeStyle = "#e4e6e4"; // neu-300
    ctx.lineWidth = 1;
    days.forEach((day, index) => {
      if (index > 0) {
        ctx.beginPath();
        ctx.moveTo(index * DAY_COLUMN_WIDTH, 0);
        ctx.lineTo(index * DAY_COLUMN_WIDTH, SCHEDULE_CANVAS_HEIGHT);
        ctx.stroke();
      }
    });

    // 그리드 (가로선)
    ctx.strokeStyle = "#d1d4d1"; // neu-400 (lighter grid lines)
    ctx.lineWidth = 1;
    for (let hour = config.startHour; hour <= config.endHour; hour++) {
      const y =
        (((hour - config.startHour) * 60) / config.timeSlotMinutes) *
          SLOT_HEIGHT +
        20;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(SCHEDULE_CANVAS_WIDTH, y);
      ctx.stroke();
    }

    // 학생 일정 밀집도 표시
    if (showDensity && customDensityData) {
      const densityData = customDensityData;
      const maxDensity = Math.max(
        ...Object.values(densityData).map((v) => Number(v))
      );

      for (let day = 0; day < 7; day++) {
        for (let hour = config.startHour; hour <= config.endHour; hour++) {
          for (let minute = 0; minute < 60; minute += config.timeSlotMinutes) {
            const time = `${hour.toString().padStart(2, "0")}:${minute
              .toString()
              .padStart(2, "0")}`;
            const key = `${day}-${time}`;
            const density = densityData[key] || 0;

            if (density > 0) {
              const x = day * DAY_COLUMN_WIDTH;
              const y =
                (((hour - config.startHour) * 60 + minute) /
                  config.timeSlotMinutes) *
                  SLOT_HEIGHT +
                20;
              const width = DAY_COLUMN_WIDTH;
              const height = SLOT_HEIGHT;

              const color = getDensityColor(density, maxDensity);
              ctx.fillStyle = color;
              ctx.fillRect(x, y, width, height);
            }
          }
        }
      }
    }

    // 수업 블록 그리기
    classBlocks.forEach((block) => {
      if (dragState.isDragging && dragState.draggedBlock?.id === block.id)
        return;

      const startMinutes = parseTime(block.startTime);
      const endMinutes = parseTime(block.endTime);
      const configStartMinutes = config.startHour * 60;

      const x = block.dayOfWeek * DAY_COLUMN_WIDTH + 2;
      const y =
        ((startMinutes - configStartMinutes) / config.timeSlotMinutes) *
          SLOT_HEIGHT +
        20;
      const width = DAY_COLUMN_WIDTH - 4;
      const height =
        ((endMinutes - startMinutes) / config.timeSlotMinutes) * SLOT_HEIGHT;

      // 선택된 블록인지 확인
      const isSelected = selectedBlockIds.includes(block.id);

      // 블록 배경 (neumorphism effect)
      const radius = 12;

      // Neumorphism shadow effect
      ctx.shadowColor = "rgba(168, 173, 168, 0.3)";
      ctx.shadowOffsetX = 4;
      ctx.shadowOffsetY = 4;
      ctx.shadowBlur = 8;

      ctx.fillStyle = "#f5f6f5"; // neu-100 base
      drawRoundedRect(ctx, x, y, width, height, radius);
      ctx.fill();

      // Inner highlight shadow
      ctx.shadowColor = "rgba(255, 255, 255, 0.8)";
      ctx.shadowOffsetX = -2;
      ctx.shadowOffsetY = -2;
      ctx.shadowBlur = 4;

      drawRoundedRect(ctx, x + 1, y + 1, width - 2, height - 2, radius - 1);
      ctx.fill();

      // Reset shadow
      ctx.shadowColor = "transparent";
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
      ctx.shadowBlur = 0;

      // Color overlay with gradient - 선명한 색상
      const gradient = ctx.createLinearGradient(x, y, x, y + height);
      if (isSelected) {
        // 선택된 블록은 약간 밝게
        gradient.addColorStop(0, block.color + "CC"); // 80% opacity
        gradient.addColorStop(1, block.color + "B3"); // 70% opacity
      } else {
        // 선택되지 않은 블록은 선명하게
        gradient.addColorStop(0, block.color + "FF"); // 100% opacity
        gradient.addColorStop(1, block.color + "F2"); // 95% opacity
      }

      ctx.fillStyle = gradient;
      drawRoundedRect(ctx, x + 2, y + 2, width - 4, height - 4, radius - 2);
      ctx.fill();

      // Border - 선택된 블록은 강조 테두리
      if (isSelected) {
        ctx.strokeStyle = "#6b7c5d"; // primary-500
        ctx.lineWidth = 3;
      } else {
        ctx.strokeStyle = "rgba(168, 173, 168, 0.2)";
        ctx.lineWidth = 1;
      }
      drawRoundedRect(ctx, x, y, width, height, radius);
      ctx.stroke();

      // 뱃지 (수업/클리닉) - 오른쪽 아래 내부 디자인 (수업만 표시)
      if (
        block.compositionType &&
        height > 25 &&
        block.subject !== "personal"
      ) {
        const badgeText =
          block.compositionType === "clinic" ? "클리닉" : "수업";
        const badgeWidth = 44; // 가로 길이
        const badgeHeight = 24; // 세로 높이 줄임
        const badgeX = x + width - badgeWidth - 8; // 카드 안쪽 오른쪽
        const badgeY = y + height - badgeHeight - 8; // 카드 안쪽 아래
        const badgeRadius = 6;

        // 뱃지 그림자
        ctx.shadowColor = "rgba(0, 0, 0, 0.3)";
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        ctx.shadowBlur = 4;

        // 뱃지 배경 (흰색)
        ctx.fillStyle = "#ffffff";
        drawRoundedRect(
          ctx,
          badgeX,
          badgeY,
          badgeWidth,
          badgeHeight,
          badgeRadius
        );
        ctx.fill();

        // 뱃지 테두리
        ctx.strokeStyle = "rgba(0, 0, 0, 0.1)";
        ctx.lineWidth = 1;
        drawRoundedRect(
          ctx,
          badgeX,
          badgeY,
          badgeWidth,
          badgeHeight,
          badgeRadius
        );
        ctx.stroke();

        // 그림자 리셋
        ctx.shadowColor = "transparent";
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        ctx.shadowBlur = 0;

        // 뱃지 텍스트 (가로로 표시)
        ctx.fillStyle = block.color; // 블록 색상과 동일
        ctx.font = "bold 10px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        // 뱃지 중앙에 텍스트 배치
        const centerX = badgeX + badgeWidth / 2;
        const centerY = badgeY + badgeHeight / 2;
        ctx.fillText(badgeText, centerX, centerY);
      }

      // 텍스트 (왼쪽 위 정렬)
      ctx.fillStyle = "#ffffff"; // 흰색 텍스트
      ctx.font = "bold 13px sans-serif";
      ctx.textAlign = "left";

      // Text shadow for better readability
      ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
      ctx.shadowOffsetX = 1;
      ctx.shadowOffsetY = 1;
      ctx.shadowBlur = 2;

      // 제목 (왼쪽 위에 배치)
      const titleY = y + 16;
      ctx.fillText(block.title, x + 10, titleY);

      // 시간 (충분한 공간이 있을 때만)
      if (height > 40) {
        ctx.font = "11px sans-serif";
        ctx.fillStyle = "#ffffff"; // 흰색 텍스트
        ctx.fillText(
          `${formatDisplayTime(block.startTime)} ~ ${formatDisplayTime(
            block.endTime
          )}`,
          x + 10,
          titleY + 18
        );
      }

      // Reset text shadow
      ctx.shadowColor = "transparent";
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
      ctx.shadowBlur = 0;

      // 수정 아이콘 (편집/관리자 모드일 때만)
      if (editMode === "edit" || editMode === "admin") {
        const iconSize = 20;
        const iconX = x + width - iconSize - 8;
        const iconY = y + 8;

        // 아이콘 배경 (neumorphism button)
        ctx.shadowColor = "rgba(168, 173, 168, 0.25)";
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        ctx.shadowBlur = 4;

        ctx.fillStyle = "#f5f6f5"; // neu-100
        drawRoundedRect(ctx, iconX, iconY, iconSize, iconSize, 6);
        ctx.fill();

        // Inner highlight
        ctx.shadowColor = "rgba(255, 255, 255, 0.7)";
        ctx.shadowOffsetX = -1;
        ctx.shadowOffsetY = -1;
        ctx.shadowBlur = 2;

        drawRoundedRect(
          ctx,
          iconX + 1,
          iconY + 1,
          iconSize - 2,
          iconSize - 2,
          5
        );
        ctx.fill();

        // Reset shadow
        ctx.shadowColor = "transparent";
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        ctx.shadowBlur = 0;

        // 점 세 개 아이콘 (MoreHorizontal)
        ctx.fillStyle = "#6f756f"; // neu-700
        const centerX = iconX + iconSize / 2;
        const centerY = iconY + iconSize / 2;
        const dotRadius = 1.5;
        const spacing = 4;

        // 왼쪽 점
        ctx.beginPath();
        ctx.arc(centerX - spacing, centerY, dotRadius, 0, 2 * Math.PI);
        ctx.fill();

        // 가운데 점
        ctx.beginPath();
        ctx.arc(centerX, centerY, dotRadius, 0, 2 * Math.PI);
        ctx.fill();

        // 오른쪽 점
        ctx.beginPath();
        ctx.arc(centerX + spacing, centerY, dotRadius, 0, 2 * Math.PI);
        ctx.fill();
      }
    });

    // 드래그 중인 블록 그리기
    if (dragState.isDragging && dragState.draggedBlock) {
      const block = dragState.draggedBlock;
      const startMinutes = parseTime(block.startTime);
      const endMinutes = parseTime(block.endTime);

      const width = DAY_COLUMN_WIDTH - 4;
      const height =
        ((endMinutes - startMinutes) / config.timeSlotMinutes) * SLOT_HEIGHT;

      const x = dragState.startX + dragState.offsetX - width / 2;
      const y = dragState.startY + dragState.offsetY - height / 2;

      // 드래그 중인 블록 (neumorphism effect with enhanced shadow)
      const radius = 12;
      ctx.globalAlpha = 0.9;

      // Enhanced shadow for dragging
      ctx.shadowColor = "rgba(168, 173, 168, 0.4)";
      ctx.shadowOffsetX = 8;
      ctx.shadowOffsetY = 8;
      ctx.shadowBlur = 16;

      ctx.fillStyle = "#f5f6f5"; // neu-100 base
      drawRoundedRect(ctx, x, y, width, height, radius);
      ctx.fill();

      // Color overlay
      const gradient = ctx.createLinearGradient(x, y, x, y + height);
      gradient.addColorStop(0, block.color + "F0"); // Higher opacity for drag state
      gradient.addColorStop(1, block.color + "E0");

      ctx.fillStyle = gradient;
      drawRoundedRect(ctx, x + 2, y + 2, width - 4, height - 4, radius - 2);
      ctx.fill();

      // Reset shadow
      ctx.shadowColor = "transparent";
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
      ctx.shadowBlur = 0;

      // Border
      ctx.strokeStyle = "rgba(168, 173, 168, 0.3)";
      ctx.lineWidth = 2;
      drawRoundedRect(ctx, x, y, width, height, radius);
      ctx.stroke();

      // 텍스트
      ctx.fillStyle = "#ffffff"; // 흰색 텍스트
      ctx.font = "bold 13px sans-serif";
      ctx.textAlign = "left";

      // Text shadow
      ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
      ctx.shadowOffsetX = 1;
      ctx.shadowOffsetY = 1;
      ctx.shadowBlur = 2;

      ctx.fillText(block.title, x + 12, y + 18);

      // Reset effects
      ctx.shadowColor = "transparent";
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1.0;

      // 드롭 프리뷰 그리기
      if (dragState.previewPosition) {
        const { dayOfWeek, startTime, endTime } = dragState.previewPosition;
        const startMinutes = parseTime(startTime);
        const endMinutes = parseTime(endTime);
        const configStartMinutes = config.startHour * 60;

        const px = dayOfWeek * DAY_COLUMN_WIDTH + 2;
        const py =
          ((startMinutes - configStartMinutes) / config.timeSlotMinutes) *
            SLOT_HEIGHT +
          20;
        const pwidth = DAY_COLUMN_WIDTH - 4;
        const pheight =
          ((endMinutes - startMinutes) / config.timeSlotMinutes) * SLOT_HEIGHT;

        // 드롭 프리뷰 (neumorphism inset effect)
        const radius = 12;
        ctx.globalAlpha = 0.6;

        // Inset shadow for drop preview
        ctx.shadowColor = "rgba(168, 173, 168, 0.4)";
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        ctx.shadowBlur = 0;

        // Create inset effect with darker background
        ctx.fillStyle = "#e4e6e4"; // neu-300 for inset look
        drawRoundedRect(ctx, px, py, pwidth, pheight, radius);
        ctx.fill();

        // Color overlay for preview
        ctx.globalAlpha = 0.4;
        ctx.fillStyle = dragState.draggedBlock.color;
        drawRoundedRect(
          ctx,
          px + 2,
          py + 2,
          pwidth - 4,
          pheight - 4,
          radius - 2
        );
        ctx.fill();

        // 점선 테두리
        ctx.globalAlpha = 0.8;
        ctx.strokeStyle = "#6b7c5d"; // primary-500
        ctx.lineWidth = 2;
        ctx.setLineDash([8, 4]);
        drawRoundedRect(ctx, px, py, pwidth, pheight, radius);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.globalAlpha = 1.0;
      }
    }
  }, [
    classBlocks,
    dragState,
    config,
    editMode,
    showDensity,
    DAY_COLUMN_WIDTH,
    selectedClassStudents,
    customDensityData,
    selectedBlockIds,
  ]);

  // 마우스 이벤트 핸들러
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = scheduleCanvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const clickedBlock = getBlockAtPosition(x, y);

    if (clickedBlock) {
      if (
        (editMode === "edit" || editMode === "admin") &&
        isInEditIcon(x, y, clickedBlock)
      ) {
        // 수정 아이콘 클릭 - 모달 열기
        setModalBlock(clickedBlock);
        setIsModalOpen(true);
      } else if (onBlockClick) {
        // onBlockClick이 제공된 경우 (선택 모드) - 콜백 호출
        onBlockClick(clickedBlock);
        // } else if (editMode === "admin" && clickedBlock.isEditable !== false) {
      } else if (editMode === "admin") {
        // 관리자 모드에서 편집 가능한 블록의 다른 부분 클릭 - 드래그 시작
        setDragState({
          isDragging: true,
          draggedBlock: clickedBlock,
          startX: x,
          startY: y,
          offsetX: 0,
          offsetY: 0,
          previewPosition: null,
        });
      } else {
        // 조회 모드 또는 편집 불가능한 블록 - 모달 열기
        setModalBlock(clickedBlock);
        setIsModalOpen(true);
      }
    } else if (onTimeSlotClick && editMode === "admin") {
      // 빈 시간을 클릭했을 때 시간대 계산해서 콜백 호출
      const dayIndex = Math.floor(x / DAY_COLUMN_WIDTH);
      const slotIndex = Math.floor((y - 20) / SLOT_HEIGHT);

      if (dayIndex >= 0 && dayIndex < 7 && slotIndex >= 0) {
        const startHour =
          Math.floor((slotIndex * config.timeSlotMinutes) / 60) +
          config.startHour;
        const startMinute = (slotIndex * config.timeSlotMinutes) % 60;
        // 90분(1시간 30분) = 90 / timeSlotMinutes 슬롯
        const slotsFor90Min = Math.ceil(90 / config.timeSlotMinutes);
        const endHour =
          Math.floor(
            ((slotIndex + slotsFor90Min) * config.timeSlotMinutes) / 60
          ) + config.startHour;
        const endMinute =
          ((slotIndex + slotsFor90Min) * config.timeSlotMinutes) % 60;

        const startTime = `${startHour
          .toString()
          .padStart(2, "0")}:${startMinute.toString().padStart(2, "0")}`;
        const endTime = `${endHour.toString().padStart(2, "0")}:${endMinute
          .toString()
          .padStart(2, "0")}`;

        onTimeSlotClick({
          dayOfWeek: dayIndex,
          startTime,
          endTime,
        });
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = scheduleCanvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // 밀집도 모드에서 툴팁 표시
    if (showDensity && !dragState.isDragging) {
      const dayIndex = Math.floor(x / DAY_COLUMN_WIDTH);
      const slotIndex = Math.floor((y - 20) / SLOT_HEIGHT);

      if (dayIndex >= 0 && dayIndex < 7 && slotIndex >= 0) {
        const hour =
          Math.floor((slotIndex * config.timeSlotMinutes) / 60) +
          config.startHour;
        const minute = (slotIndex * config.timeSlotMinutes) % 60;
        const time = `${hour.toString().padStart(2, "0")}:${minute
          .toString()
          .padStart(2, "0")}`;

        // Use custom tooltip data if available
        if (densityTooltipData) {
          const key = `${dayIndex}-${time}`;
          const schedules = densityTooltipData[key] || [];

          if (schedules.length > 0) {
            setTooltip({
              visible: true,
              x: e.clientX,
              y: e.clientY,
              dayOfWeek: dayIndex,
              time,
              studentCount: schedules.length,
            });
          } else {
            setTooltip(null);
          }
        } else {
          setTooltip(null);
        }
      } else {
        setTooltip(null);
      }
    }

    // 드래그 중일 때의 기존 로직
    if (dragState.isDragging) {
      // 드롭 프리뷰 위치 계산
      const previewPosition = getDropPosition(x, y);

      setDragState((prev) => ({
        ...prev,
        offsetX: x - prev.startX,
        offsetY: y - prev.startY,
        previewPosition,
      }));
    }
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!dragState.isDragging || !dragState.draggedBlock) return;

    const canvas = scheduleCanvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // 드롭 위치 계산
    const newPosition = getDropPosition(x, y);

    if (newPosition) {
      // 블록 위치 업데이트
      const updatedBlocks = classBlocks.map((block) =>
        block.id === dragState.draggedBlock?.id
          ? {
              ...block,
              dayOfWeek: newPosition.dayOfWeek,
              startTime: newPosition.startTime,
              endTime: newPosition.endTime,
            }
          : block
      );
      setClassBlocks(updatedBlocks);
      onBlocksChange?.(updatedBlocks);
    }

    setDragState({
      isDragging: false,
      draggedBlock: null,
      startX: 0,
      startY: 0,
      offsetX: 0,
      offsetY: 0,
      previewPosition: null,
    });
  };

  // 위치에 있는 블록 찾기 (스케줄 캔버스 좌표계)
  const getBlockAtPosition = (x: number, y: number): ClassBlock | null => {
    for (const block of classBlocks) {
      const startMinutes = parseTime(block.startTime);
      const endMinutes = parseTime(block.endTime);
      const configStartMinutes = config.startHour * 60;

      const blockX = block.dayOfWeek * DAY_COLUMN_WIDTH + 2;
      const blockY =
        ((startMinutes - configStartMinutes) / config.timeSlotMinutes) *
          SLOT_HEIGHT +
        20;
      const blockWidth = DAY_COLUMN_WIDTH - 4;
      const blockHeight =
        ((endMinutes - startMinutes) / config.timeSlotMinutes) * SLOT_HEIGHT;

      if (
        x >= blockX &&
        x <= blockX + blockWidth &&
        y >= blockY &&
        y <= blockY + blockHeight
      ) {
        return block;
      }
    }
    return null;
  };

  // 수정 아이콘 영역인지 확인 (스케줄 캔버스 좌표계)
  const isInEditIcon = (x: number, y: number, block: ClassBlock): boolean => {
    const startMinutes = parseTime(block.startTime);
    const configStartMinutes = config.startHour * 60;

    const blockX = block.dayOfWeek * DAY_COLUMN_WIDTH + 2;
    const blockY =
      ((startMinutes - configStartMinutes) / config.timeSlotMinutes) *
        SLOT_HEIGHT +
      20;
    const blockWidth = DAY_COLUMN_WIDTH - 4;

    const iconSize = 20; // Updated to match the canvas drawing
    const iconX = blockX + blockWidth - iconSize - 8; // Updated to match the canvas drawing
    const iconY = blockY + 8; // Updated to match the canvas drawing

    return (
      x >= iconX && x <= iconX + iconSize && y >= iconY && y <= iconY + iconSize
    );
  };

  // 드롭 위치 계산 (스케줄 캔버스 좌표계)
  const getDropPosition = (x: number, y: number) => {
    if (x < 0 || y < 20) return null;
    if (!dragState.draggedBlock) return null;

    // 드래그 중에 중앙 기준으로 표시되므로, 드롭할 때도 중앙 기준으로 계산
    const blockStartMinutes = parseTime(dragState.draggedBlock.startTime);
    const blockEndMinutes = parseTime(dragState.draggedBlock.endTime);
    const blockHeight =
      ((blockEndMinutes - blockStartMinutes) / config.timeSlotMinutes) *
      SLOT_HEIGHT;

    // 마우스 위치에서 블록 중앙까지의 오프셋을 고려
    const adjustedY = y - blockHeight / 2;

    const dayIndex = Math.floor(x / DAY_COLUMN_WIDTH);
    if (dayIndex < 0 || dayIndex >= 7) return null;

    const slotIndex = Math.floor((adjustedY - 20) / SLOT_HEIGHT);
    const startMinutes =
      config.startHour * 60 + slotIndex * config.timeSlotMinutes;

    const originalDuration = blockEndMinutes - blockStartMinutes;
    const endMinutes = startMinutes + originalDuration;

    return {
      dayOfWeek: dayIndex,
      startTime: formatTime(startMinutes),
      endTime: formatTime(endMinutes),
    };
  };

  // 모달 핸들러
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setModalBlock(null);
  };

  const handleSave = (blockId: string, updatedData: Partial<ClassBlock>) => {
    const updatedBlocks = classBlocks.map((block) =>
      block.id === blockId ? { ...block, ...updatedData } : block
    );
    setClassBlocks(updatedBlocks);
    onBlocksChange?.(updatedBlocks);
  };

  // 컨테이너 크기 감지
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };

    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  // 스크롤 동기화 (세로: 시간-스케줄, 가로: 헤더-스케줄)
  useEffect(() => {
    const timeContainer = timeContainerRef.current;
    const headerContainer = headerContainerRef.current;
    const scheduleContainer = scheduleContainerRef.current;

    if (!timeContainer || !headerContainer || !scheduleContainer) return;

    let isVerticalScrolling = false;
    let isHorizontalScrolling = false;

    // 세로 스크롤 동기화 (시간 ↔ 스케줄)
    const syncVerticalTimeToSchedule = () => {
      if (isVerticalScrolling) return;
      isVerticalScrolling = true;
      scheduleContainer.scrollTop = timeContainer.scrollTop;
      requestAnimationFrame(() => {
        isVerticalScrolling = false;
      });
    };

    // 가로 스크롤 동기화 (헤더 ↔ 스케줄)
    const syncHorizontalHeaderToSchedule = () => {
      if (isHorizontalScrolling) return;
      isHorizontalScrolling = true;
      scheduleContainer.scrollLeft = headerContainer.scrollLeft;
      requestAnimationFrame(() => {
        isHorizontalScrolling = false;
      });
    };

    // 통합 스크롤 핸들러
    const handleScheduleScroll = () => {
      if (!isVerticalScrolling) {
        isVerticalScrolling = true;
        timeContainer.scrollTop = scheduleContainer.scrollTop;
        requestAnimationFrame(() => {
          isVerticalScrolling = false;
        });
      }
      if (!isHorizontalScrolling) {
        isHorizontalScrolling = true;
        headerContainer.scrollLeft = scheduleContainer.scrollLeft;
        requestAnimationFrame(() => {
          isHorizontalScrolling = false;
        });
      }
    };

    // 이벤트 리스너 등록
    timeContainer.addEventListener("scroll", syncVerticalTimeToSchedule);
    headerContainer.addEventListener("scroll", syncHorizontalHeaderToSchedule);
    scheduleContainer.addEventListener("scroll", handleScheduleScroll);

    return () => {
      timeContainer.removeEventListener("scroll", syncVerticalTimeToSchedule);
      headerContainer.removeEventListener(
        "scroll",
        syncHorizontalHeaderToSchedule
      );
      scheduleContainer.removeEventListener("scroll", handleScheduleScroll);
    };
  }, []);

  // 커스텀 블록이 변경될 때 업데이트
  useEffect(() => {
    setClassBlocks((prev) => {
      // 깊은 비교를 통해 실제로 변경된 경우에만 업데이트
      if (JSON.stringify(prev) !== JSON.stringify(filteredBlocks)) {
        return filteredBlocks;
      }
      return prev;
    });
  }, [filteredBlocks]);

  // Canvas 다시 그리기
  useEffect(() => {
    drawTimeCanvas();
    drawHeaderCanvas();
    drawScheduleCanvas();
  }, [drawTimeCanvas, drawHeaderCanvas, drawScheduleCanvas]);

  return (
    <div className="flex-1 min-h-0 w-full h-full flex flex-col max-h-[960px]">
      <div
        ref={containerRef}
        className="relative flex flex-col flex-1 min-h-0 border-0 flat-card rounded-3xl"
      >
        {/* 그리드 레이아웃: 시간(고정) + 헤더(가로스크롤) */}
        <div className="flex shrink-0">
          {/* 왼쪽 상단 모서리 - 시간 헤더 */}
          <div className="w-[80px] h-[60px] flex-shrink-0 bg-gray-50 flat-surface border-r border-b border-gray-300/50 flex items-center justify-center rounded-tl-3xl">
            <span className="text-sm font-semibold text-gray-700">시간</span>
          </div>

          {/* 상단 고정 요일 헤더 (가로 스크롤만) */}
          <div
            ref={headerContainerRef}
            className="flex-1 h-[60px] bg-gray-50 border-b border-gray-300/50 overflow-x-auto overflow-y-hidden flat-surface rounded-tr-3xl"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            <canvas
              ref={headerCanvasRef}
              className="bg-gray-50 flat-surface rounded-tr-3xl"
            />
          </div>
        </div>

        {/* 하단 영역 */}
        <div className="flex flex-1 min-h-0">
          {/* 왼쪽 고정 시간 컬럼 (세로 스크롤만) */}
          <div
            ref={timeContainerRef}
            className="w-[80px] flex-shrink-0 bg-gray-50 flat-surface border-r border-gray-300/50 overflow-hidden rounded-bl-3xl"
          >
            <canvas
              ref={timeCanvasRef}
              className="bg-gray-50 flat-surface rounded-bl-3xl"
            />
          </div>

          {/* 오른쪽 스케줄 영역 (양방향 스크롤) */}
          <div
            ref={scheduleContainerRef}
            className="flex-1 overflow-auto bg-gray-50 flat-surface rounded-br-3xl"
          >
            <canvas
              ref={scheduleCanvasRef}
              className="cursor-pointer bg-gray-50 flat-surface rounded-br-3xl"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={(e) => {
                handleMouseUp(e);
                setTooltip(null);
              }}
            />
          </div>
        </div>
      </div>

      {/* 밀집도 툴팁 */}
      {tooltip && showDensity && (
        <div
          className="fixed z-50 max-w-xs px-4 py-3 text-sm text-white border-2 shadow-2xl pointer-events-none rounded-2xl"
          style={{
            left: tooltip.x + 10,
            top: tooltip.y - 40,
            transform:
              tooltip.x > window.innerWidth - 250
                ? "translateX(-100%)"
                : "none",
            backgroundColor: "#111827", // gray-900
            borderColor: "#4b5563", // gray-600
            zIndex: 9999,
          }}
        >
          <div className="mb-2 font-medium text-white">
            {days[tooltip.dayOfWeek]} {tooltip.time}
          </div>
          <div className="mb-3 text-xs text-gray-300">
            일정 있는 학생: {tooltip.studentCount}명
          </div>
          <div className="space-y-1">
            {(() => {
              // Use custom tooltip data if available
              if (densityTooltipData) {
                const key = `${tooltip.dayOfWeek}-${tooltip.time}`;
                const schedules = densityTooltipData[key] || [];

                return (
                  <>
                    {schedules.slice(0, 5).map((schedule, idx) => (
                      <div
                        key={`${schedule.studentId}-${idx}`}
                        className="text-xs"
                      >
                        <span className="font-medium text-white">
                          {schedule.studentName}
                        </span>
                        <span className="ml-1 text-gray-300">
                          - {schedule.scheduleName}
                        </span>
                      </div>
                    ))}
                    {schedules.length > 5 && (
                      <div className="text-xs text-gray-400">
                        +{schedules.length - 5}명 더...
                      </div>
                    )}
                  </>
                );
              }

              // No data available
              return (
                <div className="text-xs text-gray-400">
                  일정 정보를 불러올 수 없습니다.
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* 모달 */}
      <ClassModal
        block={modalBlock}
        editMode={editMode}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSave}
      />
    </div>
  );
}
