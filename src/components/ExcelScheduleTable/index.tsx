"use client";

import React, { useEffect, useRef, useMemo, useState, useCallback } from 'react';
import { Search, Filter, Download, RefreshCw } from 'lucide-react';
import { 
  students, 
  classes, 
  classStudents, 
  studentSchedules 
} from '@/lib/mock';
import { 
  generateAllStudentsComprehensiveSchedules 
} from '@/lib/utils/comprehensiveScheduleUtils';

interface ExcelScheduleTableProps {
  className?: string;
}

// 시간표 설정 - 5분 단위 정밀도, 1시간 격자
const SCHEDULE_CONFIG = {
  dayNames: ['월', '화', '수', '목', '금', '토', '일'],
  weekdayStartHour: 16, // 오후 4시
  weekdayEndHour: 22,   // 오후 10시
  weekendStartHour: 10, // 오전 10시  
  weekendEndHour: 22,   // 오후 10시
  slotMinutes: 5,       // 5분 단위
  slotsPerHour: 12,     // 1시간 = 12개 슬롯 (5분 x 12 = 60분)
  gridHours: 1          // 1시간마다 격자 표시
};

// Canvas 크기 설정
const CANVAS_CONFIG = {
  studentInfoWidth: 320,  // 학생 정보 영역 폭 (ID:60 + 이름:80 + 학교:100 + 학년:80)
  slotWidth: 12,          // 5분 슬롯 폭 (1시간 = 144px)
  rowHeight: 50,          // 행 높이
  headerHeight: 100,      // 헤더 높이 (요일 + 시간)
  gridLineWidth: 1,       // 격자선 두께
  hourGridLineWidth: 2    // 시간 격자선 두께
};

export default function ExcelScheduleTable({ className = '' }: ExcelScheduleTableProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGrade, setSelectedGrade] = useState<number | null>(null);
  const [scrollX, setScrollX] = useState(0);

  // 모든 학생의 종합 시간표 생성
  const allStudentSchedules = useMemo(() => {
    return generateAllStudentsComprehensiveSchedules(
      students,
      classes,
      classStudents,
      studentSchedules
    );
  }, []);

  // 필터링된 학생 목록
  const filteredSchedules = useMemo(() => {
    return allStudentSchedules.filter(schedule => {
      const matchesSearch = !searchQuery || 
        schedule.student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        schedule.student.id.toString().includes(searchQuery);
      
      const matchesGrade = !selectedGrade || schedule.student.grade === selectedGrade;
      
      return matchesSearch && matchesGrade;
    });
  }, [allStudentSchedules, searchQuery, selectedGrade]);

  const grades = [...new Set(students.map(s => s.grade))].sort();

  // Canvas 크기 계산
  const canvasSize = useMemo(() => {
    // 각 요일별 슬롯 수 계산
    const totalSlots = SCHEDULE_CONFIG.dayNames.reduce((acc, _, dayIndex) => {
      const isWeekend = dayIndex === 5 || dayIndex === 6;
      const startHour = isWeekend ? SCHEDULE_CONFIG.weekendStartHour : SCHEDULE_CONFIG.weekdayStartHour;
      const endHour = isWeekend ? SCHEDULE_CONFIG.weekendEndHour : SCHEDULE_CONFIG.weekdayEndHour;
      return acc + (endHour - startHour + 1) * SCHEDULE_CONFIG.slotsPerHour;
    }, 0);

    return {
      width: CANVAS_CONFIG.studentInfoWidth + totalSlots * CANVAS_CONFIG.slotWidth,
      height: CANVAS_CONFIG.headerHeight + filteredSchedules.length * CANVAS_CONFIG.rowHeight
    };
  }, [filteredSchedules.length]);

  // 스크롤 처리
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollX(e.currentTarget.scrollLeft);
  }, []);

  // Canvas 그리기 함수
  const drawSchedule = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 캔버스 크기 설정
    canvas.width = canvasSize.width;
    canvas.height = canvasSize.height;

    // 고해상도 디스플레이 지원
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';

    // 배경 지우기
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvasSize.width, canvasSize.height);

    // 헤더 그리기
    drawHeader(ctx);

    // 학생 행 그리기
    filteredSchedules.forEach((schedule, rowIndex) => {
      drawStudentRow(ctx, schedule, rowIndex);
    });

    // 격자 그리기
    drawGrid(ctx);

    // 고정 학생 정보 영역 배경
    drawFixedStudentInfo(ctx);
  }, [canvasSize, filteredSchedules]);

  // 헤더 그리기
  const drawHeader = (ctx: CanvasRenderingContext2D) => {
    const headerHeight = CANVAS_CONFIG.headerHeight;
    
    // 헤더 배경
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, canvasSize.width, headerHeight);

    // 학생 정보 헤더
    drawStudentInfoHeader(ctx);

    // 시간표 헤더
    drawTimeHeader(ctx);
  };

  // 학생 정보 헤더 그리기
  const drawStudentInfoHeader = (ctx: CanvasRenderingContext2D) => {
    const headers = [
      { text: 'ID', width: 60 },
      { text: '이름', width: 80 },
      { text: '학교', width: 100 },
      { text: '학년', width: 80 }
    ];

    ctx.fillStyle = '#1f2937';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';

    let currentX = 0;
    headers.forEach(header => {
      // 배경
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(currentX, 0, header.width, CANVAS_CONFIG.headerHeight);
      
      // 테두리
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 1;
      ctx.strokeRect(currentX, 0, header.width, CANVAS_CONFIG.headerHeight);

      // 텍스트
      ctx.fillStyle = '#1f2937';
      ctx.fillText(header.text, currentX + header.width / 2, CANVAS_CONFIG.headerHeight / 2 + 5);
      
      currentX += header.width;
    });
  };

  // 시간표 헤더 그리기
  const drawTimeHeader = (ctx: CanvasRenderingContext2D) => {
    let currentX = CANVAS_CONFIG.studentInfoWidth;

    SCHEDULE_CONFIG.dayNames.forEach((dayName, dayIndex) => {
      const isWeekend = dayIndex === 5 || dayIndex === 6;
      const startHour = isWeekend ? SCHEDULE_CONFIG.weekendStartHour : SCHEDULE_CONFIG.weekdayStartHour;
      const endHour = isWeekend ? SCHEDULE_CONFIG.weekendEndHour : SCHEDULE_CONFIG.weekdayEndHour;
      const totalHours = endHour - startHour + 1;
      const dayWidth = totalHours * SCHEDULE_CONFIG.slotsPerHour * CANVAS_CONFIG.slotWidth;

      // 요일 배경
      ctx.fillStyle = dayIndex >= 5 ? '#fef3c7' : '#e0f2fe'; // 주말은 노란색, 평일은 파란색
      ctx.fillRect(currentX, 0, dayWidth, CANVAS_CONFIG.headerHeight);

      // 요일 테두리
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = CANVAS_CONFIG.gridLineWidth;
      ctx.strokeRect(currentX, 0, dayWidth, CANVAS_CONFIG.headerHeight);

      // 요일명
      ctx.fillStyle = '#1f2937';
      ctx.font = 'bold 16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(dayName, currentX + dayWidth / 2, 30);

      // 시간 격자 그리기 (1시간마다)
      ctx.font = '12px Arial';
      for (let hour = startHour; hour <= endHour; hour++) {
        const hourX = currentX + (hour - startHour) * SCHEDULE_CONFIG.slotsPerHour * CANVAS_CONFIG.slotWidth;
        
        // 시간 레이블
        const timeLabel = hour > 12 ? `${hour - 12}` : hour === 0 ? '12' : `${hour}`;
        ctx.fillText(timeLabel, hourX + (SCHEDULE_CONFIG.slotsPerHour * CANVAS_CONFIG.slotWidth) / 2, 70);
        
        // 오전/오후 표시
        const ampm = hour >= 12 ? 'PM' : 'AM';
        ctx.font = '10px Arial';
        ctx.fillText(ampm, hourX + (SCHEDULE_CONFIG.slotsPerHour * CANVAS_CONFIG.slotWidth) / 2, 85);
        ctx.font = '12px Arial';
      }

      currentX += dayWidth;
    });
  };

  // 학생 행 그리기
  const drawStudentRow = (ctx: CanvasRenderingContext2D, schedule: any, rowIndex: number) => {
    const y = CANVAS_CONFIG.headerHeight + rowIndex * CANVAS_CONFIG.rowHeight;
    
    // 행 배경 (교대로 색상)
    ctx.fillStyle = rowIndex % 2 === 0 ? '#ffffff' : '#f8fafc';
    ctx.fillRect(0, y, canvasSize.width, CANVAS_CONFIG.rowHeight);

    // 학생 정보 그리기
    drawStudentInfo(ctx, schedule, y);

    // 스케줄 블록 그리기
    drawScheduleBlocks(ctx, schedule, y);
  };

  // 학생 정보 그리기
  const drawStudentInfo = (ctx: CanvasRenderingContext2D, schedule: any, y: number) => {
    const student = schedule.student;
    const studentData = [
      { text: student.id.toString(), width: 60 },
      { text: student.name, width: 80 },
      { text: schedule.school, width: 100 },
      { text: student.grade.toString(), width: 80 }
    ];

    ctx.fillStyle = '#374151';
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';

    let currentX = 0;
    studentData.forEach(data => {
      // 배경 (고정 영역 강조)
      ctx.fillStyle = '#f1f5f9';
      ctx.fillRect(currentX, y, data.width, CANVAS_CONFIG.rowHeight);
      
      // 테두리
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 1;
      ctx.strokeRect(currentX, y, data.width, CANVAS_CONFIG.rowHeight);

      // 텍스트
      ctx.fillStyle = '#374151';
      ctx.fillText(data.text, currentX + data.width / 2, y + CANVAS_CONFIG.rowHeight / 2 + 5);
      
      currentX += data.width;
    });
  };

  // 스케줄 블록 그리기
  const drawScheduleBlocks = (ctx: CanvasRenderingContext2D, schedule: any, rowY: number) => {
    let dayStartX = CANVAS_CONFIG.studentInfoWidth;

    schedule.weeklySchedule.forEach((daySchedule: any, dayIndex: number) => {
      const isWeekend = dayIndex === 5 || dayIndex === 6;
      const startHour = isWeekend ? SCHEDULE_CONFIG.weekendStartHour : SCHEDULE_CONFIG.weekdayStartHour;
      
      daySchedule.schedules.forEach((scheduleItem: any) => {
        drawScheduleBlock(ctx, scheduleItem, dayStartX, rowY, startHour);
      });

      // 다음 요일로 이동
      const endHour = isWeekend ? SCHEDULE_CONFIG.weekendEndHour : SCHEDULE_CONFIG.weekdayEndHour;
      const dayWidth = (endHour - startHour + 1) * SCHEDULE_CONFIG.slotsPerHour * CANVAS_CONFIG.slotWidth;
      dayStartX += dayWidth;
    });
  };

  // 개별 스케줄 블록 그리기
  const drawScheduleBlock = (
    ctx: CanvasRenderingContext2D, 
    scheduleItem: any, 
    dayStartX: number, 
    rowY: number, 
    dayStartHour: number
  ) => {
    const [startHour, startMin] = scheduleItem.startTime.split(':').map(Number);
    const [endHour, endMin] = scheduleItem.endTime.split(':').map(Number);
    
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    const dayStartMinutes = dayStartHour * 60;
    
    // 5분 단위로 정밀한 위치 계산
    const startSlot = Math.floor((startMinutes - dayStartMinutes) / SCHEDULE_CONFIG.slotMinutes);
    const endSlot = Math.ceil((endMinutes - dayStartMinutes) / SCHEDULE_CONFIG.slotMinutes);
    
    const blockX = dayStartX + startSlot * CANVAS_CONFIG.slotWidth;
    const blockWidth = (endSlot - startSlot) * CANVAS_CONFIG.slotWidth;
    const blockY = rowY + 3;
    const blockHeight = CANVAS_CONFIG.rowHeight - 6;

    // 블록이 유효한 범위에 있는지 확인
    if (blockWidth <= 0 || startSlot < 0) return;

    // 블록 배경
    ctx.fillStyle = scheduleItem.color || '#3B82F6';
    ctx.fillRect(blockX, blockY, blockWidth, blockHeight);

    // 블록 테두리
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.strokeRect(blockX, blockY, blockWidth, blockHeight);

    // 텍스트 그리기 (충분히 넓은 경우만)
    if (blockWidth > 40) {
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'center';
      
      const textX = blockX + blockWidth / 2;
      const textY = blockY + blockHeight / 2;
      
      // 제목
      const maxLength = Math.floor(blockWidth / 8);
      const displayTitle = scheduleItem.title.length > maxLength 
        ? scheduleItem.title.slice(0, maxLength - 2) + '..'
        : scheduleItem.title;
      
      ctx.fillText(displayTitle, textX, textY);
      
      // 과목명 (블록이 충분히 큰 경우)
      if (scheduleItem.type === 'class' && scheduleItem.subject && blockWidth > 80) {
        ctx.font = '10px Arial';
        ctx.fillText(scheduleItem.subject, textX, textY + 15);
      }
    }
  };

  // 격자 그리기
  const drawGrid = (ctx: CanvasRenderingContext2D) => {
    // 1시간마다 굵은 격자선
    drawHourlyGrid(ctx);
    
    // 가로 격자선
    drawHorizontalGrid(ctx);
  };

  // 1시간 단위 격자 그리기
  const drawHourlyGrid = (ctx: CanvasRenderingContext2D) => {
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = CANVAS_CONFIG.hourGridLineWidth;

    let currentX = CANVAS_CONFIG.studentInfoWidth;

    SCHEDULE_CONFIG.dayNames.forEach((_, dayIndex) => {
      const isWeekend = dayIndex === 5 || dayIndex === 6;
      const startHour = isWeekend ? SCHEDULE_CONFIG.weekendStartHour : SCHEDULE_CONFIG.weekdayStartHour;
      const endHour = isWeekend ? SCHEDULE_CONFIG.weekendEndHour : SCHEDULE_CONFIG.weekdayEndHour;
      
      // 각 시간마다 격자선
      for (let hour = startHour; hour <= endHour + 1; hour++) {
        const x = currentX + (hour - startHour) * SCHEDULE_CONFIG.slotsPerHour * CANVAS_CONFIG.slotWidth;
        
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvasSize.height);
        ctx.stroke();
      }
      
      currentX += (endHour - startHour + 1) * SCHEDULE_CONFIG.slotsPerHour * CANVAS_CONFIG.slotWidth;
    });
  };

  // 가로 격자선 그리기
  const drawHorizontalGrid = (ctx: CanvasRenderingContext2D) => {
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = CANVAS_CONFIG.gridLineWidth;

    // 헤더 하단선
    ctx.beginPath();
    ctx.moveTo(0, CANVAS_CONFIG.headerHeight);
    ctx.lineTo(canvasSize.width, CANVAS_CONFIG.headerHeight);
    ctx.stroke();

    // 각 학생 행 사이의 선
    for (let i = 0; i <= filteredSchedules.length; i++) {
      const y = CANVAS_CONFIG.headerHeight + i * CANVAS_CONFIG.rowHeight;
      
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvasSize.width, y);
      ctx.stroke();
    }
  };

  // 고정 학생 정보 영역 (스크롤 시 고정)
  const drawFixedStudentInfo = (ctx: CanvasRenderingContext2D) => {
    // 스크롤된 경우 학생 정보 영역을 다시 그려서 고정 효과
    if (scrollX > 0) {
      // 학생 정보 헤더 다시 그리기
      drawStudentInfoHeader(ctx);
      
      // 각 학생 정보 다시 그리기
      filteredSchedules.forEach((schedule, rowIndex) => {
        const y = CANVAS_CONFIG.headerHeight + rowIndex * CANVAS_CONFIG.rowHeight;
        drawStudentInfo(ctx, schedule, y);
      });
    }
  };

  // Canvas 업데이트
  useEffect(() => {
    drawSchedule();
  }, [drawSchedule]);

  return (
    <div className={`w-full ${className}`}>
      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        {/* 헤더 및 필터 */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Excel 스타일 종합 시간표</h2>
              <p className="mt-1 text-sm text-gray-600">
                학생별 종합 시간표를 스프레드시트 형태로 확인하세요 (5분 정밀도, 1시간 격자)
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                className="flex items-center space-x-2 px-3 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                onClick={() => window.location.reload()}
                title="새로고침"
              >
                <RefreshCw className="w-4 h-4" />
                <span className="hidden sm:inline">새로고침</span>
              </button>
              <button
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                onClick={() => {
                  const canvas = canvasRef.current;
                  if (canvas) {
                    const link = document.createElement('a');
                    link.download = 'excel-schedule.png';
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

          <div className="flex flex-col sm:flex-row gap-4">
            {/* 검색 */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="학생명 또는 ID로 검색..."
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  className="pl-10 pr-8 py-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                  value={selectedGrade || ''}
                  onChange={(e) => setSelectedGrade(e.target.value ? Number(e.target.value) : null)}
                >
                  <option value="">전체 학년</option>
                  {grades.map(grade => (
                    <option key={grade} value={grade}>{grade}학년</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="mt-4 text-sm text-gray-600">
            총 {filteredSchedules.length}명의 학생 | 5분 단위 정밀도 | 1시간 격자 표시 | 가로 스크롤 지원
          </div>
        </div>

        {/* Canvas 스크롤 영역 */}
        <div 
          ref={containerRef}
          className="overflow-auto"
          style={{ maxHeight: '70vh', maxWidth: '100%' }}
          onScroll={handleScroll}
        >
          <canvas
            ref={canvasRef}
            className="block"
            style={{ 
              width: `${canvasSize.width}px`,
              height: `${canvasSize.height}px`,
              minWidth: `${canvasSize.width}px`
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
              <div className="w-4 h-4 bg-emerald-500 rounded"></div>
              <span className="text-gray-700">영어</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-amber-500 rounded"></div>
              <span className="text-gray-700">과학</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-violet-500 rounded"></div>
              <span className="text-gray-700">물리</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-gray-400 rounded"></div>
              <span className="text-gray-700">개인 일정</span>
            </div>
            <div className="text-gray-600 ml-auto">
              평일: 오후 4시~10시 | 주말: 오전 10시~오후 10시 | Excel 스타일 Canvas 렌더링
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}