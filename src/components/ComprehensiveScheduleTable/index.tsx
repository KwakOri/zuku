"use client";

import React, { useMemo, useState, useCallback } from 'react';
import { Search, Filter, Download, RefreshCw } from 'lucide-react';
import './styles.css';
import { 
  StudentComprehensiveSchedule, 
  DEFAULT_SCHEDULE_CONFIG 
} from '@/types/comprehensiveSchedule';
import { 
  generateAllStudentsComprehensiveSchedules,
  findScheduleInTimeSlot 
} from '@/lib/utils/comprehensiveScheduleUtils';
import { 
  students, 
  classes, 
  classStudents, 
  studentSchedules 
} from '@/lib/mock';

interface ComprehensiveScheduleTableProps {
  className?: string;
}

export default function ComprehensiveScheduleTable({ 
  className = '' 
}: ComprehensiveScheduleTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGrade, setSelectedGrade] = useState<number | null>(null);

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

  const config = DEFAULT_SCHEDULE_CONFIG;
  const grades = [...new Set(students.map(s => s.grade))].sort();

  // Canvas 기반 헤더 생성 함수 - Edge Labeling
  const renderTimeHeader = () => {
    return (
      <thead>
        <tr className="bg-gray-50">
          {/* 학생 정보 헤더 - 고정 폭 */}
          <th className="px-2 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200 sticky left-0 bg-gray-50 z-20 sticky-header" style={{ width: '64px' }}>
            ID
          </th>
          <th className="px-3 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200 sticky left-16 bg-gray-50 z-20 sticky-header" style={{ width: '96px' }}>
            이름
          </th>
          <th className="px-3 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200 sticky left-28 bg-gray-50 z-20 sticky-header" style={{ width: '120px' }}>
            학교
          </th>
          <th className="px-2 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider border-r-2 border-gray-300 sticky left-58 bg-gray-50 z-20 text-center sticky-header" style={{ width: '64px' }}>
            학년
          </th>

          {/* Canvas 기반 요일별 시간 헤더 */}
          {config.dayNames.map((dayName, dayIndex) => {
            const isWeekend = dayIndex === 5 || dayIndex === 6;
            const startHour = isWeekend ? config.weekendStartHour : config.weekdayStartHour;
            const endHour = isWeekend ? config.weekendEndHour : config.weekdayEndHour;
            const totalHours = endHour - startHour + 1;
            
            return (
              <th key={dayName} className="border-r border-gray-200 bg-gray-50 relative" style={{ width: `${totalHours * 216}px` }}>
                <div className="px-2 py-1 text-sm font-medium text-gray-700 mb-1">
                  {dayName}
                </div>
                {/* Canvas-style time grid with edge labels */}
                <div className="relative h-8">
                  {/* Background grid */}
                  <div 
                    className="absolute inset-0 opacity-20"
                    style={{
                      backgroundImage: 'repeating-linear-gradient(to right, transparent 0, transparent 215px, #d1d5db 215px, #d1d5db 216px)',
                    }}
                  />
                  
                  {/* Hour markers and edge labels */}
                  {Array.from({ length: totalHours + 1 }, (_, i) => {
                    const hour = startHour + i;
                    const position = (i / totalHours) * 100;
                    
                    return (
                      <div 
                        key={hour}
                        className="absolute top-0 bottom-0 flex items-end"
                        style={{ left: `${position}%` }}
                      >
                        {/* Vertical line */}
                        <div className="w-px h-full bg-gray-400" />
                        {/* Edge label */}
                        {i <= totalHours && (
                          <div className="absolute -left-4 -bottom-1 text-sm font-medium text-gray-600">
                            {hour}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </th>
            );
          })}
        </tr>
      </thead>
    );
  };

  // 통합 스케줄 블록 렌더링 함수
  const renderUnifiedScheduleBlocks = useCallback((schedule: StudentComprehensiveSchedule, dayIndex: number) => {
    const daySchedule = schedule.weeklySchedule[dayIndex];
    const isWeekend = dayIndex === 5 || dayIndex === 6;
    const startHour = isWeekend ? config.weekendStartHour : config.weekdayStartHour;
    const endHour = isWeekend ? config.weekendEndHour : config.weekdayEndHour;
    const totalSlots = (endHour - startHour + 1) * 6; // 10분 정밀도

    // 스케줄 항목들을 시간 순으로 정렬하고 통합 블록 생성
    const scheduleBlocks = daySchedule.schedules.map(scheduleItem => {
      const startMinutes = parseInt(scheduleItem.startTime.split(':')[0]) * 60 + parseInt(scheduleItem.startTime.split(':')[1]);
      const endMinutes = parseInt(scheduleItem.endTime.split(':')[0]) * 60 + parseInt(scheduleItem.endTime.split(':')[1]);
      const dayStartMinutes = startHour * 60;
      const dayEndMinutes = (endHour + 1) * 60;
      
      // 블록 위치 계산 (10분 정밀도)
      const startPosition = Math.max(0, (startMinutes - dayStartMinutes) / (dayEndMinutes - dayStartMinutes) * 100);
      const endPosition = Math.min(100, (endMinutes - dayStartMinutes) / (dayEndMinutes - dayStartMinutes) * 100);
      const width = endPosition - startPosition;
      
      return {
        ...scheduleItem,
        startPosition,
        width,
        startMinutes,
        endMinutes
      };
    }).filter(block => block.width > 0); // 유효한 블록만 필터링

    return (
      <>
        {Array.from({ length: totalSlots }, (_, i) => (
          <td key={`${dayIndex}-${i}`} className="border-l border-gray-100 first:border-l-0 p-0 w-4 h-12 relative bg-white">
            {/* Empty cell for grid structure */}
          </td>
        ))}
        {/* Unified schedule blocks overlay */}
        <div className="absolute inset-0 pointer-events-none">
          {scheduleBlocks.map((block, blockIndex) => (
            <div
              key={`block-${dayIndex}-${blockIndex}`}
              className="schedule-item absolute rounded text-xs text-white font-medium flex items-center justify-center overflow-hidden shadow-sm cursor-pointer pointer-events-auto"
              style={{
                backgroundColor: block.color,
                left: `${block.startPosition}%`,
                width: `${block.width}%`,
                top: '2px',
                bottom: '2px',
                zIndex: 10
              }}
              title={`${block.title}\n${block.startTime}-${block.endTime}${block.location ? `\n위치: ${block.location}` : ''}${block.type === 'class' ? '\n유형: 수업' : '\n유형: 개인일정'}`}
            >
              <div className="text-center leading-tight px-1 truncate">
                <div className="font-semibold schedule-cell text-xs">
                  {block.title.length > 8 ? block.title.slice(0, 7) + '...' : block.title}
                </div>
                {block.type === 'class' && block.subject && block.width > 15 && (
                  <div className="text-xs opacity-90 truncate mt-0.5">
                    {block.subject}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </>
    );
  }, [config]);

  // Canvas 기반 학생 행 렌더링 - 통합 스케줄 블록
  const renderStudentRow = (schedule: StudentComprehensiveSchedule) => {
    const student = schedule.student;
    
    return (
      <tr key={student.id} className="hover:bg-gray-50 transition-colors">
        {/* 학생 정보 - 고정 폭으로 정렬 */}
        <td className="px-2 py-2 text-sm text-gray-900 border-r border-gray-200 sticky left-0 bg-white z-10 text-center sticky-header" style={{ width: '64px' }}>
          {student.id}
        </td>
        <td className="px-3 py-2 text-sm font-medium text-gray-900 border-r border-gray-200 sticky left-16 bg-white z-10 sticky-header" style={{ width: '96px' }}>
          {student.name}
        </td>
        <td className="px-3 py-2 text-sm text-gray-900 border-r border-gray-200 sticky left-28 bg-white z-10 sticky-header" style={{ width: '120px' }}>
          {schedule.school}
        </td>
        <td className="px-2 py-2 text-sm text-gray-900 border-r-2 border-gray-300 sticky left-58 bg-white z-10 text-center sticky-header" style={{ width: '64px' }}>
          {student.grade}
        </td>

        {/* Canvas 기반 요일별 시간표 - 통합 블록 */}
        {schedule.weeklySchedule.map((daySchedule, dayIndex) => {
          const isWeekend = dayIndex === 5 || dayIndex === 6;
          const startHour = isWeekend ? config.weekendStartHour : config.weekdayStartHour;
          const endHour = isWeekend ? config.weekendEndHour : config.weekdayEndHour;
          const totalHours = endHour - startHour + 1;
          
          return (
            <td 
              key={`day-${dayIndex}`}
              className="border-r border-gray-200 p-0 relative bg-white"
              style={{ 
                width: `${totalHours * 216}px`,
                height: '72px',
                position: 'relative'
              }}
            >
              {/* Background grid - hourly divisions (visible) */}
              <div 
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage: 'repeating-linear-gradient(to right, transparent 0, transparent 215px, #d1d5db 215px, #d1d5db 216px)',
                }}
              />
              
              {/* 5-minute precision grid (very subtle) */}
              <div 
                className="absolute inset-0 opacity-5"
                style={{
                  backgroundImage: 'repeating-linear-gradient(to right, transparent 0, transparent 17px, #9ca3af 17px, #9ca3af 18px)',
                  backgroundSize: '18px 100%'
                }}
              />
              
              {/* Unified schedule blocks with 5-minute precision */}
              {daySchedule.schedules.map((scheduleItem, blockIndex) => {
                // Parse time with 5-minute precision
                const [startHourStr, startMinStr] = scheduleItem.startTime.split(':');
                const [endHourStr, endMinStr] = scheduleItem.endTime.split(':');
                
                const startMinutes = parseInt(startHourStr) * 60 + parseInt(startMinStr);
                const endMinutes = parseInt(endHourStr) * 60 + parseInt(endMinStr);
                
                // Round to 5-minute boundaries for precise positioning
                const startMinutesRounded = Math.floor(startMinutes / 5) * 5;
                const endMinutesRounded = Math.ceil(endMinutes / 5) * 5;
                
                const dayStartMinutes = startHour * 60;
                const dayDurationMinutes = totalHours * 60;
                
                // Calculate block position and size with 5-minute precision
                const startPosition = Math.max(0, (startMinutesRounded - dayStartMinutes) / dayDurationMinutes * 100);
                const endPosition = Math.min(100, (endMinutesRounded - dayStartMinutes) / dayDurationMinutes * 100);
                const width = endPosition - startPosition;
                
                if (width <= 0) return null;
                
                return (
                  <div
                    key={`block-${dayIndex}-${blockIndex}`}
                    className="schedule-item absolute rounded text-white font-medium flex items-center justify-center overflow-hidden shadow-sm cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-px"
                    style={{
                      backgroundColor: scheduleItem.color,
                      left: `${startPosition}%`,
                      width: `${width}%`,
                      top: '4px',
                      bottom: '4px',
                      zIndex: 5,
                      minWidth: '120px'
                    }}
                    title={`${scheduleItem.title}\n시간: ${scheduleItem.startTime}-${scheduleItem.endTime}\n정밀도: 5분 단위 정렬${scheduleItem.location ? `\n위치: ${scheduleItem.location}` : ''}${scheduleItem.type === 'class' ? '\n유형: 수업' : '\n유형: 개인일정'}`}
                  >
                    <div className="text-center leading-tight px-3 truncate w-full">
                      <div className="font-semibold text-base">
                        {width > 20 ? 
                          scheduleItem.title :
                          width > 15 ?
                          (scheduleItem.title.length > 12 ? scheduleItem.title.slice(0, 11) + '...' : scheduleItem.title) :
                          width > 10 ?
                          (scheduleItem.title.length > 8 ? scheduleItem.title.slice(0, 7) + '...' : scheduleItem.title) :
                          (scheduleItem.title.length > 6 ? scheduleItem.title.slice(0, 5) + '...' : scheduleItem.title)
                        }
                      </div>
                      {scheduleItem.type === 'class' && scheduleItem.subject && width > 12 && (
                        <div className="text-sm opacity-90 truncate mt-1">
                          {scheduleItem.subject}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </td>
          );
        })}
      </tr>
    );
  };

  return (
    <div className={`w-full comprehensive-schedule-container ${className}`}>
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 comprehensive-schedule-table">
        {/* 헤더 및 필터 */}
        <div className="px-6 py-4 border-b border-gray-200 no-print">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">학생 종합 시간표</h2>
              <p className="mt-1 text-sm text-gray-600">
                전체 학생들의 수업 및 개인 일정을 한눈에 볼 수 있습니다.
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
                onClick={() => window.print()}
                title="인쇄하기"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">출력</span>
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
            총 {filteredSchedules.length}명의 학생
          </div>
        </div>

        {/* 테이블 */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            {renderTimeHeader()}
            <tbody className="bg-white divide-y divide-gray-100">
              {filteredSchedules.map(renderStudentRow)}
            </tbody>
          </table>
        </div>

        {/* 범례 */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 no-print">
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
              평일: 오후 4시~10시 | 주말: 오전 10시~오후 10시 | 정밀도: 5분 단위
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}