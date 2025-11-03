"use client";

import { getSubjectColor } from "@/lib/scheduleUtils";
import { defaultScheduleConfig } from "@/lib/utils";
import { formatDisplayTime } from "@/lib/utils/time";
import { ClassBlock, EditMode, ScheduleConfig } from "@/types/schedule";
import { Check, Clock, Users, X } from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";

// 강의실 목록 (1강의실 ~ 10강의실)
const classrooms = Array.from({ length: 10 }, (_, i) => `${i + 1}강의실`);

// 요일별 라벨
const dayLabels = ["월", "화", "수", "목", "금", "토", "일"];

// 요일별 시간 설정 (0=월요일, 6=일요일)
const getDayTimeRange = (
  dayOfWeek: number
): { startHour: number; endHour: number } => {
  // 평일(월~금): 16시~22시
  if (dayOfWeek >= 0 && dayOfWeek <= 4) {
    return { startHour: 16, endHour: 22 };
  }
  // 주말(토~일): 10시~22시
  return { startHour: 10, endHour: 22 };
};

interface ClassroomScheduleProps {
  editMode?: EditMode;
  config?: ScheduleConfig;
  customBlocks?: ClassBlock[];
  onBlocksChange?: (blocks: ClassBlock[]) => void;
  onStudentClick?: (
    student: {
      id: string;
      name: string;
      grade: number | null;
      school: {
        id: string;
        name: string;
        level: string;
      } | null;
    },
    block: ClassBlock,
    isMultiSelect: boolean
  ) => void;
  onClassCardClick?: (block: ClassBlock) => void;
  selectedStudentKeys?: string[]; // "blockId-studentId" 형식
  initialScrollPosition?: {
    dayOfWeek: number;
    hour: number;
    minute: number;
  };
}

interface ClassModalProps {
  block: ClassBlock | null;
  editMode: EditMode;
  isOpen: boolean;
  onClose: () => void;
  onSave: (blockId: string, updatedData: Partial<ClassBlock>) => void;
}

function ClassModal({
  block,
  editMode,
  isOpen,
  onClose,
  onSave,
}: ClassModalProps) {
  const [editData, setEditData] = useState({
    title: block?.title || "",
    teacherName: block?.teacherName || "",
    room: block?.room || "",
    subject: block?.subject || "",
    startTime: block?.startTime || "",
    endTime: block?.endTime || "",
  });

  React.useEffect(() => {
    if (block) {
      setEditData({
        title: block.title,
        teacherName: block.teacherName,
        room: block.room || "",
        subject: block.subject,
        startTime: block.startTime,
        endTime: block.endTime,
      });
    }
  }, [block]);

  if (!isOpen || !block) return null;

  const canEdit = editMode === "admin" || editMode === "edit";

  const handleSave = () => {
    onSave(block.id, editData);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 text-[#2d2d2d]"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md p-6 mx-4 border-0 flat-card rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-6 text-xl font-semibold text-gray-800">수업 정보</h2>

        <div className="space-y-4">
          {canEdit ? (
            <>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  수업명
                </label>
                <input
                  type="text"
                  value={editData.title}
                  onChange={(e) =>
                    setEditData({ ...editData, title: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  과목
                </label>
                <input
                  type="text"
                  value={editData.subject}
                  onChange={(e) =>
                    setEditData({ ...editData, subject: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  강사명
                </label>
                <input
                  type="text"
                  value={editData.teacherName}
                  onChange={(e) =>
                    setEditData({ ...editData, teacherName: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  강의실
                </label>
                <input
                  type="text"
                  value={editData.room}
                  onChange={(e) =>
                    setEditData({ ...editData, room: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <span className="block text-sm font-medium text-gray-700">
                  수업명
                </span>
                <p className="mt-2 font-medium text-gray-800">{block.title}</p>
              </div>

              <div>
                <span className="block text-sm font-medium text-gray-700">
                  과목
                </span>
                <p className="mt-2 font-medium text-gray-800">
                  {block.subject}
                </p>
              </div>

              <div>
                <span className="block text-sm font-medium text-gray-700">
                  강사명
                </span>
                <p className="mt-2 font-medium text-gray-800">
                  {block.teacherName}
                </p>
              </div>

              <div>
                <span className="block text-sm font-medium text-gray-700">
                  강의실
                </span>
                <p className="mt-2 font-medium text-gray-800">
                  {block.room || "미정"}
                </p>
              </div>
            </>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="block text-sm font-medium text-gray-700">
                시간
              </span>
              <div className="flex items-center mt-2">
                <Clock className="w-4 h-4 mr-2 text-gray-500" />
                <span className="font-medium text-gray-800">
                  {formatDisplayTime(block.startTime)} ~{" "}
                  {formatDisplayTime(block.endTime)}
                </span>
              </div>
            </div>

            <div>
              <span className="block text-sm font-medium text-gray-700">
                학생 수
              </span>
              <div className="flex items-center mt-2">
                <Users className="w-4 h-4 mr-2 text-gray-500" />
                <span className="font-medium text-gray-800">
                  {block.studentCount}
                  {block.maxStudents && `/${block.maxStudents}`}
                </span>
              </div>
            </div>
          </div>

          {canEdit && (
            <div className="flex gap-3 pt-6 border-t border-gray-300">
              <button
                onClick={handleSave}
                className="flex items-center justify-center flex-1 gap-2 px-4 py-3 font-medium transition-all duration-200 flat-card rounded-xl hover:flat-pressed text-primary-600"
              >
                <Check className="w-4 h-4" />
                저장
              </button>
              <button
                onClick={onClose}
                className="flex items-center justify-center flex-1 gap-2 px-4 py-3 font-medium text-gray-600 transition-all duration-200 flat-card rounded-xl hover:flat-pressed"
              >
                <X className="w-4 h-4" />
                취소
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ClassroomSchedule({
  editMode = "view",
  config = defaultScheduleConfig,
  customBlocks,
  onBlocksChange,
  onStudentClick,
  onClassCardClick,
  selectedStudentKeys = [],
  initialScrollPosition,
}: ClassroomScheduleProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scheduleContainerRef = useRef<HTMLDivElement>(null);
  const headerContainerRef = useRef<HTMLDivElement>(null);

  const [classBlocks, setClassBlocks] = useState<ClassBlock[]>(
    () => customBlocks || []
  );
  const [modalBlock, setModalBlock] = useState<ClassBlock | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [containerWidth, setContainerWidth] = useState(1000);
  const [currentDayIndex, setCurrentDayIndex] = useState(0); // 현재 보이는 요일
  const [containerPosition, setContainerPosition] = useState({
    top: 0,
    left: 0,
  }); // 컨테이너 위치

  // 동적 설정
  const MIN_DAY_COLUMN_WIDTH = 240;
  const TIME_COLUMN_WIDTH = 120; // 플로팅 탭과 간격 확보를 위해 여백 증가
  const SLOT_HEIGHT = 40; // 10분당 40px
  const DAY_HEADER_HEIGHT = 60;
  const DAY_SPACING = 20;
  const DAY_TOP_PADDING = 20; // 각 요일 시작 부분 상단 여백

  // 표시할 강의실 수 계산
  const availableWidth = containerWidth - TIME_COLUMN_WIDTH;
  const visibleRooms = Math.min(
    10,
    Math.max(1, Math.floor(availableWidth / MIN_DAY_COLUMN_WIDTH))
  );
  const DAY_COLUMN_WIDTH = availableWidth / visibleRooms;

  // customBlocks가 변경되면 classBlocks 업데이트
  useEffect(() => {
    if (customBlocks) {
      setClassBlocks(customBlocks);
    }
  }, [customBlocks]);

  // 컨테이너 크기 및 위치 감지
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const updateSizeAndPosition = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setContainerWidth(containerRef.current.offsetWidth);
        setContainerPosition({ top: rect.top, left: rect.left });
      }
    };

    const debouncedUpdate = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(updateSizeAndPosition, 100);
    };

    updateSizeAndPosition();
    window.addEventListener("resize", debouncedUpdate);
    window.addEventListener("scroll", debouncedUpdate, true);
    return () => {
      window.removeEventListener("resize", debouncedUpdate);
      window.removeEventListener("scroll", debouncedUpdate, true);
      clearTimeout(timeoutId);
    };
  }, []);

  // 각 요일별 높이 및 시작 Y 위치 계산
  const dayStartY = React.useMemo(() => {
    const dayHeights = dayLabels.map((_, dayIndex) => {
      const { startHour, endHour } = getDayTimeRange(dayIndex);
      const totalHours = endHour - startHour;
      const totalMinutes = totalHours * 60;
      const totalSlots = totalMinutes / config.timeSlotMinutes;
      return {
        dayOfWeek: dayIndex,
        startHour,
        endHour,
        height: totalSlots * SLOT_HEIGHT,
        headerHeight: DAY_HEADER_HEIGHT,
        topPadding: DAY_TOP_PADDING,
      };
    });

    let cumulativeY = 0;
    return dayHeights.map((day) => {
      const startY = cumulativeY;
      cumulativeY +=
        day.headerHeight + day.topPadding + day.height + DAY_SPACING;
      return {
        ...day,
        startY,
        endY: cumulativeY - DAY_SPACING,
      };
    });
  }, [
    config.timeSlotMinutes,
    SLOT_HEIGHT,
    DAY_HEADER_HEIGHT,
    DAY_SPACING,
    DAY_TOP_PADDING,
  ]);

  const totalHeight = dayStartY[dayStartY.length - 1]?.endY || 0;

  // 시간 문자열을 분으로 변환
  const parseTime = useCallback((timeStr: string): number => {
    const [hours, minutes] = timeStr.split(":").map(Number);
    return hours * 60 + minutes;
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

  // 스크롤 이벤트 핸들러 - 현재 보이는 요일 추적
  const isProgrammaticScroll = useRef(false);
  useEffect(() => {
    const container = scheduleContainerRef.current;
    if (!container || dayStartY.length === 0) return;

    const handleScroll = () => {
      // 프로그래매틱 스크롤 중에는 요일 인덱스 업데이트하지 않음
      if (isProgrammaticScroll.current) return;

      const scrollTop = container.scrollTop;

      // 현재 스크롤 위치에 해당하는 요일 찾기
      for (let i = dayStartY.length - 1; i >= 0; i--) {
        if (scrollTop >= dayStartY[i].startY) {
          setCurrentDayIndex(i);
          break;
        }
      }
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [dayStartY]);

  // 초기 스크롤 위치 설정 (최초 마운트 시에만)
  const hasScrolled = useRef(false);
  useEffect(() => {
    if (
      !hasScrolled.current &&
      initialScrollPosition &&
      scheduleContainerRef.current &&
      dayStartY.length > 0
    ) {
      const { dayOfWeek, hour, minute } = initialScrollPosition;
      const container = scheduleContainerRef.current;

      console.log("초기 스크롤 시도:", {
        dayOfWeek,
        hour,
        minute,
        dayStartYLength: dayStartY.length,
      });
      console.log(
        "dayStartY 정보:",
        dayStartY.map((d) => ({ dayOfWeek: d.dayOfWeek, startY: d.startY }))
      );

      const todayInfo = dayStartY.find((d) => d.dayOfWeek === dayOfWeek);
      if (!todayInfo) {
        console.error("todayInfo를 찾을 수 없음:", dayOfWeek);
        return;
      }

      console.log("찾은 todayInfo:", todayInfo);

      const { startHour, endHour, startY, headerHeight, topPadding } =
        todayInfo;
      const totalMinutes = hour * 60 + minute;
      const dayStartMinutes = startHour * 60;
      const dayEndMinutes = endHour * 60;

      // 시간이 시간표 범위를 벗어나는 경우 처리
      let scrollY;
      if (totalMinutes < dayStartMinutes) {
        // 시작 시간 이전이면 해당 요일의 시작 위치로
        scrollY = startY;
        console.log("시작 시간 이전 -> 요일 시작 위치로 스크롤");
      } else if (totalMinutes >= dayEndMinutes) {
        // 종료 시간 이후면 해당 요일의 시작 위치로
        scrollY = startY;
        console.log("종료 시간 이후 -> 요일 시작 위치로 스크롤");
      } else {
        // 정상 범위 내
        scrollY =
          startY +
          headerHeight +
          topPadding +
          ((totalMinutes - dayStartMinutes) / config.timeSlotMinutes) *
            SLOT_HEIGHT;
      }

      console.log("계산된 스크롤 위치:", {
        scrollY,
        startY,
        headerHeight,
        topPadding,
        hour,
        startHour,
        endHour,
      });

      // 약간의 딜레이를 주어 레이아웃이 완전히 렌더링된 후 스크롤
      setTimeout(() => {
        isProgrammaticScroll.current = true;
        container.scrollLeft = 0;
        container.scrollTop = scrollY;
        setCurrentDayIndex(dayOfWeek);
        hasScrolled.current = true;
        console.log("스크롤 완료:", {
          scrollTop: container.scrollTop,
          currentDayIndex: dayOfWeek,
        });

        // 스크롤이 즉시 완료되므로 짧은 시간 후 플래그 해제
        setTimeout(() => {
          isProgrammaticScroll.current = false;
        }, 100);
      }, 100);
    }
  }, [initialScrollPosition, dayStartY, config.timeSlotMinutes, SLOT_HEIGHT]);

  // 요일 네비게이션 클릭 핸들러
  const handleDayNavClick = useCallback(
    (dayIndex: number) => {
      if (!scheduleContainerRef.current || dayStartY.length === 0) return;

      const container = scheduleContainerRef.current;
      const dayInfo = dayStartY[dayIndex];

      if (dayInfo) {
        // 프로그래매틱 스크롤 플래그 설정
        isProgrammaticScroll.current = true;

        // 클릭 시 즉시 활성 상태 변경
        setCurrentDayIndex(dayIndex);

        // 현재 스크롤 위치와 목표 위치 간의 거리 계산
        const currentScrollTop = container.scrollTop;
        const targetScrollTop = dayInfo.startY;
        const distance = Math.abs(targetScrollTop - currentScrollTop);

        // 거리에 따른 애니메이션 시간 추정 (최소 300ms, 최대 1500ms)
        // smooth 스크롤은 대략 1px당 1ms 정도 소요
        const estimatedDuration = Math.min(Math.max(distance, 300), 1500);

        container.scrollTo({
          top: dayInfo.startY,
          behavior: "smooth",
        });

        // 추정 시간 + 여유(200ms) 후 플래그 해제
        setTimeout(() => {
          isProgrammaticScroll.current = false;
        }, estimatedDuration + 200);
      }
    },
    [dayStartY]
  );

  // 모달 핸들러
  const handleBlockClick = useCallback(
    (block: ClassBlock) => {
      if (onClassCardClick) {
        onClassCardClick(block);
      } else if (editMode === "admin" || editMode === "edit") {
        setModalBlock(block);
        setIsModalOpen(true);
      }
    },
    [editMode, onClassCardClick]
  );

  const handleStudentBlockClick = useCallback(
    (
      student: {
        id: string;
        name: string;
        grade: number | null;
        school: { id: string; name: string; level: string } | null;
      },
      block: ClassBlock,
      e: React.MouseEvent
    ) => {
      if (onStudentClick) {
        // Ctrl (Windows/Linux) 또는 Cmd (Mac) 키 감지
        const isMultiSelect = e.ctrlKey || e.metaKey;
        onStudentClick(student, block, isMultiSelect);
      }
    },
    [onStudentClick]
  );

  const handleSaveBlock = useCallback(
    (blockId: string, updatedData: Partial<ClassBlock>) => {
      const updatedBlocks = classBlocks.map((b) =>
        b.id === blockId ? { ...b, ...updatedData } : b
      );
      setClassBlocks(updatedBlocks);
      onBlocksChange?.(updatedBlocks);
    },
    [classBlocks, onBlocksChange]
  );

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden bg-white"
    >
      {/* 요일 네비게이션 바 (플로팅 스타일 - fixed) */}
      <div
        className="fixed z-50 flex flex-col gap-2 p-2 bg-white border border-gray-200 shadow-lg rounded-2xl"
        style={{
          top: containerPosition.top + 16,
          left: 20,
        }}
      >
        {dayLabels.map((day, idx) => (
          <button
            key={idx}
            onClick={() => handleDayNavClick(idx)}
            className={`w-12 h-12 flex items-center justify-center text-sm font-bold transition-all rounded-xl ${
              currentDayIndex === idx
                ? "bg-primary-600 text-white shadow-md scale-105"
                : "text-gray-600 hover:bg-gray-100 hover:text-primary-600"
            }`}
          >
            {day}
          </button>
        ))}
      </div>

      {/* 헤더 영역 (고정, 가로 스크롤만) */}
      <div className="absolute top-0 left-0 right-0 z-20 flex bg-white border-b border-gray-200">
        {/* 왼쪽 시간 칼럼 헤더 (빈 공간) */}
        <div
          className="flex-shrink-0 border-r border-gray-200 bg-gray-50"
          style={{ width: TIME_COLUMN_WIDTH }}
        />

        {/* 강의실 헤더 스크롤 컨테이너 */}
        <div
          ref={headerContainerRef}
          className="flex-1 overflow-x-auto overflow-y-hidden [&::-webkit-scrollbar]:hidden"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          <div
            className="flex bg-gray-50"
            style={{ width: DAY_COLUMN_WIDTH * 10 }}
          >
            {classrooms.map((room, idx) => (
              <div
                key={room}
                className="flex items-center justify-center flex-shrink-0 py-4 text-sm font-semibold text-gray-700 border-r border-gray-200"
                style={{ width: DAY_COLUMN_WIDTH }}
              >
                {room}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 스크롤 가능한 영역 */}
      <div
        ref={scheduleContainerRef}
        className="absolute inset-0 overflow-auto"
        style={{ paddingTop: 48 }}
      >
        <div className="relative flex">
          {/* 시간 칼럼 (세로 스크롤만, 가로 고정) */}
          <div
            className="sticky left-0 z-10 flex-shrink-0 bg-white border-r border-gray-200"
            style={{ width: TIME_COLUMN_WIDTH, height: totalHeight }}
          >
            {dayStartY.map((dayInfo) => {
              const {
                dayOfWeek,
                startHour,
                endHour,
                startY,
                headerHeight,
                topPadding,
                height,
              } = dayInfo;
              const timeSlots = [];

              // 시간 슬롯 생성
              for (let hour = startHour; hour <= endHour; hour++) {
                timeSlots.push(hour);
              }

              return (
                <div
                  key={dayOfWeek}
                  className="absolute left-0"
                  style={{
                    top: startY,
                    width: TIME_COLUMN_WIDTH,
                    height: headerHeight + topPadding + height,
                  }}
                >
                  {/* 요일 헤더 */}
                  <div
                    className="flex items-center justify-center font-bold text-gray-700 bg-gray-50"
                    style={{ height: headerHeight }}
                  ></div>

                  {/* 상단 여백 */}
                  <div style={{ height: topPadding }} />

                  {/* 시간 레이블 */}
                  <div className="relative" style={{ height }}>
                    {timeSlots.map((hour) => {
                      const minutesFromDayStart = (hour - startHour) * 60;
                      const y =
                        (minutesFromDayStart / config.timeSlotMinutes) *
                        SLOT_HEIGHT;

                      return (
                        <div
                          key={hour}
                          className="absolute right-0 pr-3 text-xs text-right text-gray-600"
                          style={{ top: y - 6 }}
                        >
                          {hour}:00
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* 스케줄 그리드 영역 */}
          <div
            className="relative flex-1"
            style={{
              width: DAY_COLUMN_WIDTH * 10,
              height: totalHeight,
            }}
          >
            {/* 배경 그리드 */}
            {dayStartY.map((dayInfo) => {
              const {
                dayOfWeek,
                startHour,
                endHour,
                startY,
                headerHeight,
                topPadding,
                height,
              } = dayInfo;
              const totalSlots = Math.floor(height / SLOT_HEIGHT);

              return (
                <div key={dayOfWeek}>
                  {/* 요일 헤더 배경 */}
                  <div
                    className="absolute left-0 bg-gray-50"
                    style={{
                      top: startY,
                      width: DAY_COLUMN_WIDTH * 10,
                      height: headerHeight,
                    }}
                  />

                  {/* 상단 여백 */}
                  <div
                    className="absolute left-0"
                    style={{
                      top: startY + headerHeight,
                      width: DAY_COLUMN_WIDTH * 10,
                      height: topPadding,
                    }}
                  />

                  {/* 그리드 라인 */}
                  <div
                    className="absolute left-0"
                    style={{
                      top: startY + headerHeight + topPadding,
                      width: DAY_COLUMN_WIDTH * 10,
                      height,
                    }}
                  >
                    {/* 세로 라인 (강의실 구분) */}
                    {classrooms.map((_, idx) => (
                      <div
                        key={`v-${idx}`}
                        className="absolute top-0 bottom-0 border-r border-gray-200"
                        style={{ left: idx * DAY_COLUMN_WIDTH }}
                      />
                    ))}

                    {/* 가로 라인 (1시간 간격) */}
                    {Array.from({ length: endHour - startHour + 1 }).map(
                      (_, idx) => (
                        <div
                          key={`h-${idx}`}
                          className="absolute left-0 right-0 border-t border-gray-200"
                          style={{ top: idx * SLOT_HEIGHT * 6 }} // 1시간 = 6개의 10분 슬롯
                        />
                      )
                    )}
                  </div>
                </div>
              );
            })}

            {/* 수업 블록 */}
            {classBlocks.map((block) => {
              const dayInfo = dayStartY.find(
                (d) => d.dayOfWeek === block.dayOfWeek
              );
              if (!dayInfo) return null;

              const { startHour, startY, headerHeight, topPadding } = dayInfo;
              const startMinutes = parseTime(block.startTime);
              const endMinutes = parseTime(block.endTime);

              // 강의실 번호 추출
              let roomIndex = 0;
              if (block.room) {
                const roomMatch = block.room.match(/^(\d+)/);
                if (roomMatch) {
                  roomIndex = parseInt(roomMatch[1], 10) - 1;
                }
              }

              const x = roomIndex * DAY_COLUMN_WIDTH;
              const dayStartMinutes = startHour * 60;
              const y =
                startY +
                headerHeight +
                topPadding +
                ((startMinutes - dayStartMinutes) / config.timeSlotMinutes) *
                  SLOT_HEIGHT;
              const width = DAY_COLUMN_WIDTH - 4;
              const height =
                ((endMinutes - startMinutes) / config.timeSlotMinutes) *
                SLOT_HEIGHT - 4;

              // 학생 블록 레이아웃
              const studentsPerRow = 3; // 오른쪽 3열
              const schoolColumnWidth = (width - 20) / 4; // 왼쪽 1열 (전체의 1/4)
              const studentBlockWidth = ((width - 20) * 3) / 4 / studentsPerRow; // 오른쪽 3/4를 3등분
              const studentBlockHeight = 33; // 22 * 1.5
              const studentBlockGap = 4;

              // scheduleUtils의 getSubjectColor 사용 (탁한 색상 테마)
              const blockColor = getSubjectColor(
                block.subject,
                false, // isPersonal
                true // isFrontTime
              );

              // 학교/학년별로 학생 그룹화
              const studentsBySchoolGrade = new Map<
                string,
                {
                  displayText: string;
                  sortKey: number; // 학년 우선 정렬용
                  students: Array<{
                    id: string;
                    name: string;
                    grade: number | null;
                    school: {
                      id: string;
                      name: string;
                      level: string;
                    } | null;
                  }>;
                }
              >();

              block.students?.forEach((student) => {
                if (!student.school || !student.grade) return;

                const schoolName = student.school.name.replace(
                  /중학교|고등학교/g,
                  ""
                );
                const gradeNum = student.grade;
                const displayGrade =
                  gradeNum <= 6
                    ? gradeNum
                    : gradeNum <= 9
                    ? gradeNum - 6
                    : gradeNum - 9;
                const key = `${schoolName}${displayGrade}`;

                if (!studentsBySchoolGrade.has(key)) {
                  studentsBySchoolGrade.set(key, {
                    displayText: key,
                    sortKey: gradeNum, // 원본 학년으로 정렬
                    students: [],
                  });
                }
                studentsBySchoolGrade.get(key)!.students.push(student);
              });

              // 학년 우선 정렬 (낮은 학년부터)
              const sortedSchoolGradeEntries = Array.from(
                studentsBySchoolGrade.entries()
              ).sort((a, b) => {
                // 학년으로 먼저 정렬
                if (a[1].sortKey !== b[1].sortKey) {
                  return a[1].sortKey - b[1].sortKey;
                }
                // 학년이 같으면 학교명으로 정렬
                return a[1].displayText.localeCompare(b[1].displayText);
              });

              return (
                <div
                  key={block.id}
                  className="absolute transition-shadow rounded-lg shadow-sm cursor-pointer hover:shadow-md"
                  style={{
                    left: x + 2,
                    top: y + 2,
                    width,
                    height,
                    backgroundColor: blockColor,
                  }}
                  onClick={() => handleBlockClick(block)}
                >
                  {/* 수업 정보 */}
                  <div className="px-3 py-2 text-white">
                    <div className="text-xs font-bold truncate">
                      {block.title}
                    </div>
                    <div className="text-[10px] opacity-90 truncate">
                      {block.teacherName} • {block.subject}
                    </div>
                    <div className="text-[10px] opacity-75">
                      {formatDisplayTime(block.startTime)} ~{" "}
                      {formatDisplayTime(block.endTime)}
                    </div>
                  </div>

                  {/* 학생 블록들 - 학교/학년별 그룹화 */}
                  {block.students && block.students.length > 0 && (
                    <div className="px-2 mt-1">
                      {sortedSchoolGradeEntries.map(
                        ([schoolGradeKey, groupData], groupIndex) => {
                          const studentsInGroup = groupData.students;
                          const rowHeight =
                            studentBlockHeight + studentBlockGap;
                          const groupTopOffset = 60 + groupIndex * rowHeight;

                          return (
                            <div key={schoolGradeKey}>
                              {/* 학교/학년 칩 (왼쪽) */}
                              <div
                                className="absolute flex items-center justify-center overflow-hidden rounded"
                                style={{
                                  left: 10,
                                  top: groupTopOffset,
                                  width: schoolColumnWidth - studentBlockGap,
                                  height: studentBlockHeight,
                                }}
                              >
                                {/* 텍스트 레이어 */}
                                <div
                                  className="relative text-xs font-bold truncate px-1 text-white"
                                  style={{
                                    textShadow:
                                      "0.5px 0.5px 1px rgba(0, 0, 0, 0.3)",
                                  }}
                                >
                                  {groupData.displayText}
                                </div>
                              </div>

                              {/* 해당 학교/학년의 학생들 (오른쪽) */}
                              {studentsInGroup.map((student, studentIndex) => {
                                const studentKey = `${block.id}-${student.id}`;
                                const isSelected =
                                  selectedStudentKeys.includes(studentKey);

                                return (
                                  <div
                                    key={studentKey}
                                    className="absolute transition-all rounded cursor-pointer group"
                                    style={{
                                      left:
                                        10 +
                                        schoolColumnWidth +
                                        studentIndex * studentBlockWidth,
                                      top: groupTopOffset,
                                      width:
                                        studentBlockWidth - studentBlockGap,
                                      height: studentBlockHeight,
                                      backgroundColor: isSelected
                                        ? "rgba(255, 255, 255, 0.2)"
                                        : "rgba(0, 0, 0, 0.2)",
                                      color: "#ffffff",
                                    }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleStudentBlockClick(
                                        student,
                                        block,
                                        e
                                      );
                                    }}
                                  >
                                    {/* 호버 배경 레이어 */}
                                    <div
                                      className="absolute inset-0 transition-opacity rounded opacity-0 pointer-events-none group-hover:opacity-100"
                                      style={{
                                        backgroundColor:
                                          "rgba(255, 255, 255, 0.1)",
                                      }}
                                    />
                                    <div className="relative flex items-center justify-center w-full h-full text-sm font-bold">
                                      {student.name.length > 4
                                        ? student.name.slice(0, 3) + "…"
                                        : student.name}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          );
                        }
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 모달 */}
      <ClassModal
        block={modalBlock}
        editMode={editMode}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveBlock}
      />
    </div>
  );
}
