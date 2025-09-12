"use client";

import { classes } from "@/lib/mock/classes";
import { classStudents } from "@/lib/mock/classStudents";
import { students } from "@/lib/mock/students";
import { studentSchedules } from "@/lib/mock/studentSchedules";
import { Class } from "@/types/schedule";
import { Calendar, Clock } from "lucide-react";
import { Fragment, useMemo, useState } from "react";
import Tooltip from "./Tooltip";

// Helper function to convert time string "HH:mm" to minutes from midnight
const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
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
  const [selectedStudents, setSelectedStudents] = useState<number[]>(() =>
    students.map((s) => s.id)
  );

  const daysOfWeek = [
    { name: "월", startHour: 16, endHour: 22 },
    { name: "화", startHour: 16, endHour: 22 },
    { name: "수", startHour: 16, endHour: 22 },
    { name: "목", startHour: 16, endHour: 22 },
    { name: "금", startHour: 16, endHour: 22 },
    { name: "토", startHour: 10, endHour: 22 },
    { name: "일", startHour: 10, endHour: 22 },
  ];

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
          .filter((cs) => cs.studentId === student.id)
          .map((cs) => classes.find((c) => c.id === cs.classId))
          .filter((c): c is Class => !!c);

        const classEvents: TimelineEvent[] = studentClasses.map((c) => ({
          id: `class-${c.id}`,
          title: c.title,
          startTime: c.startTime,
          endTime: c.endTime,
          dayOfWeek: c.dayOfWeek === 0 ? 6 : c.dayOfWeek - 1, // Adjust dayOfWeek (Sun=0 -> Sun=6)
          color: c.color,
          type: "class",
        }));

        const personalEvents: TimelineEvent[] = studentSchedules
          .filter((ss) => ss.studentId === student.id)
          .map((ss) => ({
            id: `schedule-${ss.id}`,
            title: ss.title,
            startTime: ss.startTime,
            endTime: ss.endTime,
            dayOfWeek: ss.dayOfWeek, // Already 0-6 for Mon-Sun
            color: ss.color,
            type: "schedule",
          }));

        return {
          ...student,
          events: [...classEvents, ...personalEvents],
        };
      });
  }, [selectedStudents]);

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

  const renderTooltipContent = (event: TimelineEvent) => {
    const dayName = daysOfWeek[event.dayOfWeek]?.name || "";

    return (
      <div className="text-left">
        <div className="font-bold text-base mb-2 text-white">{event.title}</div>
        <div className="flex items-center gap-2 text-sm text-gray-200 mb-1">
          <Clock className="w-4 h-4 text-blue-300" />
          <span>
            {event.startTime} - {event.endTime}
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-200">
          <Calendar className="w-4 h-4 text-green-300" />
          <span>{dayName}요일</span>
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
                      isFirstHour
                        ? "border-l-2 border-l-gray-400"
                        : "border-l border-l-gray-200"
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

        {/* Student Rows */}
        {studentData.map((student, rowIndex) => (
          <Fragment key={student.id}>
            <div
              className="sticky left-0 z-15 bg-white px-4 py-3 font-medium text-sm border-r border-b border-gray-200 border-b-gray-100 whitespace-nowrap"
              style={{ gridRow: rowIndex + 3, gridColumn: "1" }}
            >
              {student.name}
            </div>
            {student.events.map((event) => {
              const position = getGridPosition(event);
              if (!position.gridColumn) return null;

              return (
                <div
                  key={event.id}
                  style={{
                    ...position,
                    gridRow: rowIndex + 3,
                    zIndex: 10, // 이벤트가 그리드 위에 표시되도록
                  }}
                >
                  <Tooltip
                    content={renderTooltipContent(event)}
                    position="top"
                    delay={200}
                  >
                    <div
                      className="relative rounded border-0 my-0.5 text-white px-1.5 py-0.5 overflow-hidden whitespace-nowrap text-ellipsis text-xs leading-tight cursor-pointer transition-transform duration-100 ease-in-out hover:transform hover:-translate-y-px hover:shadow-sm hover:z-5"
                      style={{
                        backgroundColor: event.color,
                        width: "100%",
                        height: "100%",
                      }}
                    >
                      <span className="pointer-events-none">{event.title}</span>
                    </div>
                  </Tooltip>
                </div>
              );
            })}
          </Fragment>
        ))}
      </div>
    </div>
  );
}
