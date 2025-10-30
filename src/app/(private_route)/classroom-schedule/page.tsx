"use client";

import { PageHeader, PageLayout } from "@/components/common/layout";
import ClassroomScheduleCanvas from "@/components/common/schedule/ClassroomScheduleCanvas";
import ExceptionModal, {
  ExceptionType,
} from "@/components/classroom-schedule/ExceptionModal";
import { DAYS_OF_WEEK } from "@/constants/schedule";
import { useClassroomDragAndDrop } from "@/hooks/useClassroomDragAndDrop";
import { useClassroomSchedule } from "@/queries/useCombinedSchedule";
import {
  useCreateCompositionsException,
  // useCreateCompositionStudentsException, // 향후 학생 예외 구현 시 사용
} from "@/queries/useExceptions";
import { ClassBlock } from "@/types/schedule";
import { Building2, Loader2 } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { format, startOfWeek, endOfWeek, addDays } from "date-fns";

export default function ClassroomSchedulePage() {
  const { data: classes, isLoading, error } = useClassroomSchedule();

  // 오늘 요일 (JavaScript의 getDay(): 0=일요일, 1=월요일, ..., 6=토요일)
  // DB의 day_of_week: 0=월요일, 1=화요일, ..., 6=일요일
  // JavaScript getDay를 DB 형식으로 변환: (getDay() + 6) % 7
  const today = (new Date().getDay() + 6) % 7; // DB 형식으로 변환
  const [selectedDayOfWeek, setSelectedDayOfWeek] = useState<number>(today);

  // 향후 예외 시각화 구현 시 사용 예정
  // const weekRange = useMemo(() => {
  //   const now = new Date();
  //   const start = startOfWeek(now, { weekStartsOn: 1 });
  //   const end = endOfWeek(now, { weekStartsOn: 1 });
  //   return {
  //     startDate: format(start, "yyyy-MM-dd"),
  //     endDate: format(end, "yyyy-MM-dd"),
  //   };
  // }, []);
  //
  // const { data: exceptions } = useCompositionsExceptions({
  //   startDate: weekRange.startDate,
  //   endDate: weekRange.endDate,
  // });

  // 드래그 앤 드롭 hook
  const { dragState, handleClassDragStart, handleStudentDragStart, handleDrop, resetDrag } =
    useClassroomDragAndDrop();

  // 예외 생성 mutations
  const createClassException = useCreateCompositionsException();
  // const createStudentException = useCreateCompositionStudentsException(); // 향후 학생 예외 구현 시 사용

  // 모달 상태
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    dropResult: {
      targetRoom: number;
      targetTime: string;
      changedRoom: boolean;
      changedTime: boolean;
    } | null;
  }>({
    isOpen: false,
    dropResult: null,
  });

  // 드롭 처리 핸들러
  const onDrop = useCallback(
    (targetRoom: number, targetTime: string) => {
      const dropResult = handleDrop(targetRoom, targetTime);
      if (dropResult) {
        // 변경사항이 있으면 모달 표시
        setModalState({
          isOpen: true,
          dropResult,
        });
      }
    },
    [handleDrop]
  );

  // 모달 확인 핸들러
  const handleModalConfirm = useCallback(
    async (type: ExceptionType, reason?: string) => {
      if (!modalState.dropResult || !dragState.draggedBlock) {
        setModalState({ isOpen: false, dropResult: null });
        resetDrag();
        return;
      }

      const { targetRoom, targetTime } = modalState.dropResult;
      const targetRoomNumber = targetRoom + 1; // 0-based to 1-based

      // 선택된 날짜 계산 (선택된 요일 기준)
      const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
      const targetDate = format(
        addDays(weekStart, selectedDayOfWeek),
        "yyyy-MM-dd"
      );

      try {
        if (type === "temporary") {
          // 일회성 변경
          if (dragState.dragType === "class") {
            // 종료 시간 계산 (duration 유지)
            const startTimeParts = dragState.draggedBlock.startTime.split(":");
            const endTimeParts = dragState.draggedBlock.endTime.split(":");
            const durationMinutes =
              parseInt(endTimeParts[0]) * 60 +
              parseInt(endTimeParts[1]) -
              (parseInt(startTimeParts[0]) * 60 + parseInt(startTimeParts[1]));

            const targetTimeParts = targetTime.split(":");
            const targetEndMinutes =
              parseInt(targetTimeParts[0]) * 60 +
              parseInt(targetTimeParts[1]) +
              durationMinutes;
            const targetEndTime = `${Math.floor(targetEndMinutes / 60)
              .toString()
              .padStart(2, "0")}:${(targetEndMinutes % 60)
              .toString()
              .padStart(2, "0")}`;

            // 수업 예외 생성
            await createClassException.mutateAsync({
              composition_id: dragState.draggedBlock.compositionId || dragState.draggedBlock.id,
              date_from: targetDate,
              start_time_from: dragState.draggedBlock.startTime,
              end_time_from: dragState.draggedBlock.endTime,
              date_to: targetDate,
              start_time_to: targetTime,
              end_time_to: targetEndTime,
              room: `${targetRoomNumber}강의실`,
              reason,
            });
          } else if (dragState.dragType === "student" && dragState.draggedStudent) {
            // 학생 예외 생성 (다른 수업으로 이동)
            // 타겟 수업 찾기 필요 - 현재는 placeholder
            console.log("학생 예외 생성:", {
              student: dragState.draggedStudent,
              targetRoom: targetRoomNumber,
              targetTime,
              targetDate,
            });
            // TODO: 타겟 수업 ID를 찾아서 createStudentException 호출
          }
        } else {
          // 영구 변경 - class_composition 테이블 직접 업데이트 필요
          console.log("영구 변경:", {
            dragType: dragState.dragType,
            block: dragState.draggedBlock,
            student: dragState.draggedStudent,
            targetRoom: targetRoomNumber,
            targetTime,
          });
          // TODO: class_composition 업데이트 API 구현 필요
        }
      } catch (error) {
        console.error("예외 생성 실패:", error);
      } finally {
        setModalState({ isOpen: false, dropResult: null });
        resetDrag();
      }
    },
    [
      modalState.dropResult,
      dragState,
      selectedDayOfWeek,
      createClassException,
      resetDrag,
    ]
  );

  // 모달 닫기 핸들러
  const handleModalClose = useCallback(() => {
    setModalState({ isOpen: false, dropResult: null });
    resetDrag();
  }, [resetDrag]);

  // 요일별 시작 시간 설정 (월~금: 16시, 토~일: 10시)
  const scheduleConfig = useMemo(() => {
    // DB 형식: 0=월, 1=화, 2=수, 3=목, 4=금, 5=토, 6=일
    const isWeekend = selectedDayOfWeek === 5 || selectedDayOfWeek === 6; // 토요일(5) 또는 일요일(6)
    return {
      startHour: isWeekend ? 10 : 16, // 주말: 10시, 평일: 16시
      endHour: 24,
      timeSlotMinutes: 10,
      showWeekend: true,
      firstDayOfWeek: 0,
    };
  }, [selectedDayOfWeek]);

  // ClassBlock 형태로 변환
  const classBlocks = useMemo<ClassBlock[]>(() => {
    if (!classes) return [];

    const blocks: ClassBlock[] = [];

    classes.forEach((classData) => {
      // classes 테이블의 room 정보가 있는 경우에만 처리
      if (!classData.room) return;

      // room이 "1강의실" 형식이거나 "1", "2" 같은 숫자만 있는 경우 처리
      let roomNumber: number | null = null;
      const roomWithSuffix = classData.room.match(/^(\d+)강의실$/);
      const roomNumberOnly = classData.room.match(/^(\d+)$/);

      if (roomWithSuffix) {
        roomNumber = parseInt(roomWithSuffix[1], 10);
      } else if (roomNumberOnly) {
        roomNumber = parseInt(roomNumberOnly[1], 10);
      }

      // 1~10강의실만 표시
      if (roomNumber === null || roomNumber < 1 || roomNumber > 10) return;

      // dayOfWeek를 room index로 사용 (0-based, 1강의실 = 0)
      const roomIndex = roomNumber - 1;

      classData.class_composition.forEach((composition) => {
        // 선택된 요일과 일치하는 수업만 표시
        if (composition.day_of_week !== selectedDayOfWeek) return;

        // 학생 정보 추출
        const students =
          classData.class_students
            ?.filter((cs) => cs.student)
            .map((cs) => ({
              id: cs.student!.id,
              name: cs.student!.name,
              grade: cs.student!.grade,
            })) || [];

        blocks.push({
          id: composition.id,
          classId: classData.id,
          compositionId: composition.id,
          title: classData.title,
          subject: classData.subject?.subject_name || "과목 미정",
          teacherName: classData.teacher?.name || "강사 미정",
          room: `${roomNumber}강의실`, // 숫자 + "강의실" 형식으로 통일
          dayOfWeek: roomIndex, // room index를 dayOfWeek로 사용
          startTime: composition.start_time,
          endTime: composition.end_time,
          color: classData.color || "#6b7c5d",
          studentCount: students.length,
          compositionType: composition.type,
          students: students, // 학생 정보 추가
        });
      });
    });

    return blocks;
  }, [classes, selectedDayOfWeek]);

  if (isLoading) {
    return (
      <>
        <PageHeader
          title="학원 수업 시간표"
          description="강의실별 수업 일정을 한눈에 확인하세요"
          icon={Building2}
        />
        <PageLayout maxWidth={"inset"}>
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Loader2 className="w-8 h-8 mx-auto mb-4 text-primary-600 animate-spin" />
              <p className="text-gray-600">수업 시간표를 불러오는 중...</p>
            </div>
          </div>
        </PageLayout>
      </>
    );
  }

  if (error) {
    return (
      <>
        <PageHeader
          title="학원 수업 시간표"
          description="강의실별 수업 일정을 한눈에 확인하세요"
          icon={Building2}
        />
        <PageLayout maxWidth={"inset"}>
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-red-600">
                시간표를 불러오는 중 오류가 발생했습니다.
              </p>
              <p className="mt-2 text-sm text-gray-600">
                {error instanceof Error ? error.message : "알 수 없는 오류"}
              </p>
            </div>
          </div>
        </PageLayout>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="학원 수업 시간표"
        description="강의실별 수업 일정을 한눈에 확인하세요"
        icon={Building2}
      />

      <PageLayout maxWidth={"inset"}>
        <div className="flex flex-col h-full gap-4">
          {/* 요일 선택 버튼 */}
          <div className="flex gap-2 p-2 border-0 flat-card rounded-2xl">
            {DAYS_OF_WEEK.map((day, index) => {
              const isSelected = selectedDayOfWeek === index;
              const isToday = today === index;

              return (
                <button
                  key={index}
                  onClick={() => setSelectedDayOfWeek(index)}
                  className={`
                    flex-1 px-3 py-1.5 text-sm font-medium transition-all duration-200 rounded-xl
                    ${
                      isSelected
                        ? "flat-pressed bg-primary-500 text-white"
                        : "flat-card text-gray-700 hover:flat-pressed"
                    }
                    ${isToday && !isSelected ? "ring-2 ring-primary-300" : ""}
                  `}
                >
                  <div className="flex flex-col items-center gap-0.5">
                    <span>{day}</span>
                    {isToday && (
                      <span className="text-[10px] text-primary-600">오늘</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* 시간표 캔버스 */}
          <div className="flex-1 overflow-hidden border-0 flat-card rounded-2xl">
            <ClassroomScheduleCanvas
              editMode="edit"
              customBlocks={classBlocks}
              config={scheduleConfig}
              onClassDragStart={handleClassDragStart}
              onStudentDragStart={handleStudentDragStart}
              onDrop={onDrop}
            />
          </div>
        </div>
      </PageLayout>

      {/* 예외 처리 모달 */}
      <ExceptionModal
        isOpen={modalState.isOpen}
        onClose={handleModalClose}
        onConfirm={handleModalConfirm}
        title={
          dragState.dragType === "class"
            ? "수업 시간/강의실 변경"
            : "학생 수강 정보 변경"
        }
        description={
          dragState.dragType === "class"
            ? "수업의 시간 또는 강의실이 변경됩니다."
            : "학생의 수강 정보가 변경됩니다."
        }
        dragType={dragState.dragType || "class"}
      />
    </>
  );
}
