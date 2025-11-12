"use client";

import Tooltip from "@/components/common/Tooltip";
import { Calendar, Clock } from "lucide-react";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";

// Helper function to convert time string "HH:mm" to minutes from midnight
const timeToMinutes = (time: string): number => {
  if (!time) return 0;
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

// Helper function to format time as HH:MM (remove seconds if present)
const formatTime = (time: string): string => {
  if (!time) return "00:00";
  const [hours, minutes] = time.split(":");
  return `${hours}:${minutes}`;
};

// Helper function to format hour number to time string (e.g., 8.5 -> "8:30", 9 -> "9:00")
const formatHourToTime = (hour: number): string => {
  const h = Math.floor(hour);
  const m = (hour % 1) * 60;
  return `${h}:${m.toString().padStart(2, '0')}`;
};

// Represents a single event on the timeline
interface TimelineEvent {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  dayOfWeek: number; // 0 for Mon, 1 for Tue, ..., 6 for Sun
  color: string;
  type: "class" | "schedule";
  compositionType?: "class" | "clinic";
}

interface StudentHtmlScheduleProps {
  scheduleData: {
    id: string;
    title: string;
    start_time: string;
    end_time: string;
    day_of_week: number;
    color: string;
    type: string;
    composition_type?: string;
    subject_name?: string | null;
  }[];
  studentName: string;
}

const StudentHtmlSchedule = memo(function StudentHtmlSchedule({
  scheduleData,
  studentName,
}: StudentHtmlScheduleProps) {
  // Refs for scroll synchronization and container
  const containerRef = useRef<HTMLDivElement>(null);
  const headerContainerRef = useRef<HTMLDivElement>(null);
  const scheduleContainerRef = useRef<HTMLDivElement>(null);

  // 컨테이너 너비 상태
  const [containerWidth, setContainerWidth] = useState(0);

  // 요일 레이블 메모이제이션
  const dayLabels = useMemo(() => ["월", "화", "수", "목", "금", "토", "일"], []);

  // 시간 설정
  const START_HOUR = 8.5; // 8시 30분
  const END_HOUR = 22.5; // 22시 30분
  const TIME_COLUMN_WIDTH = 60;
  const MIN_DAY_COLUMN_WIDTH = 150; // 최소 칼럼 너비
  const MINUTES_PER_SLOT = 10; // 10분 단위 슬롯
  const PIXELS_PER_HOUR = 60; // 1시간당 60px
  const SLOT_HEIGHT = PIXELS_PER_HOUR / 6; // 10분당 10px (1시간 = 60분 = 6슬롯)
  const HEADER_HEIGHT = 40;
  const TOTAL_DAYS = 7;

  // 칼럼 너비 및 표시 개수 계산
  const { dayColumnWidth, visibleDayCount, totalWidth } = useMemo(() => {
    if (containerWidth === 0) {
      return {
        dayColumnWidth: MIN_DAY_COLUMN_WIDTH,
        visibleDayCount: TOTAL_DAYS,
        totalWidth: MIN_DAY_COLUMN_WIDTH * TOTAL_DAYS
      };
    }

    const availableWidth = containerWidth - TIME_COLUMN_WIDTH;

    // 화면에 들어갈 수 있는 최대 요일 개수
    const maxVisibleDays = Math.floor(availableWidth / MIN_DAY_COLUMN_WIDTH);
    const actualVisibleDays = Math.min(maxVisibleDays, TOTAL_DAYS);

    // 표시되는 요일 개수에 맞춰서 남은 공간을 채움
    const actualDayWidth = availableWidth / actualVisibleDays;

    // 전체 너비 = 각 열 너비 * 전체 요일 수 (스크롤 영역 포함)
    const actualTotalWidth = actualDayWidth * TOTAL_DAYS;

    return {
      dayColumnWidth: actualDayWidth,
      visibleDayCount: actualVisibleDays,
      totalWidth: actualTotalWidth
    };
  }, [containerWidth]);

  // 컨테이너 크기 업데이트 함수
  const updateSize = useCallback(() => {
    if (containerRef.current) {
      setContainerWidth(containerRef.current.offsetWidth);
    }
  }, []);

  // 컨테이너 크기 감지
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const debouncedUpdate = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(updateSize, 100);
    };

    updateSize();
    window.addEventListener("resize", debouncedUpdate);
    return () => {
      window.removeEventListener("resize", debouncedUpdate);
      clearTimeout(timeoutId);
    };
  }, [updateSize]);

  // Convert schedule data to timeline events
  const events: TimelineEvent[] = useMemo(() => {
    return scheduleData.map((schedule) => ({
      id: schedule.id,
      title: schedule.title,
      startTime: schedule.start_time.substring(0, 5), // HH:MM
      endTime: schedule.end_time.substring(0, 5), // HH:MM
      dayOfWeek: schedule.day_of_week,
      color: schedule.color,
      type: schedule.type === "class" ? "class" : "schedule",
      compositionType: schedule.composition_type as "class" | "clinic" | undefined,
    }));
  }, [scheduleData]);

  // 전체 슬롯 수 계산 (10분 단위)
  const totalSlots = useMemo(() => {
    const totalMinutes = (END_HOUR - START_HOUR) * 60;
    return totalMinutes / MINUTES_PER_SLOT;
  }, []);

  // UI에 표시할 시간 레이블 (1시간 단위: 9, 10, 11, ..., 22)
  const hourLabels = useMemo(() => {
    const labels = [];
    for (let hour = Math.ceil(START_HOUR); hour <= Math.floor(END_HOUR); hour++) {
      labels.push(hour);
    }
    return labels;
  }, []);

  // 총 높이 계산 (10분 단위 슬롯 기준)
  const totalHeight = totalSlots * SLOT_HEIGHT;

  // 이벤트의 위치 계산 (10분 단위 정밀도)
  const getEventPosition = useCallback((event: TimelineEvent) => {
    const startMinutes = timeToMinutes(event.startTime);
    const endMinutes = timeToMinutes(event.endTime);

    // 시작 시간 (분 단위)
    const startMinutesFromBase = START_HOUR * 60; // 8:30 = 510분

    // 표시 범위를 벗어나면 무시
    if (endMinutes <= startMinutesFromBase || startMinutes > END_HOUR * 60) {
      return null;
    }

    // Y 위치 계산 (10분 단위로 정밀하게)
    // 시작 지점부터의 분 차이 / 10분 = 슬롯 개수
    const slotsFromStart = (startMinutes - startMinutesFromBase) / MINUTES_PER_SLOT;
    const durationSlots = (endMinutes - startMinutes) / MINUTES_PER_SLOT;

    const y = slotsFromStart * SLOT_HEIGHT;
    const height = durationSlots * SLOT_HEIGHT - 4;

    // X 위치 계산 (동적 칼럼 너비 사용)
    const x = event.dayOfWeek * dayColumnWidth;
    const width = dayColumnWidth - 4;

    return { x: x + 2, y: y + 2, width, height };
  }, [dayColumnWidth]);

  // 요일별로 이벤트 그룹화
  const eventsByDay = useMemo(() => {
    const grouped: { [key: number]: TimelineEvent[] } = {};
    events.forEach((event) => {
      if (!grouped[event.dayOfWeek]) {
        grouped[event.dayOfWeek] = [];
      }
      grouped[event.dayOfWeek].push(event);
    });
    return grouped;
  }, [events]);

  // 겹치는 이벤트 감지 (같은 요일 내에서)
  const detectOverlapping = useCallback((dayEvents: TimelineEvent[]) => {
    const groups: TimelineEvent[][] = [];

    dayEvents.forEach((event) => {
      let addedToGroup = false;

      for (const group of groups) {
        const overlapsWithGroup = group.some((groupEvent) => {
          const groupStart = timeToMinutes(groupEvent.startTime);
          const groupEnd = timeToMinutes(groupEvent.endTime);
          const eventStart = timeToMinutes(event.startTime);
          const eventEnd = timeToMinutes(event.endTime);

          return !(eventEnd <= groupStart || eventStart >= groupEnd);
        });

        if (overlapsWithGroup) {
          group.push(event);
          addedToGroup = true;
          break;
        }
      }

      if (!addedToGroup) {
        groups.push([event]);
      }
    });

    return groups;
  }, []);

  // 가로 스크롤 동기화 - 헤더와 스케줄 연동
  useEffect(() => {
    const scheduleContainer = scheduleContainerRef.current;
    const headerContainer = headerContainerRef.current;
    if (!scheduleContainer || !headerContainer) return;

    let isScrolling = false;

    const syncHeaderScroll = () => {
      if (isScrolling) return;
      isScrolling = true;
      headerContainer.scrollLeft = scheduleContainer.scrollLeft;
      requestAnimationFrame(() => {
        isScrolling = false;
      });
    };

    scheduleContainer.addEventListener("scroll", syncHeaderScroll);
    return () =>
      scheduleContainer.removeEventListener("scroll", syncHeaderScroll);
  }, []);

  const renderTooltipContent = useCallback((events: TimelineEvent[]) => {
    const dayName = dayLabels[events[0]?.dayOfWeek] || "";

    if (events.length === 1) {
      const event = events[0];
      return (
        <div className="text-left">
          <div className="flex items-center gap-2 mb-2 text-base font-bold text-white">
            <span>{event.title}</span>
            {event.type === "class" && event.compositionType && (
              <span className="text-xs px-2 py-0.5 rounded font-medium bg-white/20">
                {event.compositionType === "class" ? "수업" : "클리닉"}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mb-1 text-sm text-gray-200">
            <Clock className="w-4 h-4 text-blue-300" />
            <span>
              {formatTime(event.startTime)} - {formatTime(event.endTime)}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-200">
            <Calendar className="w-4 h-4 text-green-300" />
            <span>{dayName}요일</span>
          </div>
        </div>
      );
    }

    return (
      <div className="text-left">
        <div className="mb-2 text-sm font-bold text-white">
          겹치는 일정 ({events.length}개)
        </div>
        <div className="flex items-center gap-2 mb-2 text-xs text-gray-200">
          <Calendar className="w-3 h-3 text-green-300" />
          <span>{dayName}요일</span>
        </div>
        <div className="space-y-2">
          {events.map((event) => (
            <div
              key={event.id}
              className="pl-2 border-l-2"
              style={{ borderColor: event.color }}
            >
              <div className="flex items-center gap-2 text-sm font-medium text-white">
                <span>{event.title}</span>
                {event.type === "class" && event.compositionType && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded font-medium bg-white/20">
                    {event.compositionType === "class" ? "수업" : "클리닉"}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-200">
                <Clock className="w-3 h-3 text-blue-300" />
                <span>
                  {formatTime(event.startTime)} - {formatTime(event.endTime)}
                </span>
              </div>
              <div className="text-xs text-gray-300">
                {event.type === "class" ? "학원 수업" : "개인 일정"}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }, [dayLabels]);

  return (
    <div ref={containerRef} className="flex flex-col w-full h-full overflow-hidden bg-gray-50 rounded-lg border border-gray-200">
      {/* 헤더 영역 */}
      <div className="flex flex-shrink-0 bg-white border-b border-gray-200 rounded-t-lg">
        {/* 왼쪽 상단 "시간" 헤더 */}
        <div
          className="flex items-center justify-center flex-shrink-0 text-sm font-semibold text-gray-800 bg-gray-50 border-r border-gray-200 rounded-tl-lg"
          style={{ width: TIME_COLUMN_WIDTH, height: HEADER_HEIGHT }}
        >
          시간
        </div>

        {/* 요일 헤더 스크롤 컨테이너 */}
        <div
          ref={headerContainerRef}
          className="flex-1 overflow-x-auto overflow-y-hidden [&::-webkit-scrollbar]:hidden pointer-events-none"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          <div
            className="flex"
            style={{ width: totalWidth }}
          >
            {dayLabels.map((day, idx) => (
              <div
                key={day}
                className="flex items-center justify-center text-sm font-semibold text-gray-800 bg-white border-r border-gray-200"
                style={{
                  width: dayColumnWidth,
                  height: HEADER_HEIGHT,
                  lineHeight: `${HEADER_HEIGHT}px`,
                  flexShrink: 0
                }}
              >
                {day}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 스크롤 영역 */}
      <div ref={scheduleContainerRef} className="relative flex flex-1 overflow-auto">
        {/* 왼쪽 시간 칼럼 */}
        <div
          className="sticky left-0 z-10 flex-shrink-0 bg-gray-50 border-r border-gray-300 relative"
          style={{
            width: TIME_COLUMN_WIDTH,
            height: totalHeight
          }}
        >
          {hourLabels.map((hour) => {
            // 각 시간의 위치 계산 (8:30부터의 시간 차이)
            const offsetHours = hour - START_HOUR;
            const topPosition = offsetHours * PIXELS_PER_HOUR;

            return (
              <div
                key={hour}
                className="absolute"
                style={{
                  top: topPosition,
                  left: 0,
                  right: 0
                }}
              >
                <div
                  className="absolute top-0 left-0 right-0 flex items-center justify-center text-sm font-medium text-gray-600 bg-gray-50"
                  style={{
                    transform: 'translateY(-50%)',
                    padding: '2px 0'
                  }}
                >
                  {hour}:00
                </div>
              </div>
            );
          })}
        </div>

        {/* 그리드 및 이벤트 영역 */}
        <div
          className="relative"
          style={{
            width: totalWidth,
            height: totalHeight
          }}
        >
          {/* 배경 그리드 */}
          {dayLabels.map((_, dayIdx) => (
            <div
              key={`day-bg-${dayIdx}`}
              className="absolute border-r border-gray-200"
              style={{
                left: dayIdx * dayColumnWidth,
                top: 0,
                width: dayColumnWidth,
                height: totalHeight,
                backgroundColor: dayIdx % 2 === 0 ? "#ffffff" : "#f9fafb",
              }}
            />
          ))}

          {/* 가로 라인 (1시간 단위 시간 구분선) */}
          {hourLabels.map((hour) => {
            const offsetHours = hour - START_HOUR;
            const topPosition = offsetHours * PIXELS_PER_HOUR;

            return (
              <div
                key={`h-line-${hour}`}
                className="absolute border-t border-gray-200"
                style={{
                  top: topPosition,
                  left: 0,
                  width: totalWidth
                }}
              />
            );
          })}

          {/* 이벤트 렌더링 */}
          {Object.entries(eventsByDay).map(([dayOfWeek, dayEvents]) => {
            const eventGroups = detectOverlapping(dayEvents);

            return eventGroups.map((eventGroup, groupIdx) => {
              // 대표 이벤트 (가장 빠른 시작 시간)
              const representativeEvent = eventGroup.reduce((earliest, current) =>
                timeToMinutes(current.startTime) < timeToMinutes(earliest.startTime)
                  ? current
                  : earliest
              );

              const position = getEventPosition(representativeEvent);
              if (!position) return null;

              const isStacked = eventGroup.length > 1;

              return (
                <div
                  key={`event-${dayOfWeek}-${groupIdx}`}
                  className="absolute"
                  style={{
                    left: position.x,
                    top: position.y,
                    width: position.width,
                    height: position.height,
                  }}
                >
                  <Tooltip
                    content={renderTooltipContent(eventGroup)}
                    position="top"
                    delay={200}
                  >
                    <div className="relative w-full h-full group">
                      {/* 쌓인 효과 (뒤쪽 레이어들) */}
                      {isStacked &&
                        eventGroup.slice(1).map((event, stackIdx) => (
                          <div
                            key={`stack-${event.id}`}
                            className="absolute rounded-lg border-2 border-white shadow-md"
                            style={{
                              backgroundColor: event.color,
                              width: "100%",
                              height: "100%",
                              top: `${(stackIdx + 1) * 3}px`,
                              left: `${(stackIdx + 1) * 3}px`,
                              zIndex: -(stackIdx + 1),
                              opacity: 0.7,
                            }}
                          />
                        ))}

                      {/* 메인 이벤트 블록 */}
                      <div
                        className="relative flex flex-col h-full gap-1 px-2 py-2 text-white transition-all duration-200 border-2 border-white rounded-lg shadow-md cursor-pointer hover:shadow-xl hover:-translate-y-px"
                        style={{
                          backgroundColor: representativeEvent.color,
                          textShadow: "0 1px 2px rgba(0, 0, 0, 0.3)",
                        }}
                      >
                        <div className="flex items-start justify-between gap-1">
                          <span className="flex-1 overflow-hidden text-sm font-bold leading-tight whitespace-nowrap text-ellipsis">
                            {isStacked
                              ? `${representativeEvent.title} +${eventGroup.length - 1}`
                              : representativeEvent.title}
                          </span>
                          {representativeEvent.type === "class" &&
                            representativeEvent.compositionType && (
                              <span
                                className="text-[10px] px-1.5 py-0.5 rounded font-medium shrink-0"
                                style={{
                                  backgroundColor: "rgba(255, 255, 255, 0.25)",
                                  backdropFilter: "blur(4px)",
                                }}
                              >
                                {representativeEvent.compositionType === "class"
                                  ? "수업"
                                  : "클리닉"}
                              </span>
                            )}
                        </div>
                        <div className="text-[10px] opacity-90">
                          {formatTime(representativeEvent.startTime)} -{" "}
                          {formatTime(representativeEvent.endTime)}
                        </div>
                      </div>
                    </div>
                  </Tooltip>
                </div>
              );
            });
          })}
        </div>
      </div>
    </div>
  );
});

StudentHtmlSchedule.displayName = "StudentHtmlSchedule";

export default StudentHtmlSchedule;
