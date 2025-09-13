"use client";

import {
  defaultScheduleConfig,
} from "@/lib/utils";
import { ScheduleConfig } from "@/types/schedule";
import { Tables } from "@/types/supabase";
import { Check, Clock, Plus, X } from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  useStudentSchedules,
  useCreateStudentSchedule,
  useUpdateStudentSchedule,
  useDeleteStudentSchedule,
} from "@/queries/useStudentSchedules";
import { StudentScheduleRow, CreateStudentScheduleRequest } from "@/services/client/studentScheduleApi";

const days = ["월", "화", "수", "목", "금", "토", "일"];

interface StudentCanvasScheduleProps {
  student: Tables<"students">;
  config?: ScheduleConfig;
}

interface ScheduleModalProps {
  schedule: StudentScheduleRow | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (scheduleId: string | null, updatedData: CreateStudentScheduleRequest) => void;
  onDelete?: (scheduleId: string) => void;
  isNew?: boolean;
  initialPosition?: {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
  };
}

function ScheduleModal({
  schedule,
  isOpen,
  onClose,
  onSave,
  onDelete,
  isNew = false,
  initialPosition,
}: ScheduleModalProps) {
  const [editData, setEditData] = useState({
    title: schedule?.title || "",
    description: schedule?.description || "",
    start_time: schedule?.start_time || initialPosition?.startTime || "09:00",
    end_time: schedule?.end_time || initialPosition?.endTime || "10:00",
    type: schedule?.type || ("personal" as const),
    location: schedule?.location || "",
    color: schedule?.color || "#3b82f6",
  });

  React.useEffect(() => {
    if (schedule) {
      setEditData({
        title: schedule.title,
        description: schedule.description || "",
        start_time: schedule.start_time,
        end_time: schedule.end_time,
        type: schedule.type,
        location: schedule.location || "",
        color: schedule.color,
      });
    } else if (initialPosition) {
      setEditData(prev => ({
        ...prev,
        start_time: initialPosition.startTime,
        end_time: initialPosition.endTime,
      }));
    }
  }, [schedule, initialPosition]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!editData.title.trim()) {
      alert("일정 제목을 입력해주세요.");
      return;
    }
    
    const scheduleData = {
      ...editData,
      day_of_week: initialPosition?.dayOfWeek || schedule?.day_of_week || 0,
    };
    
    onSave(schedule?.id || null, scheduleData);
    onClose();
  };

  const handleDelete = () => {
    if (schedule?.id && onDelete) {
      if (confirm("정말로 이 일정을 삭제하시겠습니까?")) {
        onDelete(schedule.id);
        onClose();
      }
    }
  };

  const typeOptions = [
    { value: "personal", label: "개인 일정" },
    { value: "extracurricular", label: "과외 활동" },
    { value: "study", label: "자습" },
    { value: "appointment", label: "약속" },
    { value: "other", label: "기타" },
  ];

  const colorOptions = [
    "#3b82f6", "#ef4444", "#10b981", "#f59e0b", 
    "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16"
  ];

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
          <h3 className="text-lg font-semibold">
            {isNew ? "새 일정 추가" : "일정 수정"}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              일정 제목 *
            </label>
            <input
              type="text"
              value={editData.title}
              onChange={(e) =>
                setEditData({ ...editData, title: e.target.value })
              }
              className="w-full border rounded-md px-3 py-2"
              placeholder="일정 제목을 입력하세요"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              설명
            </label>
            <textarea
              value={editData.description}
              onChange={(e) =>
                setEditData({ ...editData, description: e.target.value })
              }
              className="w-full border rounded-md px-3 py-2 h-20 resize-none"
              placeholder="일정 설명을 입력하세요"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              일정 유형
            </label>
            <select
              value={editData.type}
              onChange={(e) =>
                setEditData({ ...editData, type: e.target.value as StudentSchedule["type"] })
              }
              className="w-full border rounded-md px-3 py-2"
            >
              {typeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              장소
            </label>
            <input
              type="text"
              value={editData.location}
              onChange={(e) =>
                setEditData({ ...editData, location: e.target.value })
              }
              className="w-full border rounded-md px-3 py-2"
              placeholder="장소를 입력하세요"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                시작 시간
              </label>
              <input
                type="time"
                value={editData.start_time}
                onChange={(e) =>
                  setEditData({ ...editData, start_time: e.target.value })
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
                value={editData.end_time}
                onChange={(e) =>
                  setEditData({ ...editData, end_time: e.target.value })
                }
                className="w-full border rounded-md px-3 py-2"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              색상
            </label>
            <div className="flex gap-2 flex-wrap">
              {colorOptions.map((color) => (
                <button
                  key={color}
                  onClick={() => setEditData({ ...editData, color })}
                  className={`w-8 h-8 rounded-full border-2 ${
                    editData.color === color ? "border-gray-800" : "border-gray-300"
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t">
            {!isNew && onDelete && (
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                삭제
              </button>
            )}
            <button
              onClick={handleSave}
              className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" />
              {isNew ? "추가" : "저장"}
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
            >
              취소
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function StudentCanvasSchedule({
  student,
  config = defaultScheduleConfig,
}: StudentCanvasScheduleProps) {
  const timeCanvasRef = useRef<HTMLCanvasElement>(null);
  const headerCanvasRef = useRef<HTMLCanvasElement>(null);
  const scheduleCanvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const timeContainerRef = useRef<HTMLDivElement>(null);
  const headerContainerRef = useRef<HTMLDivElement>(null);
  const scheduleContainerRef = useRef<HTMLDivElement>(null);
  
  // API hooks
  const { data: studentSchedules = [], isLoading, error } = useStudentSchedules(student.id);
  const createScheduleMutation = useCreateStudentSchedule(student.id);
  const updateScheduleMutation = useUpdateStudentSchedule(student.id);
  const deleteScheduleMutation = useDeleteStudentSchedule(student.id);
  
  const [modalSchedule, setModalSchedule] = useState<StudentScheduleRow | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNewSchedule, setIsNewSchedule] = useState(false);
  const [newSchedulePosition, setNewSchedulePosition] = useState<{
    dayOfWeek: number;
    startTime: string;
    endTime: string;
  } | null>(null);
  const [containerWidth, setContainerWidth] = useState(1000);
  
  // 동적 캔버스 설정
  const MIN_DAY_COLUMN_WIDTH = 120;
  const HEADER_HEIGHT = 60;
  const TIME_COLUMN_WIDTH = 80;
  const SLOT_HEIGHT = 10; // 10분당 10px
  
  // 표시할 요일 수 계산
  const availableWidth = containerWidth - TIME_COLUMN_WIDTH;
  const visibleDays = Math.min(
    7,
    Math.max(1, Math.floor(availableWidth / MIN_DAY_COLUMN_WIDTH))
  );
  const DAY_COLUMN_WIDTH = availableWidth / visibleDays;
  
  // 동적 크기 계산
  const TIME_CANVAS_WIDTH = TIME_COLUMN_WIDTH;
  const HEADER_CANVAS_WIDTH = DAY_COLUMN_WIDTH * 7;
  const SCHEDULE_CANVAS_WIDTH = DAY_COLUMN_WIDTH * 7;
  const TIME_CANVAS_HEIGHT = 900;
  const SCHEDULE_CANVAS_HEIGHT = 900;

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

  // 시간 캔버스 그리기
  const drawTimeCanvas = useCallback(() => {
    const canvas = timeCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = TIME_CANVAS_WIDTH * dpr;
    canvas.height = TIME_CANVAS_HEIGHT * dpr;
    canvas.style.width = `${TIME_CANVAS_WIDTH}px`;
    canvas.style.height = `${TIME_CANVAS_HEIGHT}px`;
    ctx.scale(dpr, dpr);

    ctx.fillStyle = "#f9fafb";
    ctx.fillRect(0, 0, TIME_CANVAS_WIDTH, TIME_CANVAS_HEIGHT);

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

  // 헤더 캔버스 그리기
  const drawHeaderCanvas = useCallback(() => {
    const canvas = headerCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = HEADER_CANVAS_WIDTH * dpr;
    canvas.height = HEADER_HEIGHT * dpr;
    canvas.style.width = `${HEADER_CANVAS_WIDTH}px`;
    canvas.style.height = `${HEADER_HEIGHT}px`;
    ctx.scale(dpr, dpr);

    ctx.fillStyle = "#f9fafb";
    ctx.fillRect(0, 0, HEADER_CANVAS_WIDTH, HEADER_HEIGHT);

    ctx.strokeStyle = "#e5e7eb";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, HEADER_HEIGHT - 1);
    ctx.lineTo(HEADER_CANVAS_WIDTH, HEADER_HEIGHT - 1);
    ctx.stroke();

    ctx.fillStyle = "#374151";
    ctx.font = "bold 14px sans-serif";
    ctx.textAlign = "center";

    days.forEach((day, index) => {
      const x = index * DAY_COLUMN_WIDTH + DAY_COLUMN_WIDTH / 2;
      ctx.fillText(day, x, HEADER_HEIGHT / 2 + 5);

      if (index > 0) {
        ctx.strokeStyle = "#e5e7eb";
        ctx.beginPath();
        ctx.moveTo(index * DAY_COLUMN_WIDTH, 0);
        ctx.lineTo(index * DAY_COLUMN_WIDTH, HEADER_HEIGHT);
        ctx.stroke();
      }
    });
  }, [DAY_COLUMN_WIDTH]);

  // 스케줄 캔버스 그리기
  const drawScheduleCanvas = useCallback(() => {
    const canvas = scheduleCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = SCHEDULE_CANVAS_WIDTH * dpr;
    canvas.height = SCHEDULE_CANVAS_HEIGHT * dpr;
    canvas.style.width = `${SCHEDULE_CANVAS_WIDTH}px`;
    canvas.style.height = `${SCHEDULE_CANVAS_HEIGHT}px`;
    ctx.scale(dpr, dpr);

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

    // 학생 개인 일정 그리기
    studentSchedules.forEach((schedule) => {
      const startMinutes = parseTime(schedule.start_time);
      const endMinutes = parseTime(schedule.end_time);
      const configStartMinutes = config.startHour * 60;

      const x = schedule.day_of_week * DAY_COLUMN_WIDTH + 2;
      const y =
        ((startMinutes - configStartMinutes) / config.timeSlotMinutes) *
          SLOT_HEIGHT +
        20;
      const width = DAY_COLUMN_WIDTH - 4;
      const height =
        ((endMinutes - startMinutes) / config.timeSlotMinutes) * SLOT_HEIGHT;

      // 블록 배경
      const radius = 8;
      ctx.fillStyle = schedule.color;
      drawRoundedRect(ctx, x, y, width, height, radius);
      ctx.fill();

      // 블록 테두리
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
      ctx.fillText(schedule.title, x + 8, titleY);

      // 시간 (충분한 공간이 있을 때만)
      if (height > 35) {
        ctx.font = "10px sans-serif";
        ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
        ctx.fillText(
          `${schedule.start_time} ~ ${schedule.end_time}`,
          x + 8,
          titleY + 15
        );
      }
    });
  }, [studentSchedules, config, DAY_COLUMN_WIDTH]);

  // 마우스 이벤트 핸들러
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = scheduleCanvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const clickedSchedule = getScheduleAtPosition(x, y);

    if (clickedSchedule) {
      // 기존 일정 클릭 - 편집 모달 열기
      setModalSchedule(clickedSchedule);
      setIsNewSchedule(false);
      setIsModalOpen(true);
    } else {
      // 빈 공간 클릭 - 새 일정 추가
      const position = getClickPosition(x, y);
      if (position) {
        setNewSchedulePosition(position);
        setModalSchedule(null);
        setIsNewSchedule(true);
        setIsModalOpen(true);
      }
    }
  };

  // 위치에 있는 일정 찾기
  const getScheduleAtPosition = (x: number, y: number): StudentScheduleRow | null => {
    for (const schedule of studentSchedules) {
      const startMinutes = parseTime(schedule.start_time);
      const endMinutes = parseTime(schedule.end_time);
      const configStartMinutes = config.startHour * 60;

      const scheduleX = schedule.day_of_week * DAY_COLUMN_WIDTH + 2;
      const scheduleY =
        ((startMinutes - configStartMinutes) / config.timeSlotMinutes) *
          SLOT_HEIGHT +
        20;
      const scheduleWidth = DAY_COLUMN_WIDTH - 4;
      const scheduleHeight =
        ((endMinutes - startMinutes) / config.timeSlotMinutes) * SLOT_HEIGHT;

      if (
        x >= scheduleX &&
        x <= scheduleX + scheduleWidth &&
        y >= scheduleY &&
        y <= scheduleY + scheduleHeight
      ) {
        return schedule;
      }
    }
    return null;
  };

  // 클릭 위치 계산
  const getClickPosition = (x: number, y: number) => {
    if (x < 0 || y < 20) return null;

    const dayIndex = Math.floor(x / DAY_COLUMN_WIDTH);
    if (dayIndex < 0 || dayIndex >= 7) return null;

    const slotIndex = Math.floor((y - 20) / SLOT_HEIGHT);
    const startMinutes = config.startHour * 60 + slotIndex * config.timeSlotMinutes;
    const endMinutes = startMinutes + 60; // 기본 1시간

    return {
      dayOfWeek: dayIndex,
      startTime: formatTime(startMinutes),
      endTime: formatTime(endMinutes),
    };
  };

  // 일정 저장 핸들러
  const handleSaveSchedule = (scheduleId: string | null, updatedData: CreateStudentScheduleRequest) => {
    if (scheduleId) {
      // 기존 일정 수정
      updateScheduleMutation.mutate({
        scheduleId,
        scheduleData: updatedData,
      });
    } else {
      // 새 일정 추가
      createScheduleMutation.mutate(updatedData);
    }
  };

  // 일정 삭제 핸들러
  const handleDeleteSchedule = (scheduleId: string) => {
    deleteScheduleMutation.mutate(scheduleId);
  };

  // 모달 닫기 핸들러
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setModalSchedule(null);
    setIsNewSchedule(false);
    setNewSchedulePosition(null);
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

  // 스크롤 동기화
  useEffect(() => {
    const timeContainer = timeContainerRef.current;
    const headerContainer = headerContainerRef.current;
    const scheduleContainer = scheduleContainerRef.current;

    if (!timeContainer || !headerContainer || !scheduleContainer) return;

    let isVerticalScrolling = false;
    let isHorizontalScrolling = false;

    const syncVerticalTimeToSchedule = () => {
      if (isVerticalScrolling) return;
      isVerticalScrolling = true;
      scheduleContainer.scrollTop = timeContainer.scrollTop;
      requestAnimationFrame(() => {
        isVerticalScrolling = false;
      });
    };

    const syncHorizontalHeaderToSchedule = () => {
      if (isHorizontalScrolling) return;
      isHorizontalScrolling = true;
      scheduleContainer.scrollLeft = headerContainer.scrollLeft;
      requestAnimationFrame(() => {
        isHorizontalScrolling = false;
      });
    };

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

    timeContainer.addEventListener("scroll", syncVerticalTimeToSchedule);
    headerContainer.addEventListener("scroll", syncHorizontalHeaderToSchedule);
    scheduleContainer.addEventListener("scroll", handleScheduleScroll);

    return () => {
      timeContainer.removeEventListener("scroll", syncVerticalTimeToSchedule);
      headerContainer.removeEventListener("scroll", syncHorizontalHeaderToSchedule);
      scheduleContainer.removeEventListener("scroll", handleScheduleScroll);
    };
  }, []);

  // Canvas 다시 그리기
  useEffect(() => {
    drawTimeCanvas();
    drawHeaderCanvas();
    drawScheduleCanvas();
  }, [drawTimeCanvas, drawHeaderCanvas, drawScheduleCanvas]);

  // 로딩 상태
  if (isLoading) {
    return (
      <div className="w-full max-w-7xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">시간표를 불러오는 중...</span>
        </div>
      </div>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <div className="w-full max-w-7xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-600">시간표를 불러오는데 실패했습니다.</p>
            <p className="text-gray-600 mt-1">{error.message}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          {student.name}의 개인 시간표
        </h2>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Plus className="w-4 h-4" />
            <span>빈 공간을 클릭하여 일정을 추가하세요</span>
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

        {/* 그리드 레이아웃 */}
        <div className="flex">
          <div className="w-[80px] h-[60px] flex-shrink-0 bg-gray-50 border-r border-b border-gray-200 flex items-center justify-center">
            <span className="text-sm font-semibold text-gray-700">시간</span>
          </div>

          <div
            ref={headerContainerRef}
            className="flex-1 h-[60px] border-b border-gray-200 overflow-x-auto overflow-y-hidden scroll-hide"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            <canvas ref={headerCanvasRef} className="bg-gray-50" />
          </div>
        </div>

        <div className="flex h-[540px]">
          <div
            ref={timeContainerRef}
            className="w-[80px] flex-shrink-0 bg-gray-50 border-r border-gray-200 overflow-x-hidden overflow-y-auto scroll-hide"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            <canvas ref={timeCanvasRef} className="bg-gray-50" />
          </div>

          <div
            ref={scheduleContainerRef}
            className="flex-1 overflow-auto scroll-hide"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            <canvas
              ref={scheduleCanvasRef}
              className="cursor-pointer"
              onMouseDown={handleMouseDown}
            />
          </div>
        </div>
      </div>

      {/* 일정 모달 */}
      <ScheduleModal
        schedule={modalSchedule}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveSchedule}
        onDelete={handleDeleteSchedule}
        isNew={isNewSchedule}
        initialPosition={newSchedulePosition}
      />

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <div className="flex items-center gap-2 text-sm text-blue-800">
          <Clock className="w-4 h-4" />
          <span>
            빈 공간을 클릭하여 새 일정을 추가하거나, 기존 일정을 클릭하여 수정할 수 있습니다.
          </span>
        </div>
      </div>
    </div>
  );
}