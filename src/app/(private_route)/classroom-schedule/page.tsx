"use client";

import MoveConfirmModal from "@/components/classroom-schedule/MoveConfirmModal";
import SelectionToast from "@/components/classroom-schedule/SelectionToast";
import { PageHeader, PageLayout } from "@/components/common/layout";
import ClassroomSchedule from "@/components/common/schedule/ClassroomSchedule";
import {
  useChangeRoom,
  useChangeTime,
  useMoveStudents,
} from "@/queries/useClassroomSchedule";
import { useClassroomSchedule } from "@/queries/useCombinedSchedule";
import { ClassBlock } from "@/types/schedule";
import { Building2, Loader2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

interface SelectedStudent {
  id: string;
  name: string;
  grade: number | null;
  blockId: string;
  school: {
    id: string;
    name: string;
    level: string;
  } | null;
}

export default function ClassroomSchedulePage() {
  // 현재 주의 월요일 계산
  const today = new Date();
  const dayOfWeek = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1));

  // 월요일 날짜를 YYYY-MM-DD 형식으로 변환
  const weekStartDate = `${monday.getFullYear()}-${String(
    monday.getMonth() + 1
  ).padStart(2, "0")}-${String(monday.getDate()).padStart(2, "0")}`;

  const {
    data: scheduleData,
    isLoading,
    error,
  } = useClassroomSchedule(weekStartDate);
  const classes = scheduleData?.data;
  const compositionsExceptions = scheduleData?.compositionsExceptions || [];
  const studentsExceptions = scheduleData?.studentsExceptions || [];
  const moveStudentsMutation = useMoveStudents();
  const changeRoomMutation = useChangeRoom();
  const changeTimeMutation = useChangeTime();

  // 현재 시간 정보 (자동 스크롤용)
  const now = new Date();
  const jsDay = now.getDay(); // 0=일, 1=월, 2=화, 3=수, 4=목, 5=금, 6=토
  // DB 형식으로 변환: 0=월, 1=화, 2=수, 3=목, 4=금, 5=토, 6=일
  const currentDayOfWeek = jsDay === 0 ? 6 : jsDay - 1;
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();

  console.log("현재 요일:", {
    jsDay,
    currentDayOfWeek,
    dayName: ["일", "월", "화", "수", "목", "금", "토"][jsDay],
  });

  // 선택 상태
  const [selectedStudents, setSelectedStudents] = useState<SelectedStudent[]>(
    []
  );
  const [selectedClass, setSelectedClass] = useState<ClassBlock | null>(null);
  const [isMovingStudents, setIsMovingStudents] = useState(false);
  const [targetClass, setTargetClass] = useState<ClassBlock | null>(null);

  // 모달 상태
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    type: "student" | "class" | "time";
    title: string;
    description: string;
  }>({
    isOpen: false,
    type: "student",
    title: "",
    description: "",
  });

  // 키보드 단축키 (⌘+X or Ctrl+X for move, Esc for cancel)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 이동 단축키
      if (
        (e.metaKey || e.ctrlKey) &&
        e.key === "x" &&
        selectedStudents.length > 0
      ) {
        e.preventDefault();
        setIsMovingStudents(true);
      }
      // 이동 대기 상태 취소
      if (e.key === "Escape" && isMovingStudents) {
        e.preventDefault();
        setIsMovingStudents(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedStudents, isMovingStudents]);

  // 학생 클릭 핸들러
  const handleStudentClick = useCallback(
    (
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
    ) => {
      // 이동 대기 상태 취소
      if (isMovingStudents) {
        setIsMovingStudents(false);
      }

      const selectedStudent: SelectedStudent = {
        id: student.id,
        name: student.name,
        grade: student.grade,
        school: student.school,
        blockId: block.id,
      };

      if (isMultiSelect) {
        // Ctrl/Cmd + 클릭: 다중 선택
        setSelectedStudents((prev) => {
          // 서로 다른 카드의 학생 선택 방지
          if (prev.length > 0 && prev[0].blockId !== block.id) {
            alert("서로 다른 카드의 학생을 함께 선택할 수 없습니다");
            return prev;
          }

          // composition_id + student_id 조합으로 찾기
          const exists = prev.find(
            (s) => s.id === student.id && s.blockId === block.id
          );
          if (exists) {
            return prev.filter(
              (s) => !(s.id === student.id && s.blockId === block.id)
            );
          } else {
            return [...prev, selectedStudent];
          }
        });
      } else {
        // 일반 클릭: 단일 선택
        setSelectedStudents([selectedStudent]);
        setSelectedClass(null);
      }
    },
    [isMovingStudents]
  );

  // 수업 카드 클릭 핸들러
  const handleClassCardClick = useCallback(
    (block: ClassBlock) => {
      if (isMovingStudents) {
        // 학생 이동 대기 상태: 타겟 수업 선택
        setTargetClass(block);
        setModalState({
          isOpen: true,
          type: "student",
          title: "학생 이동",
          description: `${selectedStudents.length}명의 학생을 ${block.title}로 이동합니다.`,
        });
      } else {
        // 일반 상태: 수업 선택
        setSelectedClass(block);
        setSelectedStudents([]);
      }
    },
    [isMovingStudents, selectedStudents]
  );

  // 학생 이동 버튼
  const handleMoveStudents = useCallback(() => {
    setIsMovingStudents(true);
  }, []);

  // 강의실 이동 버튼
  const handleMoveClass = useCallback(() => {
    if (!selectedClass) return;
    setModalState({
      isOpen: true,
      type: "class",
      title: "강의실 이동",
      description: `${selectedClass.title}의 강의실을 변경합니다.`,
    });
  }, [selectedClass]);

  // 시간대 변경 버튼
  const handleChangeTime = useCallback(() => {
    if (!selectedClass) return;
    setModalState({
      isOpen: true,
      type: "time",
      title: "시간대 변경",
      description: `${selectedClass.title}의 시간대를 변경합니다.`,
    });
  }, [selectedClass]);

  // 선택 초기화
  const handleClearSelection = useCallback(() => {
    setSelectedStudents([]);
    setSelectedClass(null);
    setIsMovingStudents(false);
    setTargetClass(null);
  }, []);

  // 일회성 변경
  const handleConfirmTemporary = useCallback(
    async (reason?: string) => {
      try {
        if (modalState.type === "student" && targetClass) {
          // 학생 이동
          await moveStudentsMutation.mutateAsync({
            studentIds: selectedStudents.map((s) => s.id),
            sourceCompositionId: selectedStudents[0].blockId,
            targetCompositionId: targetClass.id,
            isPermanent: false,
            reason,
            weekStartDate,
          });
        } else if (modalState.type === "class" && selectedClass) {
          // 강의실 변경 - 모달에서 새 강의실 입력받기
          const newRoom = prompt("새 강의실 번호를 입력하세요 (예: 3강의실):");
          if (!newRoom) return;

          await changeRoomMutation.mutateAsync({
            compositionId: selectedClass.compositionId || selectedClass.id,
            newRoom,
            isPermanent: false,
            reason,
            weekStartDate,
          });
        } else if (modalState.type === "time" && selectedClass) {
          // 시간대 변경 - 모달에서 새 시간 입력받기
          const newStartTime = prompt("새 시작 시간을 입력하세요 (예: 14:00):");
          const newEndTime = prompt("새 종료 시간을 입력하세요 (예: 15:30):");
          if (!newStartTime || !newEndTime) return;

          await changeTimeMutation.mutateAsync({
            compositionId: selectedClass.compositionId || selectedClass.id,
            newStartTime: newStartTime + ":00",
            newEndTime: newEndTime + ":00",
            isPermanent: false,
            reason,
            weekStartDate,
          });
        }

        alert("일회성 변경이 완료되었습니다.");
      } catch (error) {
        console.error("일회성 변경 실패:", error);
      } finally {
        setModalState({ ...modalState, isOpen: false });
        handleClearSelection();
      }
    },
    [
      selectedStudents,
      selectedClass,
      targetClass,
      modalState,
      weekStartDate,
      handleClearSelection,
      moveStudentsMutation,
      changeRoomMutation,
      changeTimeMutation,
    ]
  );

  // 영구 변경
  const handleConfirmPermanent = useCallback(async () => {
    try {
      if (modalState.type === "student" && targetClass) {
        // 학생 이동
        await moveStudentsMutation.mutateAsync({
          studentIds: selectedStudents.map((s) => s.id),
          sourceCompositionId: selectedStudents[0].blockId,
          targetCompositionId: targetClass.id,
          isPermanent: true,
        });
      } else if (modalState.type === "class" && selectedClass) {
        // 강의실 변경
        const newRoom = prompt("새 강의실 번호를 입력하세요 (예: 3강의실):");
        if (!newRoom) return;

        await changeRoomMutation.mutateAsync({
          compositionId: selectedClass.compositionId || selectedClass.id,
          newRoom,
          isPermanent: true,
        });
      } else if (modalState.type === "time" && selectedClass) {
        // 시간대 변경
        const newStartTime = prompt("새 시작 시간을 입력하세요 (예: 14:00):");
        const newEndTime = prompt("새 종료 시간을 입력하세요 (예: 15:30):");
        if (!newStartTime || !newEndTime) return;

        await changeTimeMutation.mutateAsync({
          compositionId: selectedClass.compositionId || selectedClass.id,
          newStartTime: newStartTime + ":00",
          newEndTime: newEndTime + ":00",
          isPermanent: true,
        });
      }

      alert("영구 변경이 완료되었습니다.");
    } catch (error) {
      console.error("영구 변경 실패:", error);
    } finally {
      setModalState({ ...modalState, isOpen: false });
      handleClearSelection();
    }
  }, [
    selectedStudents,
    selectedClass,
    targetClass,
    modalState,
    handleClearSelection,
    moveStudentsMutation,
    changeRoomMutation,
    changeTimeMutation,
  ]);

  // 통합 시간표 설정 (모든 요일을 연속으로 표시)
  const scheduleConfig = useMemo(() => {
    return {
      startHour: 16,
      endHour: 24,
      timeSlotMinutes: 10,
      showWeekend: true,
      firstDayOfWeek: 0,
    };
  }, []);

  // ClassBlock 형태로 변환 (예외 반영)
  const classBlocks = useMemo<ClassBlock[]>(() => {
    if (!classes) return [];

    const blocks: ClassBlock[] = [];

    classes.forEach((classData) => {
      if (!classData.room) return;

      let roomNumber: number | null = null;
      const roomWithSuffix = classData.room.match(/^(\d+)강의실$/);
      const roomNumberOnly = classData.room.match(/^(\d+)$/);

      if (roomWithSuffix) {
        roomNumber = parseInt(roomWithSuffix[1], 10);
      } else if (roomNumberOnly) {
        roomNumber = parseInt(roomNumberOnly[1], 10);
      }

      if (roomNumber === null || roomNumber < 1 || roomNumber > 10) return;

      console.log("classData", classData);

      classData.class_compositions.forEach((composition) => {
        // 해당 composition의 시간/강의실 예외 찾기 (이번 주 week_start_date 기준)
        const compositionException = compositionsExceptions.find(
          (ex) => ex.composition_id === composition.id
        );

        // 각 composition에 등록된 학생 필터링 (예외 고려)
        const baseStudents =
          composition.relations_compositions_students
            ?.filter((cs) => cs.student && cs.status === "active")
            .map((cs) => ({
              id: cs.student!.id,
              name: cs.student!.name,
              grade: cs.student!.grade,
              school: cs.student!.school
                ? {
                    id: cs.student!.school.id,
                    name: cs.student!.school.name,
                    level: cs.student!.school.level,
                  }
                : null,
            })) || [];

        // 학생 예외 적용: 다른 수업으로 이동한 학생 제외 (이번 주 기준)
        const studentsMovedAway = studentsExceptions
          .filter((ex) => ex.composition_id_from === composition.id)
          .map((ex) => ex.student_id);

        const studentsAfterExclusion = baseStudents.filter(
          (s) => !studentsMovedAway.includes(s.id)
        );

        // 다른 수업에서 이동해온 학생 추가 (이번 주 기준)
        const studentsMovedIn = studentsExceptions
          .filter((ex) => ex.composition_id_to === composition.id && ex.student)
          .map((ex) => ({
            id: ex.student!.id,
            name: ex.student!.name,
            grade: ex.student!.grade,
            school: ex.student!.school || null,
          }));

        const finalStudents = [...studentsAfterExclusion, ...studentsMovedIn];

        // 예외가 있으면 예외 값 사용, 없으면 기본 값 사용
        blocks.push({
          id: composition.id,
          classId: classData.id,
          compositionId: composition.id,
          title: classData.title,
          subject: classData.subject?.subject_name || "과목 미정",
          teacherName: classData.teacher?.name || "강사 미정",
          room: compositionException?.room || `${roomNumber}강의실`,
          dayOfWeek: composition.day_of_week,
          startTime:
            compositionException?.start_time_to || composition.start_time,
          endTime: compositionException?.end_time_to || composition.end_time,
          color: classData.color || "#6b7c5d",
          studentCount: finalStudents.length,
          compositionType: composition.type,
          students: finalStudents,
          isException: !!compositionException,
        });
      });
    });

    return blocks;
  }, [classes, compositionsExceptions, studentsExceptions]);

  // 선택된 학생들의 수업 정보 가져오기
  const selectedStudentsClass = useMemo(() => {
    if (selectedStudents.length === 0) return null;
    const blockId = selectedStudents[0].blockId;
    return classBlocks.find((block) => block.id === blockId) || null;
  }, [selectedStudents, classBlocks]);

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
        <div className="flex flex-col h-full">
          {/* 통합 시간표 */}
          <div className="flex-1 overflow-hidden border-0 flat-card rounded-2xl">
            <ClassroomSchedule
              editMode="edit"
              customBlocks={classBlocks}
              config={scheduleConfig}
              onStudentClick={handleStudentClick}
              onClassCardClick={handleClassCardClick}
              selectedStudentKeys={selectedStudents.map(
                (s) => `${s.blockId}-${s.id}`
              )}
              initialScrollPosition={{
                dayOfWeek: currentDayOfWeek,
                hour: currentHour,
                minute: currentMinute,
              }}
            />
          </div>
        </div>
      </PageLayout>

      {/* 선택 토스트 */}
      <SelectionToast
        selectedStudents={selectedStudents}
        selectedStudentsClass={selectedStudentsClass}
        selectedClass={selectedClass}
        isMovingStudents={isMovingStudents}
        isMovingClass={false}
        onMoveStudents={handleMoveStudents}
        onMoveClass={handleMoveClass}
        onChangeTime={handleChangeTime}
        onClearSelection={handleClearSelection}
      />

      {/* 이동 확인 모달 */}
      <MoveConfirmModal
        isOpen={modalState.isOpen}
        type={modalState.type}
        title={modalState.title}
        description={modalState.description}
        onClose={() => setModalState({ ...modalState, isOpen: false })}
        onConfirmTemporary={handleConfirmTemporary}
        onConfirmPermanent={handleConfirmPermanent}
      />
    </>
  );
}
