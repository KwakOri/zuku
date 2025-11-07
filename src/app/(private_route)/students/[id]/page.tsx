"use client";

import CanvasSchedule from "@/components/common/schedule/CanvasSchedule";
import ClassCompositionEditModal from "@/components/students/ClassCompositionEditModal";
import ClassEnrollmentModal from "@/components/students/ClassEnrollmentModal";
import {
  convertBlockToStudentSchedule,
  findBlockChanges,
  getSubjectColor,
  isNewBlock,
} from "@/lib/scheduleUtils";
import { getGrade } from "@/lib/utils";
import { fullScheduleKeys, useFullSchedule } from "@/queries/useFullSchedule";
import { useStudents } from "@/queries/useStudents";
import {
  createStudentSchedule,
  CreateStudentScheduleRequest,
  deleteStudentSchedule,
  updateStudentSchedule,
  UpdateStudentScheduleRequest,
} from "@/services/client/studentScheduleApi";
import { ClassBlock } from "@/types/schedule";
import { Tables } from "@/types/supabase";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Clock, Home, MapPin, Plus, Search, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useEffect, useRef, useState } from "react";

interface StudentDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function StudentDetailPage({ params }: StudentDetailPageProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: students = [], isLoading, error } = useStudents();

  // params를 unwrap
  const { id } = use(params);
  const studentId = id; // UUID 그대로 사용

  // URL의 id 파라미터로 학생 정보 찾기
  const student = students.find((s) => s.id === id);

  // 학생 전체 시간표 데이터 가져오기 (개인 일정 + 수업 일정)
  const {
    data: fullScheduleData,
    isLoading: isScheduleLoading,
    error: scheduleError,
  } = useFullSchedule(studentId);

  console.log("학생 전체 시간표 데이터 -> ", fullScheduleData);

  // 전체 시간표를 CanvasSchedule용 블록으로 변환
  const allSchedules = fullScheduleData?.all || [];

  // 과목별 색상 테마 적용
  // 일반 수업: 밝은 파스텔톤
  // 클리닉: 진한 색상
  // 앞타임/뒷타임 구분: composition_order로 판단
  const scheduleBlocks = allSchedules.map((schedule) => {
    const isPersonal = schedule.type !== "class";
    const compositionOrder =
      "composition_order" in schedule ? schedule.composition_order : null;
    const isFrontTime = compositionOrder === 0 || !compositionOrder;
    const compositionType =
      ("composition_type" in schedule ? schedule.composition_type : null) ||
      "class";
    const subjectName =
      "subject_name" in schedule ? schedule.subject_name : null;
    const teacherName =
      "teacher_name" in schedule ? schedule.teacher_name : null;
    const classId = "class_id" in schedule ? schedule.class_id : null;

    const color = getSubjectColor(
      subjectName || undefined,
      isPersonal,
      isFrontTime,
      compositionType
    );

    return {
      id: schedule.id,
      classId: classId || schedule.id,
      title: schedule.title,
      subject: schedule.type === "class" ? subjectName || "" : schedule.type,
      teacherName: teacherName || "",
      startTime: schedule.start_time.substring(0, 5), // HH:MM:SS → HH:MM
      endTime: schedule.end_time.substring(0, 5), // HH:MM:SS → HH:MM
      dayOfWeek: schedule.day_of_week,
      color: color,
      room: schedule.location || "",
      isEditable: schedule.type !== "class", // 수업 일정은 편집 불가
      compositionType: compositionType, // "class" 또는 "clinic"
      studentCount: 1,
    };
  });

  // 원본 블록 데이터를 참조로 저장 (변경 감지용)
  const originalBlocksRef = useRef<ClassBlock[]>([]);

  // scheduleBlocks가 변경될 때마다 원본 참조 업데이트
  useEffect(() => {
    originalBlocksRef.current = scheduleBlocks;
  }, [scheduleBlocks]);

  // 일정 관리 UI 상태
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [showCompositionEditModal, setShowCompositionEditModal] =
    useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | "personal" | "class">(
    "all"
  );
  const [selectedSchedule, setSelectedSchedule] = useState<ClassBlock | null>(
    null
  );
  const [selectedClassForEdit, setSelectedClassForEdit] = useState<{
    classStudentId: string;
    classId: string;
    className: string;
    classColor: string;
    subjectName?: string;
    teacherName?: string;
    allCompositions: Tables<"class_compositions">[];
  } | null>(null);

  // 새로운 일정 추가 폼 상태
  const [newSchedule, setNewSchedule] = useState<CreateStudentScheduleRequest>({
    title: "",
    description: null,
    start_time: "09:00",
    end_time: "10:00",
    day_of_week: 1, // 월요일
    type: "personal",
    color: "#3b82f6",
    location: null,
    recurring: false,
  });

  // 새 일정 생성 mutation
  const createScheduleMutation = useMutation({
    mutationFn: (scheduleData: CreateStudentScheduleRequest) =>
      createStudentSchedule(studentId, scheduleData),
    onSuccess: (newSchedule) => {
      // 전체 시간표 캐시 무효화
      queryClient.invalidateQueries({
        queryKey: fullScheduleKeys.byStudent(studentId),
      });
    },
    onError: (error) => {
      console.error("Failed to create schedule:", error);
    },
  });

  // 일정 수정 mutation
  const updateScheduleMutation = useMutation({
    mutationFn: ({
      scheduleId,
      scheduleData,
    }: {
      scheduleId: string;
      scheduleData: UpdateStudentScheduleRequest;
    }) => updateStudentSchedule(studentId, scheduleId, scheduleData),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: fullScheduleKeys.byStudent(studentId),
      });
    },
  });

  // 일정 삭제 mutation
  const deleteScheduleMutation = useMutation({
    mutationFn: (scheduleId: string) =>
      deleteStudentSchedule(studentId, scheduleId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: fullScheduleKeys.byStudent(studentId),
      });
    },
    onError: (error) => {
      console.error("Failed to delete schedule:", error);
    },
  });

  // 블록 변경 핸들러
  const handleBlocksChange = async (updatedBlocks: ClassBlock[]) => {
    try {
      // 원본과 업데이트된 블록을 비교하여 변경사항 감지
      const changes = findBlockChanges(
        originalBlocksRef.current,
        updatedBlocks
      );

      // 병렬로 모든 변경사항 처리
      const promises: Promise<Tables<"student_schedules">>[] = [];

      // 1. 삭제된 블록들 처리
      changes.deleted.forEach((deletedBlock) => {
        if (!isNewBlock(deletedBlock)) {
          promises.push(
            deleteStudentSchedule(studentId, deletedBlock.id).catch((error) => {
              console.error(
                `Failed to delete schedule ${deletedBlock.id}:`,
                error
              );
              throw error;
            })
          );
        }
      });

      // 2. 새로 추가된 블록들 처리
      changes.added.forEach((addedBlock) => {
        const scheduleData = convertBlockToStudentSchedule(
          addedBlock,
          studentId
        );
        promises.push(
          createStudentSchedule(studentId, scheduleData).catch((error) => {
            console.error(`Failed to create new schedule:`, error);
            throw error;
          })
        );
      });

      // 3. 수정된 블록들 처리
      changes.updated.forEach((updatedBlock) => {
        if (!isNewBlock(updatedBlock)) {
          const scheduleData = convertBlockToStudentSchedule(
            updatedBlock,
            studentId
          );
          promises.push(
            updateStudentSchedule(
              studentId,
              updatedBlock.id,
              scheduleData
            ).catch((error) => {
              console.error(
                `Failed to update schedule ${updatedBlock.id}:`,
                error
              );
              throw error;
            })
          );
        }
      });

      // 모든 변경사항을 병렬로 처리
      if (promises.length > 0) {
        await Promise.all(promises);

        // 성공 시 캐시 무효화하여 최신 데이터 다시 가져오기
        queryClient.invalidateQueries({
          queryKey: fullScheduleKeys.byStudent(studentId),
        });
      }

      // 원본 참조 업데이트
      originalBlocksRef.current = updatedBlocks;
    } catch (error) {
      console.error("Failed to save schedule changes:", error);

      // 에러 발생 시 사용자에게 알림 (선택사항)
      // alert("시간표 저장에 실패했습니다. 다시 시도해주세요.");

      // 캐시 무효화하여 원본 데이터로 되돌리기
      queryClient.invalidateQueries({
        queryKey: fullScheduleKeys.byStudent(studentId),
      });
    }
  };

  // 뒤로 가기 핸들러
  const handleBack = () => {
    router.back();
  };

  // 새 일정 추가 핸들러
  const handleAddSchedule = async () => {
    try {
      await createScheduleMutation.mutateAsync(newSchedule);

      setShowAddModal(false);
      // 폼 초기화
      setNewSchedule({
        title: "",
        description: null,
        start_time: "09:00",
        end_time: "10:00",
        day_of_week: 1,
        type: "personal",
        color: "#3b82f6",
        location: null,
        recurring: false,
      });
    } catch (error) {
      console.error("Failed to add schedule:", error);
      alert("일정 추가에 실패했습니다. 다시 시도해주세요.");
    }
  };

  // 일정 삭제 핸들러
  const handleDeleteSchedule = async (scheduleId: string) => {
    if (confirm("정말로 이 일정을 삭제하시겠습니까?")) {
      try {
        await deleteScheduleMutation.mutateAsync(scheduleId);
      } catch (error) {
        console.error("Failed to delete schedule:", error);
      }
    }
  };

  // 블록 클릭 핸들러 - 수업 블록 클릭 시 구성 편집 모달 열기
  const handleBlockClick = async (block: ClassBlock) => {
    // 수업 블록인지 확인: 전체 시간표에서 type으로 판단
    const originalSchedule = allSchedules.find((s) => s.id === block.id);
    const isClassBlock = originalSchedule?.type === "class";
    const scheduleClassId =
      originalSchedule && "class_id" in originalSchedule
        ? originalSchedule.class_id
        : null;
    const scheduleSubjectName =
      originalSchedule && "subject_name" in originalSchedule
        ? originalSchedule.subject_name
        : null;
    const scheduleTeacherName =
      originalSchedule && "teacher_name" in originalSchedule
        ? originalSchedule.teacher_name
        : null;

    if (isClassBlock && originalSchedule && scheduleClassId) {
      try {
        // 해당 class의 모든 composition을 API에서 가져오기
        const response = await fetch(
          `/api/class-composition?classId=${scheduleClassId}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch class compositions");
        }
        const allClassCompositions = await response.json();

        setSelectedClassForEdit({
          classStudentId: studentId, // class_student_id 대신 studentId 사용
          classId: scheduleClassId,
          className: originalSchedule.title,
          classColor: originalSchedule.color,
          subjectName: scheduleSubjectName || undefined,
          teacherName: scheduleTeacherName || undefined,
          allCompositions: allClassCompositions,
        });
        setShowCompositionEditModal(true);
      } catch (error) {
        console.error("Failed to fetch class compositions:", error);
        alert("수업 구성을 불러오는데 실패했습니다.");
      }
    }
  };

  // 필터링된 일정 목록
  const filteredSchedules = scheduleBlocks.filter((schedule) => {
    const matchesSearch =
      schedule.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (schedule.subject &&
        schedule.subject.toLowerCase().includes(searchTerm.toLowerCase()));

    // type 기반으로 필터링 (개인 일정 vs 수업)
    const originalSchedule = allSchedules.find((s) => s.id === schedule.id);
    const isPersonal = originalSchedule?.type !== "class";
    const matchesFilter =
      filterType === "all" ||
      (filterType === "personal" && isPersonal) ||
      (filterType === "class" && !isPersonal);
    return matchesSearch && matchesFilter;
  });

  // 요일별 일정 통계
  const personalCount = allSchedules.filter((s) => s.type !== "class").length;
  const classCount = allSchedules.filter((s) => s.type === "class").length;

  const scheduleStats = {
    total: scheduleBlocks.length,
    byDay: [0, 1, 2, 3, 4, 5, 6].map(
      (day) => scheduleBlocks.filter((s) => s.dayOfWeek === day).length
    ),
    personal: personalCount,
    class: classCount,
  };

  // 로딩 상태
  if (isLoading || isScheduleLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 mx-auto border-b-2 border-blue-600 rounded-full animate-spin"></div>
          <p className="mt-2 text-gray-600">
            {isLoading
              ? "학생 정보를 불러오는 중..."
              : "시간표를 불러오는 중..."}
          </p>
        </div>
      </div>
    );
  }

  // 에러 상태
  if (error || scheduleError) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <p className="text-red-600">
            {error
              ? "학생 정보를 불러오는데 실패했습니다."
              : "시간표를 불러오는데 실패했습니다."}
          </p>
          <p className="mt-1 text-gray-600">
            {(error || scheduleError)?.message}
          </p>
          <button
            onClick={handleBack}
            className="px-4 py-2 mt-4 text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            돌아가기
          </button>
        </div>
      </div>
    );
  }

  // 학생을 찾지 못한 경우
  if (!student) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <User className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <h3 className="mb-2 text-lg font-medium text-gray-900">
            학생을 찾을 수 없습니다
          </h3>
          <p className="mb-4 text-gray-500">
            요청하신 학생 정보가 존재하지 않습니다.
          </p>
          <button
            onClick={handleBack}
            className="px-4 py-2 text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="border-0 shadow-sm flat-surface bg-gray-50">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="p-2 text-gray-500 transition-all duration-200 flat-card hover:text-gray-700 rounded-2xl hover:flat-pressed"
              >
                <Home className="w-5 h-5" />
              </Link>

              <div className="flex items-center gap-3">
                <div className="p-3 shadow-md bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-800">
                    {student.name} 시간표 관리
                  </h1>
                  <p className="text-sm text-gray-600">
                    개별 학생의 시간표를 수정할 수 있습니다
                  </p>
                </div>
              </div>
            </div>

            {/* 학생 정보 카드 및 액션 버튼 */}
            <div className="flex items-center gap-4">
              {/* 수업 등록 버튼 */}
              <button
                onClick={() => setShowEnrollModal(true)}
                className="flex items-center gap-2 px-4 py-2 text-white transition-colors bg-green-600 rounded-lg hover:bg-green-700"
              >
                <Plus className="w-4 h-4" />
                수업 등록
              </button>

              {/* 일정 추가 버튼 */}
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 px-4 py-2 text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" />
                일정 추가
              </button>

              {/* 학생 정보 카드 */}
              <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <div className="text-sm">
                  <div className="font-medium text-gray-900">
                    {student.name}
                  </div>
                  <div className="text-gray-500">{getGrade(student.grade)}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          {/* 좌측 패널 - 일정 관리 */}
          <div className="lg:col-span-1">
            {/* 일정 통계 */}
            <div className="p-4 mb-6 bg-white border border-gray-200 rounded-lg shadow-sm">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">
                일정 통계
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">전체 일정</span>
                  <span className="font-medium text-gray-900">
                    {scheduleStats.total}개
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">개인 일정</span>
                  <span className="font-medium text-blue-600">
                    {scheduleStats.personal}개
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">수업 일정</span>
                  <span className="font-medium text-green-600">
                    {scheduleStats.class}개
                  </span>
                </div>
              </div>
            </div>

            {/* 검색 및 필터 */}
            <div className="p-4 mb-6 bg-white border border-gray-200 rounded-lg shadow-sm">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">
                일정 검색
              </h3>

              {/* 검색 입력 */}
              <div className="relative mb-4">
                <Search className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                <input
                  type="text"
                  placeholder="일정 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* 필터 버튼 */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  필터
                </label>
                <div className="flex flex-col gap-2">
                  {[
                    { value: "all", label: "전체", count: scheduleStats.total },
                    {
                      value: "personal",
                      label: "개인 일정",
                      count: scheduleStats.personal,
                    },
                    {
                      value: "class",
                      label: "수업 일정",
                      count: scheduleStats.class,
                    },
                  ].map((filter) => (
                    <button
                      key={filter.value}
                      onClick={() =>
                        setFilterType(
                          filter.value as "all" | "personal" | "class"
                        )
                      }
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        filterType === filter.value
                          ? "bg-blue-100 text-blue-700 border border-blue-200"
                          : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>{filter.label}</span>
                        <span className="text-xs">{filter.count}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 일정 목록 */}
            <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">
                일정 목록
              </h3>
              <div className="space-y-2 overflow-y-auto max-h-64">
                {filteredSchedules.length === 0 ? (
                  <p className="py-4 text-sm text-center text-gray-500">
                    {searchTerm ? "검색 결과가 없습니다." : "일정이 없습니다."}
                  </p>
                ) : (
                  filteredSchedules.map((schedule) => (
                    <div
                      key={schedule.id}
                      className="p-3 transition-colors rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                      onClick={() => setSelectedSchedule(schedule)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: schedule.color }}
                            />
                            <span className="text-sm font-medium text-gray-900">
                              {schedule.title}
                            </span>
                          </div>
                          <div className="space-y-1 text-xs text-gray-600">
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {schedule.startTime} - {schedule.endTime}
                            </div>
                            {schedule.room && (
                              <div className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {schedule.room}
                              </div>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteSchedule(schedule.id);
                          }}
                          className="p-1 text-red-500 hover:text-red-700"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* 우측 패널 - 시간표 */}
          <div className="lg:col-span-3">
            <CanvasSchedule
              key={`schedule-${scheduleBlocks.length}-${scheduleBlocks
                .map((b) => b.id)
                .join("-")}`}
              customBlocks={scheduleBlocks}
              onBlocksChange={handleBlocksChange}
              editMode={"view"}
            />
          </div>
        </div>
      </main>

      {/* 일정 추가 모달 */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  새 일정 추가
                </h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleAddSchedule();
                }}
                className="space-y-4"
              >
                {/* 제목 */}
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    제목 *
                  </label>
                  <input
                    type="text"
                    required
                    value={newSchedule.title}
                    onChange={(e) =>
                      setNewSchedule((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="일정 제목을 입력하세요"
                  />
                </div>

                {/* 설명 */}
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    설명
                  </label>
                  <textarea
                    value={newSchedule.description || ""}
                    onChange={(e) =>
                      setNewSchedule((prev) => ({
                        ...prev,
                        description: e.target.value || null,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="일정 설명을 입력하세요"
                    rows={3}
                  />
                </div>

                {/* 요일 */}
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    요일 *
                  </label>
                  <select
                    required
                    value={newSchedule.day_of_week}
                    onChange={(e) =>
                      setNewSchedule((prev) => ({
                        ...prev,
                        day_of_week: parseInt(e.target.value),
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value={0}>일요일</option>
                    <option value={1}>월요일</option>
                    <option value={2}>화요일</option>
                    <option value={3}>수요일</option>
                    <option value={4}>목요일</option>
                    <option value={5}>금요일</option>
                    <option value={6}>토요일</option>
                  </select>
                </div>

                {/* 시간 */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                      시작 시간 *
                    </label>
                    <input
                      type="time"
                      required
                      value={newSchedule.start_time}
                      onChange={(e) =>
                        setNewSchedule((prev) => ({
                          ...prev,
                          start_time: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                      종료 시간 *
                    </label>
                    <input
                      type="time"
                      required
                      value={newSchedule.end_time}
                      onChange={(e) =>
                        setNewSchedule((prev) => ({
                          ...prev,
                          end_time: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* 유형 */}
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    유형
                  </label>
                  <select
                    value={newSchedule.type}
                    onChange={(e) =>
                      setNewSchedule((prev) => ({
                        ...prev,
                        type: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="personal">개인 일정</option>
                    <option value="study">학습</option>
                    <option value="homework">숙제</option>
                    <option value="exam">시험</option>
                    <option value="activity">활동</option>
                  </select>
                </div>

                {/* 장소 */}
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    장소
                  </label>
                  <input
                    type="text"
                    value={newSchedule.location || ""}
                    onChange={(e) =>
                      setNewSchedule((prev) => ({
                        ...prev,
                        location: e.target.value || null,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="장소를 입력하세요"
                  />
                </div>

                {/* 색상 */}
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    색상
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      "#3b82f6",
                      "#ef4444",
                      "#10b981",
                      "#f59e0b",
                      "#8b5cf6",
                      "#ec4899",
                      "#06b6d4",
                      "#84cc16",
                    ].map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() =>
                          setNewSchedule((prev) => ({ ...prev, color }))
                        }
                        className={`w-8 h-8 rounded-full border-2 ${
                          newSchedule.color === color
                            ? "border-gray-400"
                            : "border-gray-200"
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                {/* 반복 일정 */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="recurring"
                    checked={newSchedule.recurring || false}
                    onChange={(e) =>
                      setNewSchedule((prev) => ({
                        ...prev,
                        recurring: e.target.checked,
                      }))
                    }
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label
                    htmlFor="recurring"
                    className="block ml-2 text-sm text-gray-700"
                  >
                    반복 일정
                  </label>
                </div>

                {/* 버튼 */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 px-4 py-2 text-gray-700 transition-colors bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    disabled={createScheduleMutation.isPending}
                    className="flex-1 px-4 py-2 text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {createScheduleMutation.isPending ? "추가 중..." : "추가"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* 수업 등록 모달 */}
      {showEnrollModal && (
        <ClassEnrollmentModal
          studentId={studentId}
          studentName={student.name}
          onClose={() => setShowEnrollModal(false)}
          onSuccess={() => {
            // 등록 성공 시 전체 시간표 새로고침
            queryClient.invalidateQueries({
              queryKey: fullScheduleKeys.byStudent(studentId),
            });
          }}
        />
      )}

      {/* 수업 구성 편집 모달 */}
      {showCompositionEditModal && selectedClassForEdit && (
        <ClassCompositionEditModal
          classStudentId={selectedClassForEdit.classStudentId}
          classId={selectedClassForEdit.classId}
          className={selectedClassForEdit.className}
          classColor={selectedClassForEdit.classColor}
          subjectName={selectedClassForEdit.subjectName}
          teacherName={selectedClassForEdit.teacherName}
          studentName={student.name}
          allCompositions={selectedClassForEdit.allCompositions}
          onClose={() => {
            setShowCompositionEditModal(false);
            setSelectedClassForEdit(null);
          }}
          onSuccess={() => {
            // 수정 성공 시 전체 시간표 새로고침
            queryClient.invalidateQueries({
              queryKey: fullScheduleKeys.byStudent(studentId),
            });
            setShowCompositionEditModal(false);
            setSelectedClassForEdit(null);
          }}
        />
      )}
    </div>
  );
}
