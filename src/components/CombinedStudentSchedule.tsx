"use client";

import { classes } from "@/lib/mock/classes";
import { classStudents } from "@/lib/mock/classStudents";
import { students } from "@/lib/mock/students";
import { studentSchedules } from "@/lib/mock/studentSchedules";
import { Class } from "@/types/schedule";
import { Fragment, useMemo, useState } from "react";
import { Clock, Calendar, User, BookOpen } from "lucide-react";
import Tooltip from "./Tooltip";
import "./CombinedStudentSchedule.css";
import "./Tooltip.css";

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
      <div className="schedule-tooltip-content">
        <div className="schedule-tooltip-title">{event.title}</div>
        <div className="schedule-tooltip-details">
          <div className="schedule-tooltip-detail">
            <Clock className="schedule-tooltip-icon" />
            <span>{event.startTime} - {event.endTime}</span>
          </div>
          <div className="schedule-tooltip-detail">
            <Calendar className="schedule-tooltip-icon" />
            <span>{dayName}요일</span>
          </div>
          {event.type === "class" && (
            <div className="schedule-tooltip-detail">
              <BookOpen className="schedule-tooltip-icon" />
              <span>정규 수업</span>
            </div>
          )}
          {event.type === "schedule" && (
            <div className="schedule-tooltip-detail">
              <User className="schedule-tooltip-icon" />
              <span>개인 일정</span>
            </div>
          )}
        </div>
        <div className={`schedule-tooltip-type ${event.type}`}>
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
              className="time-header day-header"
              style={{
                gridColumn: `${currentSlot} / span ${timelineMetrics.daySlots[dayIndex]}`,
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
                  className="time-header hour-marker"
                  style={{ gridColumn: `${hourSlot} / span 12` }}
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
    <div className="schedule-container">
      <div
        className="schedule-grid"
        style={{
          gridTemplateColumns: `min-content repeat(${timelineMetrics.totalSlots}, 1fr)`,
        }}
      >
        {/* Timeline Header */}
        <div className="time-header-corner"></div>
        {renderTimelineHeader()}

        {/* Student Rows */}
        {studentData.map((student, rowIndex) => (
          <Fragment key={student.id}>
            <div className="student-name" style={{ gridRow: rowIndex + 3 }}>
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
                >
                  <Tooltip
                    content={renderTooltipContent(event)}
                    position="top"
                    delay={200}
                  >
                    <div
                      className="schedule-item"
                      style={{
                        backgroundColor: event.color,
                        width: "100%",
                        height: "100%",
                      }}
                    >
                      <span className="schedule-item-title">{event.title}</span>
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
