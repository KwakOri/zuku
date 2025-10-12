"use client";

import React, { useEffect, useRef, useMemo } from 'react';

interface ClassComposition {
  id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  type: string | null;
}

interface ClassData {
  id: string;
  title: string;
  color: string;
  class_composition?: ClassComposition[];
}

interface ClassTimetableCanvasProps {
  classData: ClassData;
  className?: string;
}

// 시간표 설정
const SCHEDULE_CONFIG = {
  dayNames: ['일', '월', '화', '수', '목', '금', '토'],
  startHour: 9,
  endHour: 22,
  slotMinutes: 5,       // 5분 단위
  slotsPerHour: 12,     // 1시간 = 12개 슬롯
};

// Canvas 크기 설정
const CANVAS_CONFIG = {
  dayLabelWidth: 60,    // 요일 레이블 영역 폭
  slotWidth: 15,        // 5분 슬롯 폭
  rowHeight: 80,        // 행 높이
  headerHeight: 80      // 헤더 높이
};

export default function ClassTimetableCanvas({
  classData,
  className = ''
}: ClassTimetableCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Canvas 크기 계산
  const canvasSize = useMemo(() => {
    const totalHours = SCHEDULE_CONFIG.endHour - SCHEDULE_CONFIG.startHour + 1;
    const totalSlots = totalHours * SCHEDULE_CONFIG.slotsPerHour;

    return {
      width: CANVAS_CONFIG.dayLabelWidth + totalSlots * CANVAS_CONFIG.slotWidth,
      height: CANVAS_CONFIG.headerHeight + 7 * CANVAS_CONFIG.rowHeight // 7 days
    };
  }, []);

  // Canvas 그리기 함수
  const drawSchedule = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 캔버스 크기 설정
    canvas.width = canvasSize.width;
    canvas.height = canvasSize.height;

    // 배경 지우기
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 헤더 그리기
    drawHeader(ctx, canvas);

    // 요일별 행 그리기
    SCHEDULE_CONFIG.dayNames.forEach((_, dayIndex) => {
      drawDayRow(ctx, canvas, dayIndex);
    });

    // 격자 그리기
    drawGrid(ctx, canvas);
  };

  // 헤더 그리기
  const drawHeader = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    const headerY = 0;
    const headerHeight = CANVAS_CONFIG.headerHeight;

    // 헤더 배경
    ctx.fillStyle = '#f9fafb';
    ctx.fillRect(0, headerY, canvas.width, headerHeight);

    // 요일 레이블 헤더
    ctx.fillStyle = '#374151';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('요일', CANVAS_CONFIG.dayLabelWidth / 2, headerY + 30);

    // 시간 격자 레이블
    const timeX = CANVAS_CONFIG.dayLabelWidth;

    ctx.font = 'bold 16px Arial';
    ctx.fillText('시간', timeX + (canvasSize.width - CANVAS_CONFIG.dayLabelWidth) / 2, headerY + 25);

    // 시간 눈금
    ctx.font = '12px Arial';
    for (let hour = SCHEDULE_CONFIG.startHour; hour <= SCHEDULE_CONFIG.endHour; hour++) {
      const hourX = timeX + (hour - SCHEDULE_CONFIG.startHour) * SCHEDULE_CONFIG.slotsPerHour * CANVAS_CONFIG.slotWidth;
      ctx.fillText(hour.toString(), hourX, headerY + 50);
    }
  };

  // 요일 행 그리기
  const drawDayRow = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, dayIndex: number) => {
    const y = CANVAS_CONFIG.headerHeight + dayIndex * CANVAS_CONFIG.rowHeight;

    // 행 배경 (홀수 행은 약간 다른 색상)
    ctx.fillStyle = dayIndex % 2 === 0 ? '#ffffff' : '#f9fafb';
    ctx.fillRect(0, y, canvas.width, CANVAS_CONFIG.rowHeight);

    // 요일 레이블
    ctx.fillStyle = '#374151';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(
      SCHEDULE_CONFIG.dayNames[dayIndex],
      CANVAS_CONFIG.dayLabelWidth / 2,
      y + CANVAS_CONFIG.rowHeight / 2 + 5
    );

    // 해당 요일의 시간표 블록 그리기
    if (classData.class_composition && Array.isArray(classData.class_composition)) {
      const dayCompositions = classData.class_composition.filter(
        comp => comp.day_of_week === dayIndex
      );

      dayCompositions.forEach(comp => {
        drawScheduleBlock(ctx, comp, CANVAS_CONFIG.dayLabelWidth, y);
      });
    }
  };

  // 스케줄 블록 그리기
  const drawScheduleBlock = (
    ctx: CanvasRenderingContext2D,
    composition: ClassComposition,
    dayStartX: number,
    rowY: number
  ) => {
    const [startHour, startMin] = composition.start_time.split(':').map(Number);
    const [endHour, endMin] = composition.end_time.split(':').map(Number);

    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    const dayStartMinutes = SCHEDULE_CONFIG.startHour * 60;

    const startSlot = Math.floor((startMinutes - dayStartMinutes) / SCHEDULE_CONFIG.slotMinutes);
    const endSlot = Math.ceil((endMinutes - dayStartMinutes) / SCHEDULE_CONFIG.slotMinutes);

    const blockX = dayStartX + startSlot * CANVAS_CONFIG.slotWidth;
    const blockWidth = (endSlot - startSlot) * CANVAS_CONFIG.slotWidth;
    const blockY = rowY + 5;
    const blockHeight = CANVAS_CONFIG.rowHeight - 10;

    // 블록 배경
    ctx.fillStyle = classData.color || '#3B82F6';
    ctx.fillRect(blockX, blockY, blockWidth, blockHeight);

    // 블록 테두리
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.strokeRect(blockX, blockY, blockWidth, blockHeight);

    // 텍스트
    if (blockWidth > 40) {
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 13px Arial';
      ctx.textAlign = 'center';

      const textX = blockX + blockWidth / 2;
      const textY = blockY + blockHeight / 2;

      // 수업 제목
      const maxLength = Math.floor(blockWidth / 9);
      const displayTitle = classData.title.length > maxLength
        ? classData.title.slice(0, maxLength - 2) + '..'
        : classData.title;

      ctx.fillText(displayTitle, textX, textY - 8);

      // 시간
      ctx.font = '11px Arial';
      const timeText = `${composition.start_time.substring(0, 5)}-${composition.end_time.substring(0, 5)}`;
      ctx.fillText(timeText, textX, textY + 8);

      // 타입 (정규/클리닉)
      if (composition.type && blockWidth > 60) {
        ctx.font = 'bold 10px Arial';
        const typeText = composition.type === 'class' ? '정규' : '클리닉';
        ctx.fillText(typeText, textX, textY + 22);
      }
    }
  };

  // 격자 그리기
  const drawGrid = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 0.5;

    // 세로 격자 (1시간마다)
    const startX = CANVAS_CONFIG.dayLabelWidth;
    const totalHours = SCHEDULE_CONFIG.endHour - SCHEDULE_CONFIG.startHour + 1;

    for (let hour = 0; hour <= totalHours; hour++) {
      const x = startX + hour * SCHEDULE_CONFIG.slotsPerHour * CANVAS_CONFIG.slotWidth;

      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }

    // 가로 격자 (요일 구분)
    for (let i = 0; i <= 8; i++) {
      const y = i === 0 ? CANVAS_CONFIG.headerHeight : CANVAS_CONFIG.headerHeight + i * CANVAS_CONFIG.rowHeight;

      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // 요일 레이블 구분선
    ctx.strokeStyle = '#d1d5db';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(CANVAS_CONFIG.dayLabelWidth, 0);
    ctx.lineTo(CANVAS_CONFIG.dayLabelWidth, canvas.height);
    ctx.stroke();
  };

  // Canvas 업데이트
  useEffect(() => {
    drawSchedule();
  }, [classData, canvasSize]);

  return (
    <div className={`w-full ${className}`}>
      <div className="overflow-auto">
        <canvas
          ref={canvasRef}
          className="border-0"
          style={{
            display: 'block',
            maxWidth: '100%'
          }}
        />
      </div>

      {/* 범례 */}
      <div className="mt-4 px-4 py-3 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600">
          <div className="flex items-center space-x-2">
            <div
              className="w-4 h-4 rounded"
              style={{ backgroundColor: classData.color }}
            ></div>
            <span>{classData.title}</span>
          </div>
          <div className="text-gray-500 ml-auto">
            {SCHEDULE_CONFIG.startHour}:00~{SCHEDULE_CONFIG.endHour}:00 | 5분 단위 정밀도 | Canvas 렌더링
          </div>
        </div>
      </div>
    </div>
  );
}
