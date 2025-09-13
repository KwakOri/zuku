"use client";

import {
  calculateStudentDensity,
  defaultScheduleConfig,
  generateClassBlocks,
  getDensityColor,
  getStudentsAtTime,
} from "@/lib/utils";
import { ClassBlock, EditMode, ScheduleConfig } from "@/types/schedule";
import { Check, Clock, Plus, Users, X } from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";

const days = ["월", "화", "수", "목", "금", "토", "일"];

interface CanvasScheduleProps {
  editMode?: EditMode;
  config?: ScheduleConfig;
  showDensity?: boolean;
  studentId?: number; // 학생 개별 시간표 모드
  customBlocks?: ClassBlock[]; // 커스텀 블록 데이터
  onBlocksChange?: (blocks: ClassBlock[]) => void; // 블록 변경 콜백
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
        className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">수업 정보</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          {canEdit ? (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  수업명
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
                  과목
                </label>
                <input
                  type="text"
                  value={editData.subject}
                  onChange={(e) =>
                    setEditData({ ...editData, subject: e.target.value })
                  }
                  className="w-full border rounded-md px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  강사명
                </label>
                <input
                  type="text"
                  value={editData.teacherName}
                  onChange={(e) =>
                    setEditData({ ...editData, teacherName: e.target.value })
                  }
                  className="w-full border rounded-md px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  강의실
                </label>
                <input
                  type="text"
                  value={editData.room}
                  onChange={(e) =>
                    setEditData({ ...editData, room: e.target.value })
                  }
                  className="w-full border rounded-md px-3 py-2"
                />
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
            </>
          ) : (
            <>
              <div>
                <span className="block text-sm font-medium text-gray-700">
                  수업명
                </span>
                <p className="mt-1">{block.title}</p>
              </div>

              <div>
                <span className="block text-sm font-medium text-gray-700">
                  과목
                </span>
                <p className="mt-1">{block.subject}</p>
              </div>

              <div>
                <span className="block text-sm font-medium text-gray-700">
                  강사명
                </span>
                <p className="mt-1">{block.teacherName}</p>
              </div>

              <div>
                <span className="block text-sm font-medium text-gray-700">
                  강의실
                </span>
                <p className="mt-1">{block.room || "미정"}</p>
              </div>
            </>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="block text-sm font-medium text-gray-700">
                시간
              </span>
              <div className="flex items-center mt-1">
                <Clock className="w-4 h-4 mr-2 text-gray-400" />
                <span>
                  {block.startTime} ~ {block.endTime}
                </span>
              </div>
            </div>

            <div>
              <span className="block text-sm font-medium text-gray-700">
                학생 수
              </span>
              <div className="flex items-center mt-1">
                <Users className="w-4 h-4 mr-2 text-gray-400" />
                <span>
                  {block.studentCount}
                  {block.maxStudents && `/${block.maxStudents}`}
                </span>
              </div>
            </div>
          </div>

          {canEdit && (
            <div className="flex gap-3 pt-4 border-t">
              <button
                onClick={handleSave}
                className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                저장
              </button>
              <button
                onClick={onClose}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 flex items-center justify-center gap-2"
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
  studentId,
  customBlocks,
  onBlocksChange,
}: CanvasScheduleProps) {
  const timeCanvasRef = useRef<HTMLCanvasElement>(null);
  const headerCanvasRef = useRef<HTMLCanvasElement>(null);
  const scheduleCanvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const timeContainerRef = useRef<HTMLDivElement>(null);
  const headerContainerRef = useRef<HTMLDivElement>(null);
  const scheduleContainerRef = useRef<HTMLDivElement>(null);
  const [classBlocks, setClassBlocks] = useState<ClassBlock[]>(
    customBlocks || generateClassBlocks
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

    // 배경 클리어
    ctx.fillStyle = "#f9fafb";
    ctx.fillRect(0, 0, TIME_CANVAS_WIDTH, TIME_CANVAS_HEIGHT);

    // 시간 레이블
    ctx.fillStyle = "#6b7280";
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

    // 배경 클리어
    ctx.fillStyle = "#f9fafb";
    ctx.fillRect(0, 0, HEADER_CANVAS_WIDTH, HEADER_HEIGHT);

    // 헤더 하단 경계선
    ctx.strokeStyle = "#e5e7eb";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, HEADER_HEIGHT - 1);
    ctx.lineTo(HEADER_CANVAS_WIDTH, HEADER_HEIGHT - 1);
    ctx.stroke();

    // 요일 헤더
    ctx.fillStyle = "#374151";
    ctx.font = "bold 14px sans-serif";
    ctx.textAlign = "center";

    days.forEach((day, index) => {
      const x = index * DAY_COLUMN_WIDTH + DAY_COLUMN_WIDTH / 2;
      ctx.fillText(day, x, HEADER_HEIGHT / 2 + 5);

      // 세로 구분선
      if (index > 0) {
        ctx.strokeStyle = "#e5e7eb";
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

    // 배경 클리어
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, SCHEDULE_CANVAS_WIDTH, SCHEDULE_CANVAS_HEIGHT);

    // 세로 구분선
    ctx.strokeStyle = "#e5e7eb";
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
    ctx.strokeStyle = "#f3f4f6";
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
    if (showDensity) {
      const densityData = calculateStudentDensity(config);
      const maxDensity = Math.max(...Object.values(densityData));

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

      // 블록 배경 (둥근 모서리)
      const radius = 8;
      ctx.fillStyle = block.color;
      drawRoundedRect(ctx, x, y, width, height, radius);
      ctx.fill();

      // 블록 테두리 (둥근 모서리)
      ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
      ctx.lineWidth = 1;
      drawRoundedRect(ctx, x, y, width, height, radius);
      ctx.stroke();

      // 텍스트
      ctx.fillStyle = "white";
      ctx.font = "bold 12px sans-serif";
      ctx.textAlign = "left";

      // 제목
      const titleY = y + 16;
      ctx.fillText(block.title, x + 8, titleY);

      // 시간 (충분한 공간이 있을 때만)
      if (height > 35) {
        ctx.font = "10px sans-serif";
        ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
        ctx.fillText(
          `${block.startTime} ~ ${block.endTime}`,
          x + 8,
          titleY + 15
        );
      }

      // 수정 아이콘 (편집/관리자 모드일 때만)
      if (editMode === "edit" || editMode === "admin") {
        const iconSize = 16;
        const iconX = x + width - iconSize - 4;
        const iconY = y + 4;

        // 점 세 개 아이콘 (MoreHorizontal)
        ctx.fillStyle = "white";
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

      // 반투명 블록 (둥근 모서리)
      const radius = 8;
      ctx.globalAlpha = 0.8;
      ctx.fillStyle = block.color;
      drawRoundedRect(ctx, x, y, width, height, radius);
      ctx.fill();

      ctx.strokeStyle = "white";
      ctx.lineWidth = 2;
      drawRoundedRect(ctx, x, y, width, height, radius);
      ctx.stroke();

      // 텍스트
      ctx.fillStyle = "white";
      ctx.font = "bold 12px sans-serif";
      ctx.textAlign = "left";
      ctx.fillText(block.title, x + 8, y + 16);

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

        // 반투명 프리뷰 박스 (둥근 모서리)
        const radius = 8;
        ctx.globalAlpha = 0.3;
        ctx.fillStyle = dragState.draggedBlock.color;
        drawRoundedRect(ctx, px, py, pwidth, pheight, radius);
        ctx.fill();

        // 점선 테두리 (둥근 모서리)
        ctx.globalAlpha = 0.8;
        ctx.strokeStyle = dragState.draggedBlock.color;
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        drawRoundedRect(ctx, px, py, pwidth, pheight, radius);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.globalAlpha = 1.0;
      }
    }
  }, [classBlocks, dragState, config, editMode, showDensity, DAY_COLUMN_WIDTH]);

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
      } else if (editMode === "admin") {
        // 관리자 모드에서 블록의 다른 부분 클릭 - 드래그 시작
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
        // 조회 모드 - 모달 열기
        setModalBlock(clickedBlock);
        setIsModalOpen(true);
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

        const studentsAtTime = getStudentsAtTime(dayIndex, time);

        if (studentsAtTime.length > 0) {
          setTooltip({
            visible: true,
            x: e.clientX,
            y: e.clientY,
            dayOfWeek: dayIndex,
            time,
            studentCount: studentsAtTime.length,
          });
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

    const iconSize = 16;
    const iconX = blockX + blockWidth - iconSize - 4;
    const iconY = blockY + 4;

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
    if (customBlocks) {
      setClassBlocks(customBlocks);
    }
  }, [customBlocks]);

  // Canvas 다시 그리기
  useEffect(() => {
    drawTimeCanvas();
    drawHeaderCanvas();
    drawScheduleCanvas();
  }, [drawTimeCanvas, drawHeaderCanvas, drawScheduleCanvas]);

  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">주간 시간표</h2>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-blue-500"></div>
            <span>수학</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-emerald-500"></div>
            <span>영어</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-amber-500"></div>
            <span>과학</span>
          </div>
        </div>
      </div>

      <div
        ref={containerRef}
        className="bg-white rounded-xl shadow-lg border border-gray-200 max-h-[600px] overflow-hidden relative"
      >
        <style
          dangerouslySetInnerHTML={{
            __html: `
            .scroll-hide::-webkit-scrollbar {
              display: none;
            }
          `,
          }}
        />

        {/* 그리드 레이아웃: 시간(고정) + 헤더(가로스크롤) */}
        <div className="flex">
          {/* 왼쪽 상단 모서리 - 시간 헤더 */}
          <div className="w-[80px] h-[60px] flex-shrink-0 bg-gray-50 border-r border-b border-gray-200 flex items-center justify-center">
            <span className="text-sm font-semibold text-gray-700">시간</span>
          </div>

          {/* 상단 고정 요일 헤더 (가로 스크롤만) */}
          <div
            ref={headerContainerRef}
            className="flex-1 h-[60px] border-b border-gray-200 overflow-x-auto overflow-y-hidden scroll-hide"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            <canvas ref={headerCanvasRef} className="bg-gray-50" />
          </div>
        </div>

        {/* 하단 영역 */}
        <div className="flex h-[540px]">
          {/* 왼쪽 고정 시간 컬럼 (세로 스크롤만) */}
          <div
            ref={timeContainerRef}
            className="w-[80px] flex-shrink-0 bg-gray-50 border-r border-gray-200 overflow-x-hidden overflow-y-auto scroll-hide"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            <canvas ref={timeCanvasRef} className="bg-gray-50" />
          </div>

          {/* 오른쪽 스케줄 영역 (양방향 스크롤) */}
          <div
            ref={scheduleContainerRef}
            className="flex-1 overflow-auto scroll-hide"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            <canvas
              ref={scheduleCanvasRef}
              className="cursor-pointer"
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
          className="fixed z-50 bg-gray-800 text-white px-3 py-2 rounded-lg shadow-lg text-sm pointer-events-none max-w-xs"
          style={{
            left: tooltip.x + 10,
            top: tooltip.y - 40,
            transform:
              tooltip.x > window.innerWidth - 250
                ? "translateX(-100%)"
                : "none",
          }}
        >
          <div className="font-medium mb-1">
            {days[tooltip.dayOfWeek]} {tooltip.time}
          </div>
          <div className="text-xs text-gray-300 mb-2">
            일정 있는 학생: {tooltip.studentCount}명
          </div>
          <div className="space-y-1">
            {getStudentsAtTime(tooltip.dayOfWeek, tooltip.time)
              .slice(0, 5)
              .map(({ student, schedule }) => (
                <div key={`${student.id}-${schedule.id}`} className="text-xs">
                  <span className="text-white">{student.name}</span>
                  <span className="text-gray-400 ml-1">- {schedule.title}</span>
                </div>
              ))}
            {getStudentsAtTime(tooltip.dayOfWeek, tooltip.time).length > 5 && (
              <div className="text-xs text-gray-400">
                +{getStudentsAtTime(tooltip.dayOfWeek, tooltip.time).length - 5}
                명 더...
              </div>
            )}
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

      {editMode === "admin" && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center gap-2 text-sm text-blue-800">
            <Plus className="w-4 h-4" />
            <span>
              관리자 모드: 수업 블록을 클릭하여 정보를 보거나 우측 핸들을
              드래그하여 이동할 수 있습니다.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
