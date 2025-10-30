"use client";

import { defaultScheduleConfig, getDensityColor } from "@/lib/utils";
import { formatDisplayTime } from "@/lib/utils/time";
import { ClassBlock, EditMode, ScheduleConfig } from "@/types/schedule";
import { Check, Clock, Users, X } from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";

// 강의실 목록 (1강의실 ~ 10강의실)
const classrooms = Array.from({ length: 10 }, (_, i) => `${i + 1}강의실`);

// 요일별 라벨
const dayLabels = ["월", "화", "수", "목", "금", "토", "일"];

// 요일별 시간 설정 (0=월요일, 6=일요일)
const getDayTimeRange = (dayOfWeek: number): { startHour: number; endHour: number } => {
  // 평일(월~금): 16시~22시
  if (dayOfWeek >= 0 && dayOfWeek <= 4) {
    return { startHour: 16, endHour: 22 };
  }
  // 주말(토~일): 10시~22시
  return { startHour: 10, endHour: 22 };
};

interface CanvasScheduleProps {
  editMode?: EditMode;
  config?: ScheduleConfig;
  customBlocks?: ClassBlock[]; // 커스텀 블록 데이터
  onBlocksChange?: (blocks: ClassBlock[]) => void; // 블록 변경 콜백
  // 클릭 기반 인터랙션 콜백
  onStudentClick?: (
    student: { id: string; name: string; grade: number | null },
    block: ClassBlock,
    isShiftKey: boolean
  ) => void; // 학생 클릭
  onClassCardClick?: (block: ClassBlock) => void; // 수업 카드 클릭
  // 선택된 학생들
  selectedStudentIds?: string[];
  // 초기 스크롤 위치 설정
  initialScrollPosition?: {
    dayOfWeek: number;
    hour: number;
    minute: number;
  };
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
  customBlocks,
  onBlocksChange,
  onStudentClick,
  onClassCardClick,
  selectedStudentIds = [],
  initialScrollPosition,
}: CanvasScheduleProps) {
  const timeCanvasRef = useRef<HTMLCanvasElement>(null);
  const headerCanvasRef = useRef<HTMLCanvasElement>(null);
  const scheduleCanvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const timeContainerRef = useRef<HTMLDivElement>(null);
  const headerContainerRef = useRef<HTMLDivElement>(null);
  const scheduleContainerRef = useRef<HTMLDivElement>(null);

  const [classBlocks, setClassBlocks] = useState<ClassBlock[]>(
    () => customBlocks || []
  );
  const [modalBlock, setModalBlock] = useState<ClassBlock | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [containerWidth, setContainerWidth] = useState(1000);

  // 동적 캔버스 설정
  const MIN_DAY_COLUMN_WIDTH = 240; // 강의실당 최소 가로 길이
  const DAY_HEADER_HEIGHT = 60; // 요일 헤더 높이
  const TIME_COLUMN_WIDTH = 80;
  const SLOT_HEIGHT = 40; // 10분당 40px
  const DAY_SPACING = 20; // 요일 사이 간격

  // 표시할 강의실 수 계산 (최소 1개, 최대 10개)
  const availableWidth = containerWidth - TIME_COLUMN_WIDTH;
  const visibleRooms = Math.min(
    10,
    Math.max(1, Math.floor(availableWidth / MIN_DAY_COLUMN_WIDTH))
  );
  const visibleRoomsArray = classrooms.slice(0, visibleRooms);
  const DAY_COLUMN_WIDTH = availableWidth / visibleRooms;

  // 동적 크기 계산
  const TIME_CANVAS_WIDTH = TIME_COLUMN_WIDTH;
  const HEADER_CANVAS_WIDTH = DAY_COLUMN_WIDTH * 10; // 전체 10개 강의실 너비
  const SCHEDULE_CANVAS_WIDTH = DAY_COLUMN_WIDTH * 10; // 전체 10개 강의실 너비

  // 각 요일별 높이 계산 및 시작 Y 위치 계산 (메모이제이션)
  const { dayStartY, TIME_CANVAS_HEIGHT, SCHEDULE_CANVAS_HEIGHT, CANVAS_HEIGHT } = React.useMemo(() => {
    const dayHeights = dayLabels.map((_, dayIndex) => {
      const { startHour, endHour } = getDayTimeRange(dayIndex);
      const totalHours = endHour - startHour;
      const totalMinutes = totalHours * 60;
      const totalSlots = totalMinutes / config.timeSlotMinutes;
      return {
        dayOfWeek: dayIndex,
        startHour,
        endHour,
        height: totalSlots * SLOT_HEIGHT,
        headerHeight: DAY_HEADER_HEIGHT,
      };
    });

    // 각 요일의 시작 Y 위치 계산
    let cumulativeY = 0;
    const dayStartY = dayHeights.map((day) => {
      const startY = cumulativeY;
      cumulativeY += day.headerHeight + day.height + DAY_SPACING;
      return {
        ...day,
        startY,
        endY: cumulativeY - DAY_SPACING,
      };
    });

    // 전체 캔버스 높이
    return {
      dayStartY,
      TIME_CANVAS_HEIGHT: cumulativeY,
      SCHEDULE_CANVAS_HEIGHT: cumulativeY,
      CANVAS_HEIGHT: cumulativeY,
    };
  }, [config.timeSlotMinutes, SLOT_HEIGHT, DAY_HEADER_HEIGHT, DAY_SPACING]);

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

  // 시간 캔버스 그리기 함수 (요일별로 세로 연결)
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

    // 배경 클리어
    ctx.fillStyle = "#fafbfa";
    ctx.fillRect(0, 0, TIME_CANVAS_WIDTH, TIME_CANVAS_HEIGHT);

    // 각 요일별로 그리기
    dayStartY.forEach((dayInfo) => {
      const { dayOfWeek, startHour, endHour, startY, headerHeight } = dayInfo;

      // 요일 헤더
      ctx.fillStyle = "#8a918a";
      ctx.font = "bold 16px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(
        dayLabels[dayOfWeek],
        TIME_CANVAS_WIDTH / 2,
        startY + headerHeight / 2 + 6
      );

      // 시간 레이블
      ctx.fillStyle = "#6f756f";
      ctx.font = "12px sans-serif";
      ctx.textAlign = "right";

      for (let hour = startHour; hour <= endHour; hour++) {
        const minutesFromDayStart = (hour - startHour) * 60;
        const y = startY + headerHeight + (minutesFromDayStart / config.timeSlotMinutes) * SLOT_HEIGHT;
        ctx.fillText(`${hour}:00`, TIME_CANVAS_WIDTH - 10, y + 5);
      }
    });
  }, [dayStartY, config.timeSlotMinutes, TIME_CANVAS_WIDTH, TIME_CANVAS_HEIGHT]);

  // 헤더 캔버스 그리기 함수 (강의실 헤더만, 고정)
  const drawHeaderCanvas = useCallback(() => {
    const canvas = headerCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // 고해상도 설정
    const dpr = window.devicePixelRatio || 1;
    canvas.width = HEADER_CANVAS_WIDTH * dpr;
    canvas.height = DAY_HEADER_HEIGHT * dpr;
    canvas.style.width = `${HEADER_CANVAS_WIDTH}px`;
    canvas.style.height = `${DAY_HEADER_HEIGHT}px`;
    ctx.scale(dpr, dpr);

    // 배경 클리어
    ctx.fillStyle = "#fafbfa";
    ctx.fillRect(0, 0, HEADER_CANVAS_WIDTH, DAY_HEADER_HEIGHT);

    // 헤더 하단 경계선
    ctx.strokeStyle = "#d4d6d4";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, DAY_HEADER_HEIGHT - 1);
    ctx.lineTo(HEADER_CANVAS_WIDTH, DAY_HEADER_HEIGHT - 1);
    ctx.stroke();

    // 강의실 헤더
    ctx.fillStyle = "#4a504a";
    ctx.font = "bold 14px sans-serif";
    ctx.textAlign = "center";

    classrooms.forEach((classroom, index) => {
      const x = index * DAY_COLUMN_WIDTH + DAY_COLUMN_WIDTH / 2;
      ctx.fillText(classroom, x, DAY_HEADER_HEIGHT / 2 + 5);

      // 세로 구분선
      if (index > 0) {
        ctx.strokeStyle = "#e4e6e4";
        ctx.beginPath();
        ctx.moveTo(index * DAY_COLUMN_WIDTH, 0);
        ctx.lineTo(index * DAY_COLUMN_WIDTH, DAY_HEADER_HEIGHT);
        ctx.stroke();
      }
    });
  }, [DAY_COLUMN_WIDTH, HEADER_CANVAS_WIDTH, DAY_HEADER_HEIGHT]);

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

    // 배경 클리어
    ctx.fillStyle = "#fafbfa";
    ctx.fillRect(0, 0, SCHEDULE_CANVAS_WIDTH, SCHEDULE_CANVAS_HEIGHT);

    // 각 요일별로 배경 및 그리드 그리기
    dayStartY.forEach((dayInfo) => {
      const { startHour, endHour, startY, headerHeight } = dayInfo;

      // 요일 헤더 배경
      ctx.fillStyle = "#f0f1f0";
      ctx.fillRect(0, startY, SCHEDULE_CANVAS_WIDTH, headerHeight);

      // 세로 구분선 (강의실)
      ctx.strokeStyle = "#e4e6e4";
      ctx.lineWidth = 1;
      classrooms.forEach((_, index) => {
        if (index > 0) {
          ctx.beginPath();
          ctx.moveTo(index * DAY_COLUMN_WIDTH, startY);
          ctx.lineTo(index * DAY_COLUMN_WIDTH, startY + headerHeight + dayInfo.height);
          ctx.stroke();
        }
      });

      // 가로선 (시간)
      ctx.strokeStyle = "#d1d4d1";
      ctx.lineWidth = 1;
      for (let hour = startHour; hour <= endHour; hour++) {
        const minutesFromDayStart = (hour - startHour) * 60;
        const y = startY + headerHeight + (minutesFromDayStart / config.timeSlotMinutes) * SLOT_HEIGHT;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(SCHEDULE_CANVAS_WIDTH, y);
        ctx.stroke();
      }
    });

    // 수업 블록 그리기
    classBlocks.forEach((block) => {
      // 해당 요일의 정보 찾기
      const dayInfo = dayStartY.find(d => d.dayOfWeek === block.dayOfWeek);
      if (!dayInfo) return;

      const { startHour, startY, headerHeight } = dayInfo;
      const startMinutes = parseTime(block.startTime);
      const endMinutes = parseTime(block.endTime);

      // 강의실 번호 추출 (room이 "1강의실" 형태거나 "1" 형태)
      let roomIndex = 0;
      if (block.room) {
        const roomMatch = block.room.match(/^(\d+)/);
        if (roomMatch) {
          roomIndex = parseInt(roomMatch[1], 10) - 1; // 1강의실 = index 0
        }
      }

      const x = roomIndex * DAY_COLUMN_WIDTH + 2;
      const dayStartMinutes = startHour * 60;
      const y = startY + headerHeight + ((startMinutes - dayStartMinutes) / config.timeSlotMinutes) * SLOT_HEIGHT;
      const width = DAY_COLUMN_WIDTH - 4;
      const height = ((endMinutes - startMinutes) / config.timeSlotMinutes) * SLOT_HEIGHT;


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
      gradient.addColorStop(0, block.color + "FF"); // 100% opacity
      gradient.addColorStop(1, block.color + "F2"); // 95% opacity

      ctx.fillStyle = gradient;
      drawRoundedRect(ctx, x + 2, y + 2, width - 4, height - 4, radius - 2);
      ctx.fill();

      // Border
      ctx.strokeStyle = "rgba(168, 173, 168, 0.2)";
      ctx.lineWidth = 1;
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
      let currentY = y + 16;
      ctx.fillText(block.title, x + 10, currentY);

      // 시간 (충분한 공간이 있을 때만)
      if (height > 40) {
        currentY += 18;
        ctx.font = "11px sans-serif";
        ctx.fillStyle = "#ffffff"; // 흰색 텍스트
        ctx.fillText(
          `${formatDisplayTime(block.startTime)} ~ ${formatDisplayTime(
            block.endTime
          )}`,
          x + 10,
          currentY
        );
      }

      // 학생 이름을 블록 형태로 표시 (충분한 공간이 있을 때만)
      if (height > 70 && block.students && block.students.length > 0) {
        currentY += 22;
        ctx.font = "10px sans-serif";

        // 한 줄에 4명씩 배치
        const studentsPerRow = 4;
        const studentBlockWidth = (width - 20) / studentsPerRow; // 좌우 여백 10px씩
        const studentBlockHeight = 22;
        const studentBlockPadding = 4;
        const studentBlockGap = 4;

        block.students.forEach((student, index) => {
          const row = Math.floor(index / studentsPerRow);
          const col = index % studentsPerRow;

          const blockX = x + 10 + col * studentBlockWidth;
          const blockY = currentY + row * (studentBlockHeight + studentBlockGap);

          // 학생 블록이 카드 영역을 벗어나는지 확인
          if (blockY + studentBlockHeight > y + height - 10) return;

          // 선택 여부 확인
          const isSelected = selectedStudentIds.includes(student.id);

          // 학생 블록 배경 (반투명 흰색, 선택된 경우 불투명)
          ctx.fillStyle = isSelected ? "rgba(255, 255, 255, 1.0)" : "rgba(255, 255, 255, 0.25)";
          drawRoundedRect(
            ctx,
            blockX,
            blockY,
            studentBlockWidth - studentBlockGap,
            studentBlockHeight,
            4
          );
          ctx.fill();

          // 학생 이름 텍스트 (선택된 경우 검은색, 아니면 흰색)
          ctx.fillStyle = isSelected ? "#1f2937" : "#ffffff";
          ctx.font = "bold 10px sans-serif";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";

          // Text shadow for better readability (선택되지 않은 경우만)
          if (!isSelected) {
            ctx.shadowColor = "rgba(0, 0, 0, 0.3)";
            ctx.shadowOffsetX = 0.5;
            ctx.shadowOffsetY = 0.5;
            ctx.shadowBlur = 1;
          }

          const textX = blockX + (studentBlockWidth - studentBlockGap) / 2;
          const textY = blockY + studentBlockHeight / 2;

          // 이름이 너무 길면 줄임표 처리
          const maxTextWidth = studentBlockWidth - studentBlockGap - 8;
          let displayName = student.name;
          let textWidth = ctx.measureText(displayName).width;

          if (textWidth > maxTextWidth) {
            while (
              textWidth > maxTextWidth &&
              displayName.length > 0
            ) {
              displayName = displayName.slice(0, -1);
              textWidth = ctx.measureText(displayName + "...").width;
            }
            displayName = displayName + "...";
          }

          ctx.fillText(displayName, textX, textY);

          // Reset
          ctx.textAlign = "left";
          ctx.textBaseline = "alphabetic";
          ctx.shadowColor = "transparent";
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 0;
          ctx.shadowBlur = 0;
        });
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
  }, [
    classBlocks,
    config.timeSlotMinutes,
    editMode,
    DAY_COLUMN_WIDTH,
    dayStartY,
    SCHEDULE_CANVAS_WIDTH,
    SCHEDULE_CANVAS_HEIGHT,
    SLOT_HEIGHT,
    selectedStudentIds,
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
      } else if (editMode === "edit" || editMode === "admin") {
        // 편집/관리자 모드에서 블록 클릭 처리
        // 학생 블록 클릭 확인
        const studentAtPosition = getStudentAtPosition(x, y, clickedBlock);

        if (studentAtPosition && onStudentClick) {
          // 학생 클릭 - Shift 키 여부와 함께 콜백 호출
          onStudentClick(studentAtPosition, clickedBlock, e.shiftKey);
        } else if (onClassCardClick) {
          // 수업 카드 클릭 - 콜백 호출
          onClassCardClick(clickedBlock);
        }
      } else {
        // 조회 모드 또는 편집 불가능한 블록 - 모달 열기
        setModalBlock(clickedBlock);
        setIsModalOpen(true);
      }
    }
  };


  // 위치에 있는 블록 찾기 (스케줄 캔버스 좌표계)
  const getBlockAtPosition = (x: number, y: number): ClassBlock | null => {
    for (const block of classBlocks) {
      // 해당 요일의 정보 찾기
      const dayInfo = dayStartY.find(d => d.dayOfWeek === block.dayOfWeek);
      if (!dayInfo) continue;

      const { startHour, startY, headerHeight } = dayInfo;
      const startMinutes = parseTime(block.startTime);
      const endMinutes = parseTime(block.endTime);

      // 강의실 번호 추출
      let roomIndex = 0;
      if (block.room) {
        const roomMatch = block.room.match(/^(\d+)/);
        if (roomMatch) {
          roomIndex = parseInt(roomMatch[1], 10) - 1;
        }
      }

      const blockX = roomIndex * DAY_COLUMN_WIDTH + 2;
      const dayStartMinutes = startHour * 60;
      const blockY = startY + headerHeight + ((startMinutes - dayStartMinutes) / config.timeSlotMinutes) * SLOT_HEIGHT;
      const blockWidth = DAY_COLUMN_WIDTH - 4;
      const blockHeight = ((endMinutes - startMinutes) / config.timeSlotMinutes) * SLOT_HEIGHT;

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
    // 해당 요일의 정보 찾기
    const dayInfo = dayStartY.find(d => d.dayOfWeek === block.dayOfWeek);
    if (!dayInfo) return false;

    const { startHour, startY, headerHeight } = dayInfo;
    const startMinutes = parseTime(block.startTime);

    // 강의실 번호 추출
    let roomIndex = 0;
    if (block.room) {
      const roomMatch = block.room.match(/^(\d+)/);
      if (roomMatch) {
        roomIndex = parseInt(roomMatch[1], 10) - 1;
      }
    }

    const blockX = roomIndex * DAY_COLUMN_WIDTH + 2;
    const dayStartMinutes = startHour * 60;
    const blockY = startY + headerHeight + ((startMinutes - dayStartMinutes) / config.timeSlotMinutes) * SLOT_HEIGHT;
    const blockWidth = DAY_COLUMN_WIDTH - 4;

    const iconSize = 20;
    const iconX = blockX + blockWidth - iconSize - 8;
    const iconY = blockY + 8;

    return (
      x >= iconX && x <= iconX + iconSize && y >= iconY && y <= iconY + iconSize
    );
  };

  // 학생 블록 영역인지 확인 및 학생 정보 반환
  const getStudentAtPosition = (
    x: number,
    y: number,
    block: ClassBlock
  ): { id: string; name: string; grade: number | null } | null => {
    if (!block.students || block.students.length === 0) return null;

    // 해당 요일의 정보 찾기
    const dayInfo = dayStartY.find(d => d.dayOfWeek === block.dayOfWeek);
    if (!dayInfo) return null;

    const { startHour, startY, headerHeight } = dayInfo;
    const startMinutes = parseTime(block.startTime);
    const endMinutes = parseTime(block.endTime);

    // 강의실 번호 추출
    let roomIndex = 0;
    if (block.room) {
      const roomMatch = block.room.match(/^(\d+)/);
      if (roomMatch) {
        roomIndex = parseInt(roomMatch[1], 10) - 1;
      }
    }

    const blockX = roomIndex * DAY_COLUMN_WIDTH + 2;
    const dayStartMinutes = startHour * 60;
    const blockY = startY + headerHeight + ((startMinutes - dayStartMinutes) / config.timeSlotMinutes) * SLOT_HEIGHT;
    const blockWidth = DAY_COLUMN_WIDTH - 4;
    const blockHeight = ((endMinutes - startMinutes) / config.timeSlotMinutes) * SLOT_HEIGHT;

    // 학생 블록은 수업 정보 아래에 표시됨
    const studentsStartY = blockY + 44;

    // 블록 높이가 충분한지 확인
    if (blockHeight < 70 || y < studentsStartY) return null;

    const studentsPerRow = 4;
    const studentBlockWidth = (blockWidth - 20) / studentsPerRow;
    const studentBlockHeight = 22;
    const studentBlockGap = 4;

    // 학생 블록의 상대 위치 계산
    const relativeX = x - (blockX + 10); // 좌측 padding 10
    const relativeY = y - studentsStartY;

    if (relativeX < 0 || relativeY < 0) return null;

    const col = Math.floor(relativeX / studentBlockWidth);
    const row = Math.floor(relativeY / (studentBlockHeight + studentBlockGap));

    if (col < 0 || col >= studentsPerRow) return null;

    const studentIndex = row * studentsPerRow + col;

    if (studentIndex >= 0 && studentIndex < block.students.length) {
      // 실제 학생 블록 영역 내부인지 정확히 확인
      const studentBlockX = col * studentBlockWidth;
      const studentBlockY = row * (studentBlockHeight + studentBlockGap);

      const inBlockX =
        relativeX >= studentBlockX &&
        relativeX <= studentBlockX + studentBlockWidth - studentBlockGap;
      const inBlockY =
        relativeY >= studentBlockY &&
        relativeY <= studentBlockY + studentBlockHeight;

      if (inBlockX && inBlockY) {
        return block.students[studentIndex];
      }
    }

    return null;
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

  // 컨테이너 크기 감지 (debounced)
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const updateSize = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };

    const debouncedUpdateSize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(updateSize, 100);
    };

    updateSize();
    window.addEventListener("resize", debouncedUpdateSize);
    return () => {
      window.removeEventListener("resize", debouncedUpdateSize);
      clearTimeout(timeoutId);
    };
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
    if (customBlocks) {
      setClassBlocks(customBlocks);
    }
  }, [customBlocks]);

  // 초기 스크롤 위치 설정 (최초 마운트 시에만)
  useEffect(() => {
    if (initialScrollPosition && scheduleContainerRef.current && dayStartY.length > 0) {
      const { dayOfWeek, hour, minute } = initialScrollPosition;
      const container = scheduleContainerRef.current;

      // 오늘 요일 정보 찾기
      const todayInfo = dayStartY.find(d => d.dayOfWeek === dayOfWeek);
      if (!todayInfo) return;

      const { startHour, startY, headerHeight } = todayInfo;

      // 세로 스크롤: 오늘 요일의 현재 시간으로 이동
      const totalMinutes = hour * 60 + minute;
      const dayStartMinutes = startHour * 60;
      const scrollY = startY + headerHeight + ((totalMinutes - dayStartMinutes) / config.timeSlotMinutes) * SLOT_HEIGHT;

      // 가로 스크롤은 0 유지 (맨 왼쪽)
      container.scrollLeft = 0;
      container.scrollTop = scrollY;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 빈 배열로 최초 마운트 시에만 실행

  // Canvas 다시 그리기 - 각 draw 함수가 자체 의존성으로 관리됨
  useEffect(() => {
    drawTimeCanvas();
  }, [drawTimeCanvas]);

  useEffect(() => {
    drawHeaderCanvas();
  }, [drawHeaderCanvas]);

  useEffect(() => {
    drawScheduleCanvas();
  }, [drawScheduleCanvas]);

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
            />
          </div>
        </div>
      </div>

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
