"use client";

import { classes } from "@/lib/mock/classes";
import { classStudents } from "@/lib/mock/classStudents";
import { students } from "@/lib/mock/students";
import { studentSchedules } from "@/lib/mock/studentSchedules";
import { Class } from "@/types/schedule";
import { BookOpen, Calendar, Clock, User } from "lucide-react";
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
      const durationMinutes = (day.endHour - day.startHour) * 60;
      return durationMinutes / 5; // 5-minute slots
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
    const dayStartMinutes = dayInfo.startHour * 60;

    // Only render events within the visible time window
    if (
      eventEndMinutes <= dayStartMinutes ||
      eventStartMinutes >= dayInfo.endHour * 60
    ) {
      return {};
    }

    const startOffsetMinutes = Math.max(0, eventStartMinutes - dayStartMinutes);
    const endOffsetMinutes = Math.min(
      (dayInfo.endHour - dayInfo.startHour) * 60,
      eventEndMinutes - dayStartMinutes
    );

    const startSlot = Math.floor(startOffsetMinutes / 5);
    const endSlot = Math.ceil(endOffsetMinutes / 5);
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
        <div className="font-semibold text-base mb-2 text-white">
          {event.title}
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-sm text-white text-opacity-90">
            <Clock className="w-3.5 h-3.5 opacity-80" />
            <span>
              {event.startTime} - {event.endTime}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-white text-opacity-90">
            <Calendar className="w-3.5 h-3.5 opacity-80" />
            <span>{dayName}요일</span>
          </div>
          {event.type === "class" && (
            <div className="flex items-center gap-2 text-sm text-white text-opacity-90">
              <BookOpen className="w-3.5 h-3.5 opacity-80" />
              <span>정규 수업</span>
            </div>
          )}
          {event.type === "schedule" && (
            <div className="flex items-center gap-2 text-sm text-white text-opacity-90">
              <User className="w-3.5 h-3.5 opacity-80" />
              <span>개인 일정</span>
            </div>
          )}
        </div>
        <div
          className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium mt-2 ${
            event.type === "class"
              ? "bg-blue-500 bg-opacity-30 text-blue-300"
              : "bg-green-500 bg-opacity-30 text-green-300"
          }`}
        >
          {event.type === "class" ? "정규 수업" : "개인 일정"}
        </div>
      </div>
    );
  };

  const renderTimelineHeader = () => {
    let currentSlot = 2; // Start after student name column
    return (
      <>
        {daysOfWeek.map((day, dayIndex) => {
          const dayDurationHours = day.endHour - day.startHour;
          const dayHeader = (
            <div
              key={`day-${dayIndex}`}
              className="text-center text-xs py-1 bg-white border-b font-semibold border-r border-gray-200 sticky top-0 z-20"
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
              const hour = day.startHour + hourIndex;
              const hourSlot = currentSlot + hourIndex * 12; // 1 hour = 12 * 5-min slots
              return (
                <div
                  key={`hour-${dayIndex}-${hourIndex}`}
                  className="text-center text-xs py-1 bg-white border-b border-r border-gray-200 text-gray-500 sticky z-20"
                  style={{
                    gridColumn: `${hourSlot} / span 12`,
                    gridRow: "2",
                    top: "27px",
                  }}
                >
                  {hour}
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
    <div className="w-full h-[600px] overflow-auto bg-gray-50 rounded-lg border border-gray-200">
      <div
        className="grid min-w-[2400px]"
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
                  }}
                  className="w-full h-full"
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
