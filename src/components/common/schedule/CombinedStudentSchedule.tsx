"use client";

import Tooltip from "@/components/common/Tooltip";
import { getGrade } from "@/lib/utils";
import { getEventColor } from "@/lib/scheduleUtils";
import { useCombinedSchedule } from "@/queries/useCombinedSchedule";
import { ArrowUpDown, Calendar, Clock, Search } from "lucide-react";
import { Fragment, useMemo, useState } from "react";

// Helper function to convert time string "HH:mm" to minutes from midnight
const timeToMinutes = (time: string): number => {
  if (!time) return 0; // Return 0 for empty strings
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

// Helper function to format time as HH:MM (remove seconds if present)
const formatTime = (time: string): string => {
  if (!time) return "00:00"; // Return default time for empty strings
  const [hours, minutes] = time.split(":");
  return `${hours}:${minutes}`;
};

// 학년별 색상 함수 (초등: 초록, 중등: 노랑, 고등: 초록)
const getGradeColor = (grade: number) => {
  // 초등학교 (1-6학년): 초록 계열
  if (grade >= 1 && grade <= 6) {
    const colors = [
      { bg: "#e8f5e9", text: "#2e7d32", badge: "#c8e6c9" }, // 1학년 - 매우 연한 초록
      { bg: "#dcedc8", text: "#558b2f", badge: "#aed581" }, // 2학년
      { bg: "#c5e1a5", text: "#689f38", badge: "#9ccc65" }, // 3학년
      { bg: "#aed581", text: "#7cb342", badge: "#8bc34a" }, // 4학년
      { bg: "#9ccc65", text: "#689f38", badge: "#7cb342" }, // 5학년
      { bg: "#8bc34a", text: "#558b2f", badge: "#689f38" }, // 6학년 - 진한 초록
    ];
    return colors[grade - 1];
  }

  // 중학교 (7-9학년): 붉은색 계열
  if (grade >= 7 && grade <= 9) {
    const colors = [
      { bg: "#ffcdd2", text: "#c62828", badge: "#ef9a9a" }, // 1학년 - 연한 붉은색
      { bg: "#ef9a9a", text: "#b71c1c", badge: "#e57373" }, // 2학년
      { bg: "#e57373", text: "#c62828", badge: "#ef5350" }, // 3학년 - 진한 붉은색
    ];
    return colors[grade - 7];
  }

  // 고등학교 (10-12학년): 초록 계열 (초등보다 진함)
  if (grade >= 10 && grade <= 12) {
    const colors = [
      { bg: "#a5d6a7", text: "#388e3c", badge: "#81c784" }, // 1학년
      { bg: "#81c784", text: "#2e7d32", badge: "#66bb6a" }, // 2학년
      { bg: "#66bb6a", text: "#1b5e20", badge: "#4caf50" }, // 3학년 - 진한 초록
    ];
    return colors[grade - 10];
  }

  // 기본값
  return { bg: "#e0e0e0", text: "#424242", badge: "#bdbdbd" };
};

// Represents a single event on the timeline
interface TimelineEvent {
  id: string;
  title: string;
  startTime: string; // Non-null since we filter out null times
  endTime: string; // Non-null since we filter out null times
  dayOfWeek: number; // 0 for Mon, 1 for Tue, ..., 6 for Sun
  color: string;
  type: "class" | "schedule";
}

export default function CombinedStudentSchedule() {
  // Combined schedule API에서 모든 데이터 한번에 가져오기
  const { data: studentsWithSchedules = [], isLoading } = useCombinedSchedule();

  console.log('🚀 [DEBUG] Combined schedule data loaded:', studentsWithSchedules.length);
  console.log('📦 [DEBUG] Students with schedules:', studentsWithSchedules);

  // 검색어 상태
  const [searchQuery, setSearchQuery] = useState("");

  // 정렬 상태
  type SortField = "name" | "school" | "grade";
  type SortOrder = "asc" | "desc";
  const [sortField, setSortField] = useState<SortField>("grade");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

  // 선택된 학생들 상태
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);

  // 학생 데이터가 로드되면 전체 선택으로 초기화
  useMemo(() => {
    if (studentsWithSchedules.length > 0 && selectedStudents.length === 0) {
      setSelectedStudents(studentsWithSchedules.map((s) => s.id));
    }
  }, [studentsWithSchedules, selectedStudents.length]);

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
    console.log('\n\n🚀 [DEBUG] ========== PROCESSING STUDENT DATA ==========');
    console.log('📊 [DEBUG] Students with schedules:', studentsWithSchedules.length);
    console.log('================================================\n');

    const filteredStudents = studentsWithSchedules
      .filter((s) => {
        // 선택된 학생만
        if (!selectedStudents.includes(s.id)) return false;

        // 검색어 필터링
        if (searchQuery) {
          const query = searchQuery.toLowerCase();

          // 학생 이름 검색
          if (s.name.toLowerCase().includes(query)) return true;

          // 학교 검색
          if (s.school && s.school.name.toLowerCase().includes(query)) return true;

          // 수업명 검색
          const hasMatchingClass = s.class_students.some(
            (cs) => cs.class && cs.class.title.toLowerCase().includes(query)
          );
          if (hasMatchingClass) return true;

          return false;
        }

        return true;
      })
      .map((student) => {
        console.log(`\n👤 [DEBUG] Processing student: ${student.name} (${student.id})`);
        console.log(`📚 [DEBUG] Class students:`, student.class_students.length);
        console.log(`📅 [DEBUG] Student schedules:`, student.student_schedules.length);

        // 수업 이벤트 생성
        const classEvents: TimelineEvent[] = student.class_students
          .flatMap((classStudent, index) => {
            console.log(`\n  📖 [DEBUG] Processing class_student ${index + 1}/${student.class_students.length}`);

            if (!classStudent.class) {
              console.warn(`  ⚠️ [DEBUG] Class not found for class_student:`, classStudent.id);
              return [];
            }

            const classInfo = classStudent.class;
            console.log(`  ✅ [DEBUG] Class: ${classInfo.title}`);
            console.log(`  🎯 [DEBUG] Student compositions:`, classStudent.student_compositions.length);

            // student_compositions를 통해 시간표 생성
            const events = classStudent.student_compositions
              .filter((sc) => sc.composition !== null)
              .map((sc) => {
                const composition = sc.composition!;
                console.log(`    📅 [DEBUG] Creating event for composition:`, composition);

                // 과목명 기반 색상 결정
                const subjectName = classInfo.subject?.subject_name;
                const eventColor = getEventColor(subjectName, false);

                return {
                  id: `class-${classInfo.id}-${composition.id}`,
                  title: classInfo.title,
                  startTime: composition.start_time,
                  endTime: composition.end_time,
                  dayOfWeek: composition.day_of_week,
                  color: eventColor,
                  type: "class" as const,
                };
              });

            console.log(`  ✅ [DEBUG] Created ${events.length} events for ${classInfo.title}`);
            return events;
          });

        console.log(`🎉 [DEBUG] Total class events for ${student.name}:`, classEvents.length);

        // 개인 일정 이벤트 생성 (회색으로 표시)
        const personalEvents: TimelineEvent[] = student.student_schedules.map((ss) => ({
          id: `schedule-${ss.id}`,
          title: ss.title,
          startTime: ss.start_time,
          endTime: ss.end_time,
          dayOfWeek: ss.day_of_week,
          color: getEventColor(null, true), // 개인 일정은 회색
          type: "schedule" as const,
        }));

        console.log(`📅 [DEBUG] Personal events for ${student.name}:`, personalEvents.length);

        const allEvents = [...classEvents, ...personalEvents];
        console.log(`🎊 [DEBUG] Total events for ${student.name}:`, allEvents.length);
        console.log(`-------------------------------------------\n`);

        return {
          ...student,
          events: allEvents,
        };
      });

    // 정렬 적용
    const sortedStudents = [...filteredStudents].sort((a, b) => {
      let compareValue = 0;

      switch (sortField) {
        case "name":
          compareValue = a.name.localeCompare(b.name, "ko-KR");
          break;
        case "school":
          const schoolA = a.school?.name || "";
          const schoolB = b.school?.name || "";
          compareValue = schoolA.localeCompare(schoolB, "ko-KR");
          break;
        case "grade":
          // 학년으로 먼저 정렬
          const gradeA = a.grade || 0;
          const gradeB = b.grade || 0;
          compareValue = gradeA - gradeB;

          // 학년이 같으면 학교로 정렬
          if (compareValue === 0) {
            const schoolA = a.school?.name || "";
            const schoolB = b.school?.name || "";
            compareValue = schoolA.localeCompare(schoolB, "ko-KR");
          }
          break;
      }

      return sortOrder === "asc" ? compareValue : -compareValue;
    });

    return sortedStudents;
  }, [
    selectedStudents,
    studentsWithSchedules,
    searchQuery,
    sortField,
    sortOrder,
  ]);

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
          <div className="mb-2 text-base font-bold text-white">
            {event.title}
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

    // 다중 이벤트인 경우
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
              <div className="text-sm font-medium text-white">
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
              // 시작시간보다 30분 앞부터 시작
              const hour = day.startHour + hourIndex - 0.5;
              const displayHour = Math.ceil(hour); // 표시할 시간은 올림
              const hourSlot = currentSlot + hourIndex * 24; // 시작부터 바로 시작 (이미 30분 앞부터 계산됨)

              // 요일의 첫 번째 시간인지 확인 (더 두꺼운 선)
              const isFirstHour = hourIndex === 0;

              return (
                <div
                  key={`hour-${dayIndex}-${hourIndex}`}
                  className={`text-center text-xs py-1 text-gray-500 sticky z-20 ${
                    dayIndex % 2 === 0 ? "bg-gray-50" : "bg-gray-100"
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center w-full overflow-auto rounded-lg grow bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 border-b-2 rounded-full animate-spin border-primary-600"></div>
          <p className="text-gray-600">스케줄 데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // 같은 필드를 다시 클릭하면 정렬 순서 토글
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      // 다른 필드를 클릭하면 해당 필드로 오름차순 정렬
      setSortField(field);
      setSortOrder("asc");
    }
  };

  return (
    <div className="flex flex-col w-full h-full rounded-lg grow bg-gray-50">
      {/* 검색 및 정렬 바 */}
      <div className="p-4 bg-white border-b border-gray-200 rounded-t-lg">
        <div className="flex items-center gap-4">
          {/* 검색 */}
          <div className="relative flex-1">
            <Search className="absolute w-5 h-5 text-gray-400 -translate-y-1/2 left-3 top-1/2" />
            <input
              type="text"
              placeholder="학생 이름, 학교, 수업명으로 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* 정렬 버튼 */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-sm font-medium text-gray-600">정렬:</span>
            <button
              onClick={() => handleSort("name")}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                sortField === "name"
                  ? "bg-primary-100 text-primary-700 font-medium"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <span>이름</span>
              {sortField === "name" && <ArrowUpDown className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={() => handleSort("school")}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                sortField === "school"
                  ? "bg-primary-100 text-primary-700 font-medium"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <span>학교</span>
              {sortField === "school" && (
                <ArrowUpDown className="w-3.5 h-3.5" />
              )}
            </button>
            <button
              onClick={() => handleSort("grade")}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                sortField === "grade"
                  ? "bg-primary-100 text-primary-700 font-medium"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <span>학년</span>
              {sortField === "grade" && <ArrowUpDown className="w-3.5 h-3.5" />}
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
          {/* Timeline Header */}
          <div
            className="sticky top-0 left-0 z-30 bg-gray-200"
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
                      className={`${
                        dayIndex % 2 === 0 ? "bg-white" : "bg-gray-50"
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
                      className="bg-gray-200"
                      style={{
                        gridColumn: `${hourSlot}`,
                        gridRow: rowIndex + 3,
                        height: "100%",
                        width: "1px",
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
            const gradeColors = student.grade
              ? getGradeColor(student.grade)
              : { bg: "#e0e0e0", text: "#424242", badge: "#bdbdbd" };

            return (
              <Fragment key={student.id}>
                <div
                  className="sticky left-0 px-4 py-3 text-sm text-gray-800 bg-gray-200 z-15"
                  style={{ gridRow: rowIndex + 3, gridColumn: "1" }}
                >
                  <div className="grid grid-cols-[48px_70px_36px] gap-2 items-center">
                    <span className="font-medium truncate">{student.name}</span>
                    {student.school_id ? (
                      <span className="text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded text-center truncate">
                        {student.school?.name || "학교 정보 없음"}
                      </span>
                    ) : (
                      <span className="text-xs text-center text-gray-400">
                        -
                      </span>
                    )}
                    {student.grade ? (
                      <span
                        className="text-xs px-2 py-0.5 rounded text-center font-medium"
                        style={{
                          backgroundColor: gradeColors.bg,
                          color: gradeColors.text,
                        }}
                      >
                        {getGrade(student.grade, "half")}
                      </span>
                    ) : (
                      <span className="text-xs text-center text-gray-400">
                        -
                      </span>
                    )}
                  </div>
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
                        <div className="relative z-50 w-full h-full">
                          {/* 쌓인 효과를 위한 백그라운드 아이템들 */}
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

                          {/* 메인 아이템 */}
                          <div
                            className="relative rounded-lg my-0.5 text-white px-1.5 py-0.5 overflow-hidden whitespace-nowrap text-ellipsis text-xs leading-tight cursor-pointer transition-all duration-200 ease-in-out hover:shadow-xl hover:transform hover:-translate-y-px border-2 border-white shadow-md"
                            style={{
                              backgroundColor: representativeEvent.color,
                              width: "100%",
                              height: "100%",
                              boxShadow:
                                "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 1px 2px 0 rgba(0, 0, 0, 0.05)",
                              textShadow: "0 1px 2px rgba(0, 0, 0, 0.3)",
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
    </div>
  );
}
