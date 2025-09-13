"use client";

import { useStudents } from "@/queries/useStudents";
import { useClasses } from "@/queries/useClasses";
import { useClassStudents } from "@/queries/useSchedules";
import { useStudentSchedules } from "@/queries/useSchedules";
import { Tables } from "@/types/supabase";
import { Calendar, Clock } from "lucide-react";
import { Fragment, useMemo, useState, useEffect } from "react";
import Tooltip from "./Tooltip";

// Helper function to convert time string "HH:mm" to minutes from midnight
const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

// Helper function to format time as HH:MM (remove seconds if present)
const formatTime = (time: string): string => {
  const [hours, minutes] = time.split(":");
  return `${hours}:${minutes}`;
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
}

export default function CombinedStudentSchedule() {
  // API에서 데이터 가져오기
  const { data: students = [], isLoading: studentsLoading } = useStudents();
  const { data: classes = [], isLoading: classesLoading } = useClasses();
  const { data: classStudents = [], isLoading: classStudentsLoading } = useClassStudents();
  const { data: studentSchedules = [], isLoading: studentSchedulesLoading } = useStudentSchedules();

  // 선택된 학생들 상태
  const [selectedStudents, setSelectedStudents] = useState<number[]>([]);

  // 학생 데이터가 로드되면 전체 선택으로 초기화
  useEffect(() => {
    if (students.length > 0 && selectedStudents.length === 0) {
      setSelectedStudents(students.map((s) => s.id));
    }
  }, [students, selectedStudents.length]);

  const daysOfWeek = useMemo(() => [
    { name: "월", startHour: 16, endHour: 22 },
    { name: "화", startHour: 16, endHour: 22 },
    { name: "수", startHour: 16, endHour: 22 },
    { name: "목", startHour: 16, endHour: 22 },
    { name: "금", startHour: 16, endHour: 22 },
    { name: "토", startHour: 10, endHour: 22 },
    { name: "일", startHour: 10, endHour: 22 },
  ], []);

  // Pre-calculate timeline metrics for performance
  const timelineMetrics = useMemo(() => {
    let totalSlots = 0;
    const daySlots = daysOfWeek.map((day) => {
      // 시작시간보다 30분 앞부터, 끝시간보다 30분 뒤까지 (+1시간 추가)
      const durationMinutes = (day.endHour - day.startHour + 1) * 60;
      return durationMinutes / 2.5; // 2.5-minute slots (double density)
    });
    const dayStartSlot = daySlots.map((_, i) =>
      daySlots.slice(0, i).reduce((acc, val) => acc + val, 0)
    );
    totalSlots = daySlots.reduce((acc, val) => acc + val, 0);

    return { daySlots, dayStartSlot, totalSlots };
  }, [daysOfWeek]);

  // Process and merge class and schedule data for each student
  const studentData = useMemo(() => {
    return students
      .filter((s) => selectedStudents.includes(s.id))
      .map((student) => {
        const studentClasses = classStudents
          .filter((cs) => cs.student_id === student.id)
          .map((cs) => classes.find((c) => c.id === cs.class_id))
          .filter((c): c is Tables<"classes"> => !!c);

        const classEvents: TimelineEvent[] = studentClasses.map((c) => ({
          id: `class-${c.id}`,
          title: c.title,
          startTime: c.start_time,
          endTime: c.end_time,
          dayOfWeek: c.day_of_week === 0 ? 6 : c.day_of_week - 1, // Adjust dayOfWeek (Sun=0 -> Sun=6)
          color: c.color,
          type: "class",
        }));

        const personalEvents: TimelineEvent[] = studentSchedules
          .filter((ss) => ss.student_id === student.id)
          .map((ss) => ({
            id: `schedule-${ss.id}`,
            title: ss.title,
            startTime: ss.start_time,
            endTime: ss.end_time,
            dayOfWeek: ss.day_of_week, // Already 0-6 for Mon-Sun
            color: ss.color || "#EF4444", // Default color if null
            type: "schedule",
          }));

        return {
          ...student,
          events: [...classEvents, ...personalEvents],
        };
      });
  }, [selectedStudents, students, classes, classStudents, studentSchedules]);

  // 겹치는 이벤트들을 그룹화하는 함수
  const groupOverlappingEvents = (events: TimelineEvent[]) => {
    const groups: TimelineEvent[][] = [];

    events.forEach((event) => {
      // 이 이벤트와 겹치는 기존 그룹이 있는지 확인
      let addedToGroup = false;

      for (const group of groups) {
        const overlapsWithGroup = group.some((groupEvent) => {
          // 같은 요일이고 시간이 겹치는지 확인
          if (groupEvent.dayOfWeek !== event.dayOfWeek) return false;

          const groupStart = timeToMinutes(groupEvent.startTime);
          const groupEnd = timeToMinutes(groupEvent.endTime);
          const eventStart = timeToMinutes(event.startTime);
          const eventEnd = timeToMinutes(event.endTime);

          // 시간이 겹치는지 확인
          return !(eventEnd <= groupStart || eventStart >= groupEnd);
        });

        if (overlapsWithGroup) {
          group.push(event);
          addedToGroup = true;
          break;
        }
      }

      // 겹치는 그룹이 없으면 새 그룹 생성
      if (!addedToGroup) {
        groups.push([event]);
      }
    });

    return groups;
  };

  // Function to calculate the grid position for an event
  const getGridPosition = (event: TimelineEvent) => {
    const dayInfo = daysOfWeek[event.dayOfWeek];
    if (!dayInfo) return {};

    const eventStartMinutes = timeToMinutes(event.startTime);
    const eventEndMinutes = timeToMinutes(event.endTime);
    // 30분 앞부터 시작하므로 기준점을 30분 앞으로 조정
    const dayStartMinutes = (dayInfo.startHour - 0.5) * 60;

    // 확장된 시간 범위 (30분 앞 ~ 30분 뒤)
    const extendedStartMinutes = (dayInfo.startHour - 0.5) * 60;
    const extendedEndMinutes = (dayInfo.endHour + 0.5) * 60;

    // Only render events within the visible time window
    if (
      eventEndMinutes <= extendedStartMinutes ||
      eventStartMinutes >= extendedEndMinutes
    ) {
      return {};
    }

    const startOffsetMinutes = Math.max(0, eventStartMinutes - dayStartMinutes);
    const endOffsetMinutes = Math.min(
      (dayInfo.endHour - dayInfo.startHour + 1) * 60, // +1시간 확장된 범위
      eventEndMinutes - dayStartMinutes
    );

    const startSlot = Math.floor(startOffsetMinutes / 2.5);
    const endSlot = Math.ceil(endOffsetMinutes / 2.5);
    const span = endSlot - startSlot;

    if (span <= 0) return {};

    const dayOffset = timelineMetrics.dayStartSlot[event.dayOfWeek] || 0;
    const gridColumnStart = 2 + dayOffset + startSlot; // +2 because grid has student name column at the start

    return {
      gridColumn: `${gridColumnStart} / span ${span}`,
    };
  };

  const renderTooltipContent = (events: TimelineEvent[]) => {
    const dayName = daysOfWeek[events[0]?.dayOfWeek]?.name || "";

    // 단일 이벤트인 경우
    if (events.length === 1) {
      const event = events[0];
      return (
        <div className="text-left">
          <div className="font-bold text-base mb-2 text-white">
            {event.title}
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-200 mb-1">
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

    // 다중 이벤트인 경우
    return (
      <div className="text-left">
        <div className="font-bold text-sm mb-2 text-white">
          겹치는 일정 ({events.length}개)
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-200 mb-2">
          <Calendar className="w-3 h-3 text-green-300" />
          <span>{dayName}요일</span>
        </div>
        <div className="space-y-2">
          {events.map((event) => (
            <div
              key={event.id}
              className="border-l-2 pl-2"
              style={{ borderColor: event.color }}
            >
              <div className="font-medium text-sm text-white">
                {event.title}
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-200">
                <Clock className="w-3 h-3 text-blue-300" />
                <span>
                  {formatTime(event.startTime)} - {formatTime(event.endTime)}
                </span>
              </div>
              <div className="text-xs text-gray-300">
                {event.type === "class" ? "정규 수업" : "개인 일정"}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderTimelineHeader = () => {
    let currentSlot = 2; // Start after student name column
    return (
      <>
        {daysOfWeek.map((day, dayIndex) => {
          // 30분 앞부터 30분 뒤까지 (+1시간)
          const dayDurationHours = day.endHour - day.startHour + 1;
          const dayHeader = (
            <div
              key={`day-${dayIndex}`}
              className="text-center text-xs py-1 bg-white font-semibold border-l-2 border-gray-500 sticky top-0 z-20"
              style={{
                gridColumn: `${currentSlot} / span ${timelineMetrics.daySlots[dayIndex]}`,
                gridRow: "1",
              }}
            >
              {day.name}
            </div>
          );

          const hourMarkers = Array.from({ length: dayDurationHours }).map(
            (_, hourIndex) => {
              // 시작시간보다 30분 앞부터 시작
              const hour = day.startHour + hourIndex - 0.5;
              const displayHour = Math.ceil(hour); // 표시할 시간은 올림
              const hourSlot = currentSlot + hourIndex * 24; // 시작부터 바로 시작 (이미 30분 앞부터 계산됨)

              // 요일의 첫 번째 시간인지 확인 (더 두꺼운 선)
              const isFirstHour = hourIndex === 0;

              return (
                <div
                  key={`hour-${dayIndex}-${hourIndex}`}
                  className={`text-center text-xs py-1 bg-white border-b border-gray-200 text-gray-500 sticky z-20 ${
                    isFirstHour ? "border-l-2 border-l-gray-400" : ""
                  }`}
                  style={{
                    gridColumn: `${hourSlot} / span 24`, // 전체 1시간(24슬롯) 차지
                    gridRow: "2",
                    top: "24px",
                  }}
                >
                  {displayHour}
                </div>
              );
            }
          );

          currentSlot += timelineMetrics.daySlots[dayIndex];
          return [dayHeader, ...hourMarkers];
        })}
      </>
    );
  };

  // 로딩 상태
  const isLoading = studentsLoading || classesLoading || classStudentsLoading || studentSchedulesLoading;

  if (isLoading) {
    return (
      <div className="w-full grow overflow-auto bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">스케줄 데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full grow overflow-auto bg-gray-50 rounded-lg border border-gray-200">
      <div
        className="grid min-w-[4800px]"
        style={{
          gridTemplateColumns: `min-content repeat(${timelineMetrics.totalSlots}, 1fr)`,
        }}
      >
        {/* Timeline Header */}
        <div
          className="bg-white border-b border-r border-gray-200 sticky left-0 top-0 z-30"
          style={{ gridRow: "1 / 3", gridColumn: "1" }}
        ></div>
        {renderTimelineHeader()}

        {/* Grid Background */}
        {studentData.map((student, rowIndex) =>
          daysOfWeek.map((day, dayIndex) => {
            const dayDurationHours = day.endHour - day.startHour + 1;
            return Array.from({ length: dayDurationHours }).map(
              (_, hourIndex) => {
                const dayOffset = timelineMetrics.dayStartSlot[dayIndex] || 0;
                const hourSlot = 2 + dayOffset + hourIndex * 24;
                const isFirstHour = hourIndex === 0;

                return (
                  <div
                    key={`grid-${student.id}-${dayIndex}-${hourIndex}`}
                    className={`border-b border-gray-100 ${
                      isFirstHour && "border-l-2 border-l-gray-400"
                    }`}
                    style={{
                      gridColumn: `${hourSlot} / span 24`,
                      gridRow: rowIndex + 3,
                    }}
                  />
                );
              }
            );
          })
        )}

        {/* 정각 세로선 */}
        {studentData.map((student, rowIndex) =>
          daysOfWeek.map((day, dayIndex) => {
            const dayDurationHours = day.endHour - day.startHour + 1;
            return Array.from({ length: dayDurationHours }).map(
              (_, hourIndex) => {
                const dayOffset = timelineMetrics.dayStartSlot[dayIndex] || 0;
                const hourSlot = 2 + dayOffset + hourIndex * 24 + 12; // 정각 위치 (30분 오프셋)

                return (
                  <div
                    key={`hour-line-${student.id}-${dayIndex}-${hourIndex}`}
                    className="border-l border-l-gray-200"
                    style={{
                      gridColumn: `${hourSlot}`,
                      gridRow: rowIndex + 3,
                      height: "100%",
                    }}
                  />
                );
              }
            );
          })
        )}

        {/* Student Rows */}
        {studentData.map((student, rowIndex) => {
          // 학생의 이벤트들을 겹치는 것끼리 그룹화
          const eventGroups = groupOverlappingEvents(student.events);

          return (
            <Fragment key={student.id}>
              <div
                className="sticky left-0 z-15 bg-white px-4 py-3 font-medium text-sm border-r border-b border-gray-200 border-b-gray-100 whitespace-nowrap"
                style={{ gridRow: rowIndex + 3, gridColumn: "1" }}
              >
                {student.name}
              </div>
              {eventGroups.map((eventGroup, groupIndex) => {
                // 그룹의 대표 이벤트 (시간이 가장 빠른 것)
                const representativeEvent = eventGroup.reduce(
                  (earliest, current) =>
                    timeToMinutes(current.startTime) <
                    timeToMinutes(earliest.startTime)
                      ? current
                      : earliest
                );

                const position = getGridPosition(representativeEvent);
                if (!position.gridColumn) return null;

                // 겹치는 이벤트가 있으면 시각적 표시 (쌓인 효과)
                const isStacked = eventGroup.length > 1;

                return (
                  <div
                    key={`group-${student.id}-${groupIndex}`}
                    style={{
                      ...position,
                      gridRow: rowIndex + 3,
                      // 이벤트가 그리드 위에 표시되도록
                    }}
                    className="relative z-10 hover:z-20"
                  >
                    <Tooltip
                      content={renderTooltipContent(eventGroup)}
                      position="top"
                      delay={200}
                    >
                      <div className="relative w-full h-full z-50">
                        {/* 쌓인 효과를 위한 백그라운드 아이템들 */}
                        {isStacked &&
                          eventGroup.slice(1).map((event, stackIndex) => (
                            <div
                              key={`stack-${event.id}`}
                              className="absolute rounded border-0 text-white px-1.5 py-0.5 overflow-hidden whitespace-nowrap text-ellipsis text-xs leading-tight opacity-60"
                              style={{
                                backgroundColor: event.color,
                                width: "100%",
                                height: "100%",
                                top: `${(stackIndex + 1) * 2}px`,
                                left: `${(stackIndex + 1) * 2}px`,
                                zIndex: -(stackIndex + 1),
                              }}
                            />
                          ))}

                        {/* 메인 아이템 */}
                        <div
                          className={`relative rounded border-0 my-0.5 text-white px-1.5 py-0.5 overflow-hidden whitespace-nowrap text-ellipsis text-xs leading-tight cursor-pointer transition-transform duration-100 ease-in-out hover:transform hover:-translate-y-px hover:shadow-sm ${
                            isStacked ? "shadow-md" : ""
                          }`}
                          style={{
                            backgroundColor: representativeEvent.color,
                            width: "100%",
                            height: "100%",
                          }}
                        >
                          <span className="pointer-events-none">
                            {isStacked
                              ? `${representativeEvent.title} +${
                                  eventGroup.length - 1
                                }`
                              : representativeEvent.title}
                          </span>
                        </div>
                      </div>
                    </Tooltip>
                  </div>
                );
              })}
            </Fragment>
          );
        })}
      </div>
    </div>
  );
}
