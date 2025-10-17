"use client";

import Tooltip from "@/components/common/Tooltip";
import {
  useCreateExamPeriod,
  useDeleteExamPeriod,
  useExamPeriods,
  useUpdateExamPeriod,
} from "@/queries/useExamPeriods";
import { useSchools } from "@/queries/useSchools";
import { ExamPeriodWithSchool } from "@/services/client/examPeriodApi";
import {
  addMonths,
  differenceInDays,
  eachDayOfInterval,
  endOfMonth,
  format,
  isSameDay,
  isSameMonth,
  parseISO,
  startOfDay,
  startOfMonth,
  subMonths,
} from "date-fns";
import { ko } from "date-fns/locale";
import { Calendar, Pencil, Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import ExamPeriodModal, { ExamPeriodFormData } from "./ExamPeriodModal";

interface TimelinePeriod extends ExamPeriodWithSchool {
  startDate: Date;
  endDate: Date;
}

export default function ExamPeriodManagement() {
  const { data: schools = [], isLoading: schoolsLoading } = useSchools();
  const { data: examPeriods = [], isLoading: periodsLoading } =
    useExamPeriods();
  const createMutation = useCreateExamPeriod();
  const updateMutation = useUpdateExamPeriod();
  const deleteMutation = useDeleteExamPeriod();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingPeriod, setEditingPeriod] = useState<ExamPeriodWithSchool | null>(null);

  // Calculate 3-month range: 1 month before today + today's month + 2 months after
  const today = useMemo(() => startOfDay(new Date()), []);
  const oneMonthBefore = useMemo(() => subMonths(today, 1), [today]);
  const twoMonthsAfter = useMemo(() => addMonths(today, 2), [today]);

  // Get all days for the 3-month period starting from 1 month before today
  const threeMonthStart = useMemo(
    () => startOfMonth(oneMonthBefore),
    [oneMonthBefore]
  );
  const threeMonthEnd = useMemo(
    () => endOfMonth(twoMonthsAfter),
    [twoMonthsAfter]
  );
  const allDays = useMemo(
    () => eachDayOfInterval({ start: threeMonthStart, end: threeMonthEnd }),
    [threeMonthStart, threeMonthEnd]
  );

  // Group days by month
  const monthGroups = useMemo(() => {
    const uniqueMonths = Array.from(
      new Set(allDays.map((day) => format(day, "yyyy-MM")))
    ).map((monthStr) => {
      const [year, month] = monthStr.split("-");
      return new Date(parseInt(year), parseInt(month) - 1, 1);
    });

    return uniqueMonths.map((monthDate) => ({
      date: monthDate,
      days: allDays.filter((day) => isSameMonth(day, monthDate)),
      daysCount: allDays.filter((day) => isSameMonth(day, monthDate)).length,
    }));
  }, [allDays]);

  // Timeline metrics - CSS Grid 기반
  const timelineMetrics = useMemo(() => {
    const totalDays = allDays.length;
    const monthSlots = monthGroups.map((m) => m.daysCount);
    const monthStartSlot = monthSlots.map((_, i) =>
      monthSlots.slice(0, i).reduce((acc, val) => acc + val, 0)
    );

    return {
      totalDays,
      monthSlots,
      monthStartSlot,
    };
  }, [allDays, monthGroups]);

  // Get exam periods with grid positions
  const timelinePeriods = useMemo((): TimelinePeriod[] => {
    return examPeriods.map((period) => {
      const start = parseISO(period.start_date);
      const end = period.end_date ? parseISO(period.end_date) : start;

      return {
        ...period,
        startDate: start,
        endDate: end,
      };
    });
  }, [examPeriods]);

  // Calculate grid position for a period
  const getGridPosition = (period: TimelinePeriod) => {
    const daysSinceStart = differenceInDays(period.startDate, threeMonthStart);
    const daysSpan = differenceInDays(period.endDate, period.startDate) + 1;

    // Grid column: +2 for school name column
    const gridColumnStart = 2 + daysSinceStart;
    const gridColumnEnd = gridColumnStart + daysSpan;

    return {
      gridColumn: `${gridColumnStart} / ${gridColumnEnd}`,
    };
  };

  const handleModalSubmit = async (data: ExamPeriodFormData) => {
    try {
      if (editingPeriod) {
        await updateMutation.mutateAsync({
          id: editingPeriod.id,
          params: data,
        });
      } else {
        await createMutation.mutateAsync(data);
      }
      setShowCreateModal(false);
      setEditingPeriod(null);
    } catch (error) {
      console.error("Failed to save exam period:", error);

      // Parse error message and show user-friendly alert
      const errorMessage = error instanceof Error ? error.message : String(error);

      let userMessage = editingPeriod
        ? "내신 기간 수정에 실패했습니다"
        : "내신 기간 생성에 실패했습니다";

      // Check for specific validation errors
      if (errorMessage.includes("end_date must be after or equal to start_date")) {
        userMessage = "종료 날짜는 시작 날짜보다 이후여야 합니다.";
      } else if (errorMessage.includes("already exists")) {
        userMessage = "해당 학교의 동일한 학기/차수 내신 기간이 이미 존재합니다.";
      } else if (errorMessage.includes("start_date")) {
        userMessage = "시작 날짜가 올바르지 않습니다.";
      } else if (errorMessage.includes("end_date")) {
        userMessage = "종료 날짜가 올바르지 않습니다.";
      }

      alert(userMessage);
    }
  };

  const handleModalClose = () => {
    setShowCreateModal(false);
    setEditingPeriod(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("이 내신 기간을 삭제하시겠습니까?")) {
      return;
    }

    try {
      await deleteMutation.mutateAsync(id);
    } catch (error) {
      console.error("Failed to delete exam period:", error);
      alert("내신 기간 삭제에 실패했습니다");
    }
  };

  const startEdit = (period: ExamPeriodWithSchool) => {
    setEditingPeriod(period);
    setShowCreateModal(true);
  };

  // Group periods by school for row rendering - include ALL schools
  const schoolPeriods = useMemo(() => {
    // Start with all schools from the schools list
    const schoolMap = new Map<
      string,
      {
        school: { id: string; name: string } | null;
        periods: TimelinePeriod[];
      }
    >();

    // Initialize map with all schools (even those without periods)
    schools.forEach((school) => {
      schoolMap.set(school.id, {
        school: { id: school.id, name: school.name },
        periods: [],
      });
    });

    // Add periods to their respective schools
    timelinePeriods.forEach((period) => {
      const schoolId = period.school_id;
      if (schoolMap.has(schoolId)) {
        schoolMap.get(schoolId)!.periods.push(period);
      } else {
        // Handle case where period has a school not in the schools list
        schoolMap.set(schoolId, {
          school: period.schools,
          periods: [period],
        });
      }
    });

    return Array.from(schoolMap.values());
  }, [schools, timelinePeriods]);

  const renderTooltipContent = (period: TimelinePeriod) => {
    return (
      <div className="text-left">
        <div className="flex items-center gap-2 mb-2 text-base font-bold text-white">
          <span>{period.schools?.name}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-200">
          <Calendar className="w-4 h-4 text-blue-300" />
          <span>
            {format(period.startDate, "yyyy년 M월 d일", { locale: ko })}
            {period.end_date &&
              ` ~ ${format(period.endDate, "yyyy년 M월 d일", { locale: ko })}`}
          </span>
        </div>
      </div>
    );
  };

  const renderTimelineHeader = () => {
    return (
      <>
        {/* 월 헤더 */}
        {monthGroups.map((month, monthIndex) => {
          const monthStartSlot = 2 + timelineMetrics.monthStartSlot[monthIndex];

          return (
            <div
              key={`month-${monthIndex}`}
              className={`text-center text-sm py-2 font-semibold text-gray-800 sticky top-0 z-20 border-r border-gray-300 ${
                isSameMonth(month.date, today)
                  ? "bg-primary-100"
                  : "bg-gray-100"
              }`}
              style={{
                gridColumn: `${monthStartSlot} / span ${month.daysCount}`,
                gridRow: "1",
              }}
            >
              {format(month.date, "yyyy년 M월", { locale: ko })}
            </div>
          );
        })}

        {/* 일 헤더 */}
        {allDays.map((day, dayIndex) => {
          const isToday = isSameDay(day, today);
          const isWeekend = day.getDay() === 0 || day.getDay() === 6;

          return (
            <div
              key={`day-${dayIndex}`}
              className={`text-center text-xs py-1 sticky z-20 border-r border-gray-200 ${
                isToday
                  ? "bg-primary-200 text-primary-700 font-bold"
                  : isWeekend
                  ? "bg-gray-100 text-gray-600"
                  : "bg-gray-50 text-gray-600"
              }`}
              style={{
                gridColumn: `${2 + dayIndex}`,
                gridRow: "2",
                top: "36px",
              }}
            >
              {format(day, "d")}
            </div>
          );
        })}
      </>
    );
  };

  if (schoolsLoading || periodsLoading) {
    return <div className="p-6 text-gray-500">로딩 중...</div>;
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="flex items-center gap-2 text-xl font-semibold text-gray-900">
              <Calendar className="w-5 h-5" />
              내신기간 타임라인
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              학교별 내신 기간을 타임라인에서 확인하고 관리합니다
            </p>
          </div>
          <button
            onClick={() => {
              setEditingPeriod(null);
              setShowCreateModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition-colors rounded-lg bg-primary-600 hover:bg-primary-700"
          >
            <Plus className="w-4 h-4" />
            내신기간 추가
          </button>
        </div>
      </div>

      {/* Timeline Grid */}
      <div className="flex-1 overflow-auto">
        <div
          className="grid min-w-max"
          style={{
            gridTemplateColumns: `100px repeat(${timelineMetrics.totalDays}, 1fr)`,
          }}
        >
          {/* Header corner cell */}
          <div
            className="sticky top-0 left-0 z-30 bg-gray-100 border-b border-r border-gray-300"
            style={{ gridRow: "1 / 3", gridColumn: "1", width: "100px" }}
          ></div>

          {/* Timeline Header */}
          {renderTimelineHeader()}

          {/* Grid Background - days */}
          {schoolPeriods.map((schoolData, rowIndex) =>
            allDays.map((day, dayIndex) => {
              const isToday = isSameDay(day, today);
              const isWeekend = day.getDay() === 0 || day.getDay() === 6;

              return (
                <div
                  key={`grid-${schoolData.school?.id}-${dayIndex}`}
                  className={`border-r border-b ${
                    isToday
                      ? "bg-primary-50/30 border-gray-200/50"
                      : isWeekend
                      ? "bg-gray-50/30 border-gray-200/50"
                      : "bg-white/30 border-gray-200/50"
                  }`}
                  style={{
                    gridColumn: `${2 + dayIndex}`,
                    gridRow: rowIndex + 3,
                    height: "60px",
                    minWidth: "30px",
                  }}
                />
              );
            })
          )}

          {/* Today indicator line */}
          {allDays.findIndex((day) => isSameDay(day, today)) !== -1 && (
            <div
              className="pointer-events-none"
              style={{
                gridColumn: `${
                  2 + allDays.findIndex((day) => isSameDay(day, today))
                }`,
                gridRow: `3 / span ${schoolPeriods.length}`,
                borderLeft: "2px solid rgb(59 130 246)",
                zIndex: 15,
              }}
            />
          )}

          {/* School Rows */}
          {schoolPeriods.map((schoolData, rowIndex) => (
            <div
              key={schoolData.school?.id || rowIndex}
              className="sticky left-0 z-20 px-2 py-3 text-sm font-medium text-gray-800 bg-gray-100 border-b border-r border-gray-300"
              style={{
                gridRow: rowIndex + 3,
                gridColumn: "1",
                height: "60px",
                width: "100px",
              }}
            >
              <div className="flex items-center justify-center h-full text-center">
                {schoolData.school?.name || "알 수 없음"}
              </div>
            </div>
          ))}

          {/* Exam Period Blocks */}
          {schoolPeriods.map((schoolData, rowIndex) =>
            schoolData.periods.map((period) => {
              const position = getGridPosition(period);

              return (
                <div
                  key={period.id}
                  style={{
                    ...position,
                    gridRow: rowIndex + 3,
                    height: "60px",
                  }}
                  className="relative z-10 p-1 hover:z-20"
                >
                  <Tooltip
                    content={renderTooltipContent(period)}
                    position="top"
                    delay={200}
                  >
                    <div className="relative w-full h-full group">
                      <div className="relative h-full transition-all border-2 border-white rounded-lg shadow-md cursor-pointer bg-gradient-to-r from-primary-500 to-primary-600 hover:shadow-lg group-hover:scale-105">
                        <div className="absolute inset-0 flex items-center justify-between px-3 overflow-hidden text-white">
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-semibold truncate">
                              {period.schools?.name}
                            </div>
                            <div className="text-[10px] opacity-90 truncate">
                              {format(period.startDate, "M/d", { locale: ko })}
                              {period.end_date &&
                                ` ~ ${format(period.endDate, "M/d", {
                                  locale: ko,
                                })}`}
                            </div>
                          </div>
                          <div className="flex items-center gap-1 ml-2 transition-opacity opacity-0 group-hover:opacity-100 shrink-0">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                startEdit(period);
                              }}
                              className="p-1 transition-colors rounded hover:bg-white/20"
                            >
                              <Pencil className="w-3 h-3" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(period.id);
                              }}
                              className="p-1 transition-colors rounded hover:bg-white/20"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Tooltip>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Create/Edit Modal */}
      <ExamPeriodModal
        isOpen={showCreateModal}
        onClose={handleModalClose}
        onSubmit={handleModalSubmit}
        editingPeriod={editingPeriod}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
}
