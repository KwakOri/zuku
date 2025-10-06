"use client";

import { Download, Filter, RefreshCw, Search } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import type {
  DaySchedule,
  ScheduleItem,
  StudentComprehensiveSchedule,
} from "@/types/comprehensiveSchedule";

interface CanvasScheduleTableProps {
  className?: string;
  schedules?: StudentComprehensiveSchedule[]; // External schedules (optional)
  hideFilters?: boolean; // Hide search and filter UI
}

// 시간표 설정
const SCHEDULE_CONFIG = {
  dayNames: ["월", "화", "수", "목", "금", "토", "일"],
  weekdayStartHour: 16, // 오후 4시
  weekdayEndHour: 22, // 오후 10시
  weekendStartHour: 10, // 오전 10시
  weekendEndHour: 22, // 오후 10시
  slotMinutes: 5, // 5분 단위
  slotsPerHour: 12, // 1시간 = 12개 슬롯
  gridHours: 1, // 1시간마다 격자 표시
};

// Canvas 크기 설정
const CANVAS_CONFIG = {
  studentInfoWidth: 300, // 학생 정보 영역 폭
  slotWidth: 15, // 5분 슬롯 폭
  rowHeight: 60, // 행 높이
  headerHeight: 80, // 헤더 높이
};

export default function CanvasScheduleTable({
  className = "",
  schedules: externalSchedules,
  hideFilters = false,
}: CanvasScheduleTableProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGrade, setSelectedGrade] = useState<number | null>(null);

  // 모든 학생의 종합 시간표 생성 (external schedules가 없을 때만)
  const allStudentSchedules = useMemo(() => {
    return externalSchedules || [];
  }, [externalSchedules]);

  // 필터링된 학생 목록
  const filteredSchedules = useMemo(() => {
    if (hideFilters || externalSchedules) {
      return allStudentSchedules;
    }
    return allStudentSchedules.filter((schedule) => {
      const matchesSearch =
        !searchQuery ||
        schedule.student.name
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        schedule.student.id.toString().includes(searchQuery);

      const matchesGrade =
        !selectedGrade || schedule.student.grade === selectedGrade;

      return matchesSearch && matchesGrade;
    });
  }, [
    allStudentSchedules,
    searchQuery,
    selectedGrade,
    hideFilters,
    externalSchedules,
  ]);

  const grades = [
    ...new Set(allStudentSchedules.map((s) => s.student.grade)),
  ].sort();

  // Canvas 크기 계산
  const canvasSize = useMemo(() => {
    const totalDaySlots = SCHEDULE_CONFIG.dayNames.reduce(
      (acc, _, dayIndex) => {
        const isWeekend = dayIndex === 5 || dayIndex === 6;
        const startHour = isWeekend
          ? SCHEDULE_CONFIG.weekendStartHour
          : SCHEDULE_CONFIG.weekdayStartHour;
        const endHour = isWeekend
          ? SCHEDULE_CONFIG.weekendEndHour
          : SCHEDULE_CONFIG.weekdayEndHour;
        return acc + (endHour - startHour + 1) * SCHEDULE_CONFIG.slotsPerHour;
      },
      0
    );

    return {
      width:
        CANVAS_CONFIG.studentInfoWidth +
        totalDaySlots * CANVAS_CONFIG.slotWidth,
      height:
        CANVAS_CONFIG.headerHeight +
        filteredSchedules.length * CANVAS_CONFIG.rowHeight,
    };
  }, [filteredSchedules.length]);

  // Canvas 그리기 함수
  const drawSchedule = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // 캔버스 크기 설정
    canvas.width = canvasSize.width;
    canvas.height = canvasSize.height;

    // 배경 지우기
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 헤더 그리기
    drawHeader(ctx, canvas);

    // 학생 행 그리기
    filteredSchedules.forEach((schedule, rowIndex) => {
      drawStudentRow(ctx, canvas, schedule, rowIndex);
    });

    // 격자 그리기
    drawGrid(ctx, canvas);
  };

  // 헤더 그리기
  const drawHeader = (
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement
  ) => {
    const headerY = 0;
    const headerHeight = CANVAS_CONFIG.headerHeight;

    // 헤더 배경
    ctx.fillStyle = "#f9fafb";
    ctx.fillRect(0, headerY, canvas.width, headerHeight);

    // 학생 정보 헤더
    const studentHeaders = ["ID", "이름", "학교", "학년"];
    const studentWidths = [60, 80, 100, 60];
    let currentX = 0;

    studentHeaders.forEach((header, index) => {
      ctx.fillStyle = "#374151";
      ctx.font = "bold 14px Arial";
      ctx.textAlign = "center";
      ctx.fillText(header, currentX + studentWidths[index] / 2, headerY + 30);
      currentX += studentWidths[index];
    });

    // 요일 헤더
    let timeX = CANVAS_CONFIG.studentInfoWidth;

    SCHEDULE_CONFIG.dayNames.forEach((dayName, dayIndex) => {
      const isWeekend = dayIndex === 5 || dayIndex === 6;
      const startHour = isWeekend
        ? SCHEDULE_CONFIG.weekendStartHour
        : SCHEDULE_CONFIG.weekdayStartHour;
      const endHour = isWeekend
        ? SCHEDULE_CONFIG.weekendEndHour
        : SCHEDULE_CONFIG.weekdayEndHour;
      const daySlots = (endHour - startHour + 1) * SCHEDULE_CONFIG.slotsPerHour;
      const dayWidth = daySlots * CANVAS_CONFIG.slotWidth;

      // 요일명
      ctx.fillStyle = "#374151";
      ctx.font = "bold 16px Arial";
      ctx.textAlign = "center";
      ctx.fillText(dayName, timeX + dayWidth / 2, headerY + 25);

      // 시간 격자 레이블
      ctx.font = "12px Arial";
      for (let hour = startHour; hour <= endHour; hour++) {
        const hourX =
          timeX +
          (hour - startHour) *
            SCHEDULE_CONFIG.slotsPerHour *
            CANVAS_CONFIG.slotWidth;
        ctx.fillText(hour.toString(), hourX, headerY + 50);
      }

      timeX += dayWidth;
    });
  };

  // 학생 행 그리기
  const drawStudentRow = (
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    schedule: StudentComprehensiveSchedule,
    rowIndex: number
  ) => {
    const y = CANVAS_CONFIG.headerHeight + rowIndex * CANVAS_CONFIG.rowHeight;

    // 행 배경 (홀수 행은 약간 다른 색상)
    ctx.fillStyle = rowIndex % 2 === 0 ? "#ffffff" : "#f9fafb";
    ctx.fillRect(0, y, canvas.width, CANVAS_CONFIG.rowHeight);

    // 학생 정보
    const student = schedule.student;
    const studentData = [
      student.id,
      student.name,
      schedule.school,
      student.grade,
    ];
    const studentWidths = [60, 80, 100, 60];
    let currentX = 0;

    ctx.fillStyle = "#374151";
    ctx.font = "14px Arial";
    ctx.textAlign = "center";

    studentData.forEach((data, index) => {
      ctx.fillText(
        data.toString(),
        currentX + studentWidths[index] / 2,
        y + CANVAS_CONFIG.rowHeight / 2 + 5
      );
      currentX += studentWidths[index];
    });

    // 스케줄 블록 그리기
    let timeX = CANVAS_CONFIG.studentInfoWidth;

    schedule.weeklySchedule.forEach(
      (daySchedule: DaySchedule, dayIndex: number) => {
        const isWeekend = dayIndex === 5 || dayIndex === 6;
        const startHour = isWeekend
          ? SCHEDULE_CONFIG.weekendStartHour
          : SCHEDULE_CONFIG.weekdayStartHour;

        daySchedule.schedules.forEach((scheduleItem: ScheduleItem) => {
          drawScheduleBlock(ctx, scheduleItem, timeX, y, startHour);
        });

        const daySlots = isWeekend
          ? (SCHEDULE_CONFIG.weekendEndHour -
              SCHEDULE_CONFIG.weekendStartHour +
              1) *
            SCHEDULE_CONFIG.slotsPerHour
          : (SCHEDULE_CONFIG.weekdayEndHour -
              SCHEDULE_CONFIG.weekdayStartHour +
              1) *
            SCHEDULE_CONFIG.slotsPerHour;

        timeX += daySlots * CANVAS_CONFIG.slotWidth;
      }
    );
  };

  // 스케줄 블록 그리기
  const drawScheduleBlock = (
    ctx: CanvasRenderingContext2D,
    scheduleItem: ScheduleItem,
    dayStartX: number,
    rowY: number,
    dayStartHour: number
  ) => {
    const [startHour, startMin] = scheduleItem.startTime.split(":").map(Number);
    const [endHour, endMin] = scheduleItem.endTime.split(":").map(Number);

    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    const dayStartMinutes = dayStartHour * 60;

    const startSlot = Math.floor(
      (startMinutes - dayStartMinutes) / SCHEDULE_CONFIG.slotMinutes
    );
    const endSlot = Math.ceil(
      (endMinutes - dayStartMinutes) / SCHEDULE_CONFIG.slotMinutes
    );

    const blockX = dayStartX + startSlot * CANVAS_CONFIG.slotWidth;
    const blockWidth = (endSlot - startSlot) * CANVAS_CONFIG.slotWidth;
    const blockY = rowY + 5;
    const blockHeight = CANVAS_CONFIG.rowHeight - 10;

    // 블록 배경
    ctx.fillStyle = scheduleItem.color || "#3B82F6";
    ctx.fillRect(blockX, blockY, blockWidth, blockHeight);

    // 블록 테두리
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 1;
    ctx.strokeRect(blockX, blockY, blockWidth, blockHeight);

    // 텍스트
    if (blockWidth > 30) {
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 12px Arial";
      ctx.textAlign = "center";

      const textX = blockX + blockWidth / 2;
      const textY = blockY + blockHeight / 2 + 4;

      // 제목
      const maxLength = Math.floor(blockWidth / 8);
      const displayTitle =
        scheduleItem.title.length > maxLength
          ? scheduleItem.title.slice(0, maxLength - 2) + ".."
          : scheduleItem.title;

      ctx.fillText(displayTitle, textX, textY);
    }
  };

  // 격자 그리기
  const drawGrid = (
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement
  ) => {
    ctx.strokeStyle = "#e5e7eb";
    ctx.lineWidth = 0.5;

    // 세로 격자 (1시간마다)
    let currentX = CANVAS_CONFIG.studentInfoWidth;

    SCHEDULE_CONFIG.dayNames.forEach((_, dayIndex) => {
      const isWeekend = dayIndex === 5 || dayIndex === 6;
      const startHour = isWeekend
        ? SCHEDULE_CONFIG.weekendStartHour
        : SCHEDULE_CONFIG.weekdayStartHour;
      const endHour = isWeekend
        ? SCHEDULE_CONFIG.weekendEndHour
        : SCHEDULE_CONFIG.weekdayEndHour;

      for (let hour = startHour; hour <= endHour + 1; hour++) {
        const x =
          currentX +
          (hour - startHour) *
            SCHEDULE_CONFIG.slotsPerHour *
            CANVAS_CONFIG.slotWidth;

        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }

      currentX +=
        (endHour - startHour + 1) *
        SCHEDULE_CONFIG.slotsPerHour *
        CANVAS_CONFIG.slotWidth;
    });

    // 가로 격자
    for (let i = 0; i <= filteredSchedules.length + 1; i++) {
      const y =
        i === 0
          ? CANVAS_CONFIG.headerHeight
          : CANVAS_CONFIG.headerHeight + i * CANVAS_CONFIG.rowHeight;

      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // 학생 정보 구분선
    ctx.strokeStyle = "#d1d5db";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(CANVAS_CONFIG.studentInfoWidth, 0);
    ctx.lineTo(CANVAS_CONFIG.studentInfoWidth, canvas.height);
    ctx.stroke();
  };

  // Canvas 업데이트
  useEffect(() => {
    drawSchedule();
  }, [filteredSchedules, canvasSize]);

  return (
    <div className={`w-full ${className}`}>
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
        {/* 헤더 및 필터 */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Canvas 시간표
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                Canvas 기반으로 구현된 시간표 뷰어입니다 (5분 정밀도, 1시간
                격자)
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                className="flex items-center px-3 py-2 space-x-2 text-gray-600 transition-colors border border-gray-300 rounded-md hover:bg-gray-50"
                onClick={() => window.location.reload()}
                title="새로고침"
              >
                <RefreshCw className="w-4 h-4" />
                <span className="hidden sm:inline">새로고침</span>
              </button>
              <button
                className="flex items-center px-4 py-2 space-x-2 text-white transition-colors bg-blue-600 rounded-md hover:bg-blue-700"
                onClick={() => {
                  const canvas = canvasRef.current;
                  if (canvas) {
                    const link = document.createElement("a");
                    link.download = "canvas-schedule.png";
                    link.href = canvas.toDataURL();
                    link.click();
                  }
                }}
                title="다운로드"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">다운로드</span>
              </button>
            </div>
          </div>

          {!hideFilters && (
            <div className="flex flex-col gap-4 sm:flex-row">
              {/* 검색 */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="학생명 또는 ID로 검색..."
                    className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              {/* 학년 필터 */}
              <div className="sm:w-48">
                <div className="relative">
                  <Filter className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                  <select
                    className="w-full py-2 pl-10 pr-8 bg-white border border-gray-300 rounded-md appearance-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={selectedGrade || ""}
                    onChange={(e) =>
                      setSelectedGrade(
                        e.target.value ? Number(e.target.value) : null
                      )
                    }
                  >
                    <option value="">전체 학년</option>
                    {grades.map((grade) => (
                      <option key={grade} value={grade}>
                        {grade}학년
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          <div className="mt-4 text-sm text-gray-600">
            총 {filteredSchedules.length}명의 학생 | 5분 단위 정밀도 | 1시간
            격자 표시
          </div>
        </div>

        {/* Canvas */}
        <div className="max-h-screen overflow-auto">
          <canvas
            ref={canvasRef}
            className="border-0"
            style={{
              display: "block",
              maxWidth: "100%",
            }}
          />
        </div>

        {/* 범례 */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex flex-wrap items-center gap-6 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-blue-500 rounded"></div>
              <span className="text-gray-700">수학</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded bg-emerald-500"></div>
              <span className="text-gray-700">영어</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded bg-amber-500"></div>
              <span className="text-gray-700">과학</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded bg-violet-500"></div>
              <span className="text-gray-700">물리</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-gray-400 rounded"></div>
              <span className="text-gray-700">개인 일정</span>
            </div>
            <div className="ml-auto text-gray-600">
              평일: 오후 4시~10시 | 주말: 오전 10시~오후 10시 | Canvas 렌더링
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
