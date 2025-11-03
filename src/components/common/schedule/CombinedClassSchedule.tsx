"use client";

import Tooltip from "@/components/common/Tooltip";
import { getEventColor } from "@/lib/scheduleUtils";
import { useCombinedClassSchedule } from "@/queries/useCombinedSchedule";
import { ArrowUpDown, Calendar, Clock, Search } from "lucide-react";
import { Fragment, useMemo, useState } from "react";

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

// Represents a single event on the timeline
interface TimelineEvent {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  dayOfWeek: number; // 0 for Mon, 1 for Tue, ..., 6 for Sun
  color: string;
  type: "class" | "clinic";
}

export default function CombinedClassSchedule() {
  const { data: classesWithSchedules = [], isLoading } = useCombinedClassSchedule();

  const [searchQuery, setSearchQuery] = useState("");

  type SortField = "title" | "teacher" | "subject";
  type SortOrder = "asc" | "desc";
  const [sortField, setSortField] = useState<SortField>("title");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);

  // 수업 데이터가 로드되면 전체 선택으로 초기화
  useMemo(() => {
    if (classesWithSchedules.length > 0 && selectedClasses.length === 0) {
      setSelectedClasses(classesWithSchedules.map((c) => c.id));
    }
  }, [classesWithSchedules, selectedClasses.length]);

  const daysOfWeek = useMemo(
    () => [
      { name: "월", startHour: 16, endHour: 22 },
      { name: "화", startHour: 16, endHour: 22 },
      { name: "수", startHour: 16, endHour: 22 },
      { name: "목", startHour: 16, endHour: 22 },
      { name: "금", startHour: 16, endHour: 22 },
      { name: "토", startHour: 10, endHour: 22 },
      { name: "일", startHour: 10, endHour: 22 },
    ],
    []
  );

  const timelineMetrics = useMemo(() => {
    let totalSlots = 0;
    const daySlots = daysOfWeek.map((day) => {
      const durationMinutes = (day.endHour - day.startHour + 1) * 60;
      return durationMinutes / 2.5;
    });
    const dayStartSlot = daySlots.map((_, i) =>
      daySlots.slice(0, i).reduce((acc, val) => acc + val, 0)
    );
    totalSlots = daySlots.reduce((acc, val) => acc + val, 0);

    return { daySlots, dayStartSlot, totalSlots };
  }, [daysOfWeek]);

  const classData = useMemo(() => {
    const filteredClasses = classesWithSchedules
      .filter((c) => {
        if (!selectedClasses.includes(c.id)) return false;

        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          if (c.title.toLowerCase().includes(query)) return true;
          if (c.teacher && c.teacher.name.toLowerCase().includes(query)) return true;
          if (c.subject && c.subject.subject_name?.toLowerCase().includes(query)) return true;
          return false;
        }

        return true;
      })
      .map((classItem) => {
        const events: TimelineEvent[] = classItem.class_composition
          .filter((comp) => comp !== null)
          .map((comp) => {
            const subjectName = classItem.subject?.subject_name;
            const eventColor = getEventColor(subjectName, false);

            return {
              id: `class-${classItem.id}-${comp.id}`,
              title: classItem.title,
              startTime: comp.start_time,
              endTime: comp.end_time,
              dayOfWeek: comp.day_of_week,
              color: eventColor,
              type: (comp.type as "class" | "clinic") || "class",
            };
          });

        return {
          ...classItem,
          events,
        };
      });

    const sortedClasses = [...filteredClasses].sort((a, b) => {
      let compareValue = 0;

      switch (sortField) {
        case "title":
          compareValue = a.title.localeCompare(b.title, "ko-KR");
          break;
        case "teacher":
          const teacherA = a.teacher?.name || "";
          const teacherB = b.teacher?.name || "";
          compareValue = teacherA.localeCompare(teacherB, "ko-KR");
          break;
        case "subject":
          const subjectA = a.subject?.subject_name || "";
          const subjectB = b.subject?.subject_name || "";
          compareValue = subjectA.localeCompare(subjectB, "ko-KR");
          break;
      }

      return sortOrder === "asc" ? compareValue : -compareValue;
    });

    return sortedClasses;
  }, [
    selectedClasses,
    classesWithSchedules,
    searchQuery,
    sortField,
    sortOrder,
  ]);

  const groupOverlappingEvents = (events: TimelineEvent[]) => {
    const groups: TimelineEvent[][] = [];

    events.forEach((event) => {
      let addedToGroup = false;

      for (const group of groups) {
        const overlapsWithGroup = group.some((groupEvent) => {
          if (groupEvent.dayOfWeek !== event.dayOfWeek) return false;

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
  };

  const getGridPosition = (event: TimelineEvent) => {
    const dayInfo = daysOfWeek[event.dayOfWeek];
    if (!dayInfo) return {};

    const eventStartMinutes = timeToMinutes(event.startTime);
    const eventEndMinutes = timeToMinutes(event.endTime);
    const dayStartMinutes = (dayInfo.startHour - 0.5) * 60;

    const extendedStartMinutes = (dayInfo.startHour - 0.5) * 60;
    const extendedEndMinutes = (dayInfo.endHour + 0.5) * 60;

    if (
      eventEndMinutes <= extendedStartMinutes ||
      eventStartMinutes >= extendedEndMinutes
    ) {
      return {};
    }

    const startOffsetMinutes = Math.max(0, eventStartMinutes - dayStartMinutes);
    const endOffsetMinutes = Math.min(
      (dayInfo.endHour - dayInfo.startHour + 1) * 60,
      eventEndMinutes - dayStartMinutes
    );

    const startSlot = Math.floor(startOffsetMinutes / 2.5);
    const endSlot = Math.ceil(endOffsetMinutes / 2.5);
    const span = endSlot - startSlot;

    if (span <= 0) return {};

    const dayOffset = timelineMetrics.dayStartSlot[event.dayOfWeek] || 0;
    const gridColumnStart = 2 + dayOffset + startSlot;

    return {
      gridColumn: `${gridColumnStart} / span ${span}`,
    };
  };

  const renderTooltipContent = (events: TimelineEvent[]) => {
    const dayName = daysOfWeek[events[0]?.dayOfWeek]?.name || "";

    if (events.length === 1) {
      const event = events[0];
      return (
        <div className="text-left">
          <div className="flex items-center gap-2 mb-2 text-base font-bold text-white">
            <span>{event.title}</span>
            <span className="text-xs px-2 py-0.5 rounded font-medium bg-white/20">
              {event.type === "class" ? "수업" : "클리닉"}
            </span>
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
                <span className="text-[10px] px-1.5 py-0.5 rounded font-medium bg-white/20">
                  {event.type === "class" ? "수업" : "클리닉"}
                </span>
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-200">
                <Clock className="w-3 h-3 text-blue-300" />
                <span>
                  {formatTime(event.startTime)} - {formatTime(event.endTime)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderTimelineHeader = () => {
    let currentSlot = 2;
    return (
      <>
        {daysOfWeek.map((day, dayIndex) => {
          const dayDurationHours = day.endHour - day.startHour + 1;
          const dayHeader = (
            <div
              key={`day-${dayIndex}`}
              className={`text-center text-xs py-1 font-semibold text-gray-800 sticky top-0 z-20 ${
                dayIndex % 2 === 0 ? "bg-gray-100" : "bg-gray-200"
              }`}
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
              const hour = day.startHour + hourIndex - 0.5;
              const displayHour = Math.ceil(hour);
              const hourSlot = currentSlot + hourIndex * 24;

              return (
                <div
                  key={`hour-${dayIndex}-${hourIndex}`}
                  className={`text-center text-xs py-1 text-gray-500 sticky z-20 ${
                    dayIndex % 2 === 0 ? "bg-gray-50" : "bg-gray-100"
                  }`}
                  style={{
                    gridColumn: `${hourSlot} / span 24`,
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center w-full overflow-auto rounded-lg grow bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 border-b-2 rounded-full animate-spin border-primary-600"></div>
          <p className="text-gray-600">수업 데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  return (
    <div className="flex flex-col w-full h-full rounded-lg grow bg-gray-50">
      {/* 검색 및 정렬 바 */}
      <div className="p-4 bg-white border-b border-gray-200">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute w-5 h-5 text-gray-400 -translate-y-1/2 left-3 top-1/2" />
            <input
              type="text"
              placeholder="수업명, 선생님, 과목으로 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-sm font-medium text-gray-600">정렬:</span>
            <button
              onClick={() => handleSort("title")}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                sortField === "title"
                  ? "bg-primary-100 text-primary-700 font-medium"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <span>수업명</span>
              {sortField === "title" && <ArrowUpDown className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={() => handleSort("teacher")}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                sortField === "teacher"
                  ? "bg-primary-100 text-primary-700 font-medium"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <span>선생님</span>
              {sortField === "teacher" && <ArrowUpDown className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={() => handleSort("subject")}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                sortField === "subject"
                  ? "bg-primary-100 text-primary-700 font-medium"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <span>과목</span>
              {sortField === "subject" && <ArrowUpDown className="w-3.5 h-3.5" />}
            </button>
            {sortOrder === "desc" && (
              <span className="ml-1 text-xs text-gray-500">내림차순</span>
            )}
          </div>
        </div>
      </div>

      {/* 타임라인 */}
      <div className="flex-1 overflow-auto scrollbar-hide">
        <div
          className="grid min-w-[4800px]"
          style={{
            gridTemplateColumns: `min-content repeat(${timelineMetrics.totalSlots}, 1fr)`,
          }}
        >
          <div
            className="sticky top-0 left-0 z-30 bg-gray-200"
            style={{ gridRow: "1 / 3", gridColumn: "1" }}
          ></div>
          {renderTimelineHeader()}

          {/* Grid Background */}
          {classData.map((classItem, rowIndex) =>
            daysOfWeek.map((day, dayIndex) => {
              const dayDurationHours = day.endHour - day.startHour + 1;
              return Array.from({ length: dayDurationHours }).map(
                (_, hourIndex) => {
                  const dayOffset = timelineMetrics.dayStartSlot[dayIndex] || 0;
                  const hourSlot = 2 + dayOffset + hourIndex * 24;

                  return (
                    <div
                      key={`grid-${classItem.id}-${dayIndex}-${hourIndex}`}
                      className={`${
                        dayIndex % 2 === 0 ? "bg-white" : "bg-gray-50"
                      }`}
                      style={{
                        gridColumn: `${hourSlot} / span 24`,
                        gridRow: rowIndex + 3,
                        height: "50px",
                      }}
                    />
                  );
                }
              );
            })
          )}

          {/* 정각 세로선 */}
          {classData.map((classItem, rowIndex) =>
            daysOfWeek.map((day, dayIndex) => {
              const dayDurationHours = day.endHour - day.startHour + 1;
              return Array.from({ length: dayDurationHours }).map(
                (_, hourIndex) => {
                  const dayOffset = timelineMetrics.dayStartSlot[dayIndex] || 0;
                  const hourSlot = 2 + dayOffset + hourIndex * 24 + 12;

                  return (
                    <div
                      key={`hour-line-${classItem.id}-${dayIndex}-${hourIndex}`}
                      className="bg-gray-200"
                      style={{
                        gridColumn: `${hourSlot}`,
                        gridRow: rowIndex + 3,
                        height: "50px",
                        width: "1px",
                      }}
                    />
                  );
                }
              );
            })
          )}

          {/* Class Rows */}
          {classData.map((classItem, rowIndex) => {
            const eventGroups = groupOverlappingEvents(classItem.events);

            return (
              <Fragment key={classItem.id}>
                <div
                  className="sticky left-0 px-4 py-3 text-sm text-gray-800 bg-gray-200 z-15"
                  style={{
                    gridRow: rowIndex + 3,
                    gridColumn: "1",
                    height: "50px",
                  }}
                >
                  <div className="grid grid-cols-[80px_70px_60px] gap-2 items-center">
                    <span className="font-medium truncate">{classItem.title}</span>
                    {classItem.teacher ? (
                      <span className="text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded text-center truncate">
                        {classItem.teacher.name}
                      </span>
                    ) : (
                      <span className="text-xs text-center text-gray-400">-</span>
                    )}
                    {classItem.subject ? (
                      <span className="text-xs text-gray-600 bg-blue-50 px-2 py-0.5 rounded text-center truncate">
                        {classItem.subject.subject_name}
                      </span>
                    ) : (
                      <span className="text-xs text-center text-gray-400">-</span>
                    )}
                  </div>
                </div>
                {eventGroups.map((eventGroup, groupIndex) => {
                  const representativeEvent = eventGroup.reduce(
                    (earliest, current) =>
                      timeToMinutes(current.startTime) <
                      timeToMinutes(earliest.startTime)
                        ? current
                        : earliest
                  );

                  const position = getGridPosition(representativeEvent);
                  if (!position.gridColumn) return null;

                  const isStacked = eventGroup.length > 1;

                  return (
                    <div
                      key={`group-${classItem.id}-${groupIndex}`}
                      style={{
                        ...position,
                        gridRow: rowIndex + 3,
                        height: "50px",
                      }}
                      className="relative z-10 hover:z-20"
                    >
                      <Tooltip
                        content={renderTooltipContent(eventGroup)}
                        position="top"
                        delay={200}
                      >
                        <div className="relative z-50 w-full h-full">
                          {isStacked &&
                            eventGroup.slice(1).map((event, stackIndex) => (
                              <div
                                key={`stack-${event.id}`}
                                className="absolute rounded-lg text-white px-1.5 py-0.5 overflow-hidden whitespace-nowrap text-ellipsis text-xs leading-tight opacity-70 border-2 border-white shadow-lg"
                                style={{
                                  backgroundColor: event.color,
                                  width: "100%",
                                  height: "100%",
                                  top: `${(stackIndex + 1) * 2}px`,
                                  left: `${(stackIndex + 1) * 2}px`,
                                  zIndex: -(stackIndex + 1),
                                  boxShadow:
                                    "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                                }}
                              />
                            ))}

                          <div
                            className="relative rounded-lg my-0.5 text-white px-1.5 py-0.5 cursor-pointer transition-all duration-200 ease-in-out hover:shadow-xl hover:transform hover:-translate-y-px border-2 border-white shadow-md flex items-center gap-1"
                            style={{
                              backgroundColor: representativeEvent.color,
                              width: "100%",
                              height: "100%",
                              boxShadow:
                                "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 1px 2px 0 rgba(0, 0, 0, 0.05)",
                              textShadow: "0 1px 2px rgba(0, 0, 0, 0.3)",
                            }}
                          >
                            <span className="flex-1 overflow-hidden text-xs leading-tight pointer-events-none whitespace-nowrap text-ellipsis">
                              {isStacked
                                ? `${representativeEvent.title} +${
                                    eventGroup.length - 1
                                  }`
                                : representativeEvent.title}
                            </span>
                            <span
                              className="pointer-events-none text-[10px] px-1.5 py-0.5 rounded font-medium shrink-0"
                              style={{
                                backgroundColor: "rgba(255, 255, 255, 0.25)",
                                backdropFilter: "blur(4px)",
                              }}
                            >
                              {representativeEvent.type === "class" ? "수업" : "클리닉"}
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
    </div>
  );
}
