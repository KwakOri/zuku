"use client";

import { PageHeader, PageLayout } from "@/components/common/layout";
import ClassroomScheduleCanvas from "@/components/common/schedule/ClassroomScheduleCanvas";
import SelectionToast from "@/components/classroom-schedule/SelectionToast";
import MoveConfirmModal from "@/components/classroom-schedule/MoveConfirmModal";
import { useClassroomSchedule } from "@/queries/useCombinedSchedule";
import { ClassBlock } from "@/types/schedule";
import { Building2, Loader2 } from "lucide-react";
import { useCallback, useMemo, useState, useEffect } from "react";

interface SelectedStudent {
  id: string;
  name: string;
  grade: number | null;
  blockId: string;
}

export default function ClassroomSchedulePage() {
  const { data: classes, isLoading, error } = useClassroomSchedule();

  // 현재 시간 정보 (자동 스크롤용)
  const now = new Date();
  const currentDayOfWeek = (now.getDay() + 6) % 7; // DB 형식: 0=월, 6=일
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();

  // 선택 상태
  const [selectedStudents, setSelectedStudents] = useState<SelectedStudent[]>([]);
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


  // 키보드 단축키 (⌘+X or Ctrl+X)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "x" && selectedStudents.length > 0) {
        e.preventDefault();
        setIsMovingStudents(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedStudents]);

  // 학생 클릭 핸들러
  const handleStudentClick = useCallback(
    (
      student: { id: string; name: string; grade: number | null },
      block: ClassBlock,
      isShiftKey: boolean
    ) => {
      const selectedStudent: SelectedStudent = {
        ...student,
        blockId: block.id,
      };

      if (isShiftKey) {
        // Shift + 클릭: 다중 선택
        setSelectedStudents((prev) => {
          const exists = prev.find((s) => s.id === student.id);
          if (exists) {
            return prev.filter((s) => s.id !== student.id);
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
    []
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
      // TODO: API 호출
      console.log("일회성 변경:", { selectedStudents, selectedClass, targetClass, reason });
      setModalState({ ...modalState, isOpen: false });
      handleClearSelection();
    },
    [selectedStudents, selectedClass, targetClass, modalState, handleClearSelection]
  );

  // 영구 변경
  const handleConfirmPermanent = useCallback(async () => {
    // TODO: API 호출
    console.log("영구 변경:", { selectedStudents, selectedClass, targetClass });
    setModalState({ ...modalState, isOpen: false });
    handleClearSelection();
  }, [selectedStudents, selectedClass, targetClass, modalState, handleClearSelection]);

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

  // ClassBlock 형태로 변환
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

      classData.class_composition.forEach((composition) => {
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
          room: `${roomNumber}강의실`,
          dayOfWeek: composition.day_of_week,
          startTime: composition.start_time,
          endTime: composition.end_time,
          color: classData.color || "#6b7c5d",
          studentCount: students.length,
          compositionType: composition.type,
          students: students,
        });
      });
    });

    return blocks;
  }, [classes]);

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
          {/* 통합 시간표 캔버스 */}
          <div className="flex-1 overflow-hidden border-0 flat-card rounded-2xl">
            <ClassroomScheduleCanvas
              editMode="edit"
              customBlocks={classBlocks}
              config={scheduleConfig}
              onStudentClick={handleStudentClick}
              onClassCardClick={handleClassCardClick}
              selectedStudentIds={selectedStudents.map(s => s.id)}
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
