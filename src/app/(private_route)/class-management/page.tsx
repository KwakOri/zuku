"use client";

import ClassCompositionModal, {
  ClassCompositionFormData,
} from "@/components/class-management/ClassCompositionModal";
import ClassStudentPanel from "@/components/class-management/ClassStudentPanel";
import ExamPeriodManagement from "@/components/class-management/ExamPeriodManagement";
import SimpleClassForm from "@/components/class-management/SimpleClassForm";
import { PageHeader, PageLayout } from "@/components/common/layout";
import CanvasSchedule from "@/components/common/schedule/CanvasSchedule";
import { DAYS_OF_WEEK } from "@/constants/schedule";
import { useCreateClassComposition } from "@/queries/useClassComposition";
import { useClasses } from "@/queries/useClasses";
import type { ClassBlock } from "@/types/schedule";
import { BookOpen, Calendar, Clock, Plus, Settings } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

type TabType = "create" | "assign" | "manage" | "exam-periods";

export default function ClassManagementPage() {
  const router = useRouter();

  // Tab state
  const [activeTab, setActiveTab] = useState<TabType>("create");

  // Selected class for time assignment
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);

  // Selected class for manage tab
  const [selectedManageClassId, setSelectedManageClassId] = useState<
    string | null
  >(null);

  // Filter for manage tab
  const [manageCourseTypeFilter, setManageCourseTypeFilter] = useState<
    "all" | "regular" | "school_exam"
  >("all");

  // Selected composition for student management
  const [selectedCompositionId, setSelectedCompositionId] = useState<
    string | null
  >(null);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Create tab filters
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("");
  const [selectedCourseType, setSelectedCourseType] = useState<
    "regular" | "school_exam" | ""
  >("");
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>("");

  // Data queries
  const { data: classes = [], isLoading, error } = useClasses();

  // Mutations
  const createComposition = useCreateClassComposition();

  // All classes (no need to filter by schedule status anymore)
  const allClasses = classes;

  // Find selected class
  const selectedClass = classes.find((c) => c.id === selectedClassId);

  // Find selected manage class
  const selectedManageClass = classes.find(
    (c) => c.id === selectedManageClassId
  );

  // Find selected composition
  const selectedComposition =
    selectedClass?.class_composition?.find(
      (comp) => comp.id === selectedCompositionId
    ) || null;

  // Convert selected class to ClassBlock format for CanvasSchedule (for assign tab)
  const classBlocks = useMemo((): ClassBlock[] => {
    if (
      !selectedClass ||
      !selectedClass.class_composition ||
      selectedClass.class_composition.length === 0
    ) {
      return [];
    }

    return selectedClass.class_composition.map((comp) => ({
      id: comp.id,
      classId: selectedClass.id,
      compositionId: comp.id,
      title: selectedClass.title,
      subject: selectedClass.subject?.subject_name || "",
      teacherName: selectedClass.teacher?.name || "",
      startTime: comp.start_time.substring(0, 5), // HH:MM format
      endTime: comp.end_time.substring(0, 5), // HH:MM format
      dayOfWeek: comp.day_of_week,
      color: selectedClass.color || "#3B82F6",
      room: selectedClass.room || undefined,
      studentCount: 0, // TODO: Get actual student count
      compositionType: comp.type,
    }));
  }, [selectedClass]);

  // Filter classes for create tab based on selected subject, course type, and teacher
  const filteredClasses = useMemo(() => {
    return classes.filter((cls) => {
      const subjectMatch =
        !selectedSubjectId || cls.subject_id === selectedSubjectId;
      const courseTypeMatch =
        !selectedCourseType || cls.course_type === selectedCourseType;
      const teacherMatch =
        !selectedTeacherId || cls.teacher_id === selectedTeacherId;
      return subjectMatch && courseTypeMatch && teacherMatch;
    });
  }, [classes, selectedSubjectId, selectedCourseType, selectedTeacherId]);

  // Filter classes for manage tab based on course type
  const filteredManageClasses = useMemo(() => {
    if (manageCourseTypeFilter === "all") {
      return classes;
    }
    return classes.filter((cls) => cls.course_type === manageCourseTypeFilter);
  }, [classes, manageCourseTypeFilter]);

  // Convert filtered classes to ClassBlock format for create tab
  const filteredClassBlocks = useMemo((): ClassBlock[] => {
    const blocks: ClassBlock[] = [];

    filteredClasses.forEach((cls) => {
      if (cls.class_composition && cls.class_composition.length > 0) {
        cls.class_composition.forEach((comp) => {
          blocks.push({
            id: comp.id,
            classId: cls.id,
            compositionId: comp.id,
            title: cls.title,
            subject: cls.subject?.subject_name || "",
            teacherName: cls.teacher?.name || "",
            startTime: comp.start_time.substring(0, 5),
            endTime: comp.end_time.substring(0, 5),
            dayOfWeek: comp.day_of_week,
            color: cls.color || "#3B82F6",
            room: cls.room || undefined,
            studentCount: 0,
            compositionType: comp.type,
          });
        });
      }
    });

    return blocks;
  }, [filteredClasses]);

  const handleBack = () => {
    router.back();
  };

  const handleAddTimeSlot = () => {
    if (!selectedClass) return;
    setIsModalOpen(true);
  };

  const handleSubmitTimeSlot = async (data: ClassCompositionFormData) => {
    await createComposition.mutateAsync(data);
    setIsModalOpen(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 mx-auto border-b-2 rounded-full animate-spin border-primary-600"></div>
          <p className="mt-2 text-gray-600">수업 목록을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <p className="text-error-600">수업 목록을 불러오는데 실패했습니다.</p>
          <p className="mt-1 text-gray-600">{error.message}</p>
          <button
            onClick={handleBack}
            className="px-4 py-2 mt-4 text-white transition-all duration-200 flat-card bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl hover:from-primary-600 hover:to-primary-700"
          >
            돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title="수업 관리"
        description="수업을 개설하고 시간표를 설정·관리할 수 있습니다"
        icon={Calendar}
        actions={
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-lg font-bold text-gray-800">
                {allClasses.length}
              </div>
              <div className="text-xs text-gray-500">전체 수업</div>
            </div>
          </div>
        }
      />

      <PageLayout hasTopSpacer={false}>
        {/* Tab Navigation */}
        <div className="flex gap-2 mb-8 border-b border-gray-200">
          <button
            onClick={() => setActiveTab("create")}
            className={`px-6 py-3 font-medium transition-all duration-200 border-b-2 ${
              activeTab === "create"
                ? "border-primary-600 text-primary-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <div className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              <span>수업 개설</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab("assign")}
            className={`px-6 py-3 font-medium transition-all duration-200 border-b-2 ${
              activeTab === "assign"
                ? "border-primary-600 text-primary-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>시간 배정</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab("manage")}
            className={`px-6 py-3 font-medium transition-all duration-200 border-b-2 ${
              activeTab === "manage"
                ? "border-primary-600 text-primary-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <div className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              <span>기존 수업 관리</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab("exam-periods")}
            className={`px-6 py-3 font-medium transition-all duration-200 border-b-2 ${
              activeTab === "exam-periods"
                ? "border-primary-600 text-primary-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              <span>내신기간 관리</span>
            </div>
          </button>
        </div>

        {activeTab === "create" ? (
          /* CREATE TAB - 3 Grid Layout */
          <div className="flex flex-1 min-h-0 gap-6">
            {/* Left Section - Class Creation Form */}
            <div
              className="flex flex-col flex-shrink-0 overflow-y-auto"
              style={{ width: "400px" }}
            >
              <SimpleClassForm
                onSubjectChange={setSelectedSubjectId}
                onCourseTypeChange={setSelectedCourseType}
                onTeacherChange={setSelectedTeacherId}
              />
            </div>

            {/* Right Section - Combined Schedule (2 grids wide) */}
            <div className="flex flex-col flex-1 min-w-0 min-h-0">
              <div className="flex flex-col flex-1 min-h-0 p-6 overflow-hidden border-0 flat-card rounded-2xl">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">
                    {selectedCourseType === "regular"
                      ? "정규수업 시간표"
                      : selectedCourseType === "school_exam"
                      ? "학교내신 시간표"
                      : "전체 시간표"}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {selectedSubjectId &&
                    selectedCourseType &&
                    selectedTeacherId
                      ? "선택한 조건의 수업 일정이 표시됩니다"
                      : "과목, 수업 유형, 담당 강사를 모두 선택하면 관련 시간표가 표시됩니다"}
                  </p>
                </div>
                {selectedSubjectId &&
                selectedCourseType &&
                selectedTeacherId ? (
                  <div className="flex-1 min-h-0">
                    <CanvasSchedule
                      customBlocks={filteredClassBlocks}
                      editMode="view"
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-center flex-1 text-center">
                    <div>
                      <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                      <p className="text-sm text-gray-600">
                        과목, 수업 유형, 담당 강사를
                      </p>
                      <p className="text-sm text-gray-600">
                        모두 선택하면 관련 시간표가 표시됩니다
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : activeTab === "assign" ? (
          /* ASSIGN TAB - Time Assignment */
          !selectedClass ? (
            /* Show Class List Only */
            <div className="flex flex-col flex-1 min-h-0">
              <div className="flex flex-col flex-1 min-h-0 p-8 border-0 flat-card rounded-2xl">
                <h3 className="mb-6 text-2xl font-semibold text-gray-800">
                  수업 목록
                </h3>
                <div className="grid flex-1 grid-cols-1 gap-4 pt-2 overflow-y-auto md:grid-cols-2 lg:grid-cols-3 auto-rows-min">
                  {classes.length === 0 ? (
                    <div className="col-span-full">
                      <p className="py-16 text-base text-center text-gray-500">
                        등록된 수업이 없습니다.
                      </p>
                    </div>
                  ) : (
                    classes.map((cls) => (
                      <div
                        key={cls.id}
                        onClick={() => setSelectedClassId(cls.id)}
                        className="flex flex-col h-full p-6 transition-all duration-200 border border-gray-200 cursor-pointer rounded-xl hover:border-primary-500 hover:bg-primary-50 hover:shadow-lg hover:-translate-y-1"
                      >
                        <div className="flex items-start gap-3 mb-4">
                          <div
                            className="w-6 h-6 rounded-full flex-shrink-0 mt-0.5"
                            style={{ backgroundColor: cls.color }}
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="mb-1 text-lg font-semibold text-gray-800 break-words">
                              {cls.title}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {cls.subject?.subject_name || "과목 미지정"}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-col gap-2 mt-auto">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <span className="font-medium">유형:</span>
                            <span>
                              {cls.split_type === "split"
                                ? "앞/뒤타임 수업"
                                : "단일 수업"}
                            </span>
                          </div>
                          {cls.teacher && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <span className="font-medium">강사:</span>
                              <span>{cls.teacher.name}</span>
                            </div>
                          )}
                          {cls.class_composition &&
                            cls.class_composition.length > 0 && (
                              <div className="flex items-center gap-2 pt-2 mt-2 text-sm border-t border-gray-200">
                                <span className="font-semibold text-primary-600">
                                  {cls.class_composition.length}개 시간대 배정됨
                                </span>
                              </div>
                            )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* Show Selected Class Details */
            <div className="flex flex-1 min-h-0 gap-6">
              {/* Left Panel - Time Slots List (Fixed Width) */}
              <div
                className="flex flex-col flex-shrink-0"
                style={{ width: "400px" }}
              >
                <div className="flex flex-col flex-1 min-h-0 p-6 border-0 flat-card rounded-2xl">
                  <div className="flex items-center gap-2 mb-4">
                    <button
                      onClick={() => setSelectedClassId(null)}
                      className="flex items-center justify-center w-8 h-8 transition-colors rounded-lg hover:bg-gray-100"
                    >
                      <span className="text-gray-600">←</span>
                    </button>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-800">
                        {selectedClass.title}
                      </h3>
                      <p className="text-xs text-gray-500">시간대 목록</p>
                    </div>
                    <button
                      onClick={handleAddTimeSlot}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm text-white transition-all duration-200 bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg hover:from-primary-600 hover:to-primary-700"
                    >
                      <Plus className="w-4 h-4" />
                      <span>추가</span>
                    </button>
                  </div>

                  <div className="flex-1 min-h-0 overflow-y-auto">
                    {!selectedClass.class_composition ||
                    selectedClass.class_composition.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <Clock className="w-12 h-12 mb-3 text-gray-400" />
                        <p className="text-sm font-medium text-gray-700">
                          아직 시간표가 없습니다
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                          {`위의 '추가' 버튼을 눌러 시간표를 생성하세요`}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {/* 정규 수업 섹션 */}
                        {selectedClass.class_composition.filter(
                          (comp) => comp.type === "class"
                        ).length > 0 && (
                          <div>
                            <h4 className="mb-2 text-xs font-semibold text-gray-500 uppercase">
                              정규 수업
                            </h4>
                            <div className="space-y-2">
                              {selectedClass.class_composition
                                .filter((comp) => comp.type === "class")
                                .sort(
                                  (a, b) =>
                                    a.day_of_week - b.day_of_week ||
                                    a.start_time.localeCompare(b.start_time)
                                )
                                .map((comp) => (
                                  <div
                                    key={comp.id}
                                    onClick={() =>
                                      setSelectedCompositionId(comp.id)
                                    }
                                    className={`p-3 transition-colors border rounded-lg cursor-pointer ${
                                      selectedCompositionId === comp.id
                                        ? "border-primary-600 bg-primary-100"
                                        : "border-gray-200 hover:border-primary-500 hover:bg-primary-50"
                                    }`}
                                  >
                                    <div className="flex items-center justify-between mb-1">
                                      <span className="text-sm font-medium text-gray-800">
                                        {DAYS_OF_WEEK[comp.day_of_week]}
                                        요일
                                      </span>
                                    </div>
                                    <p className="text-xs text-gray-600">
                                      {comp.start_time?.substring(0, 5)} -{" "}
                                      {comp.end_time?.substring(0, 5)}
                                    </p>
                                  </div>
                                ))}
                            </div>
                          </div>
                        )}

                        {/* 클리닉 섹션 */}
                        {selectedClass.class_composition.filter(
                          (comp) => comp.type === "clinic"
                        ).length > 0 && (
                          <div>
                            <h4 className="mb-2 text-xs font-semibold text-gray-500 uppercase">
                              클리닉
                            </h4>
                            <div className="space-y-2">
                              {selectedClass.class_composition
                                .filter((comp) => comp.type === "clinic")
                                .sort(
                                  (a, b) =>
                                    a.day_of_week - b.day_of_week ||
                                    a.start_time.localeCompare(b.start_time)
                                )
                                .map((comp) => (
                                  <div
                                    key={comp.id}
                                    onClick={() =>
                                      setSelectedCompositionId(comp.id)
                                    }
                                    className={`p-3 transition-colors border rounded-lg cursor-pointer ${
                                      selectedCompositionId === comp.id
                                        ? "border-primary-600 bg-primary-100"
                                        : "border-gray-200 hover:border-primary-500 hover:bg-primary-50"
                                    }`}
                                  >
                                    <div className="flex items-center justify-between mb-1">
                                      <span className="text-sm font-medium text-gray-800">
                                        {DAYS_OF_WEEK[comp.day_of_week]}
                                        요일
                                      </span>
                                    </div>
                                    <p className="text-xs text-gray-600">
                                      {comp.start_time?.substring(0, 5)} -{" "}
                                      {comp.end_time?.substring(0, 5)}
                                    </p>
                                  </div>
                                ))}
                            </div>
                          </div>
                        )}

                        {/* 타입이 없는 시간대 (단일 수업) */}
                        {selectedClass.class_composition.filter(
                          (comp) => !comp.type
                        ).length > 0 && (
                          <div className="space-y-2">
                            {selectedClass.class_composition
                              .filter((comp) => !comp.type)
                              .sort(
                                (a, b) =>
                                  a.day_of_week - b.day_of_week ||
                                  a.start_time.localeCompare(b.start_time)
                              )
                              .map((comp) => (
                                <div
                                  key={comp.id}
                                  onClick={() =>
                                    setSelectedCompositionId(comp.id)
                                  }
                                  className={`p-3 transition-colors border rounded-lg cursor-pointer ${
                                    selectedCompositionId === comp.id
                                      ? "border-primary-600 bg-primary-100"
                                      : "border-gray-200 hover:border-primary-500 hover:bg-primary-50"
                                  }`}
                                >
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="text-sm font-medium text-gray-800">
                                      {
                                        [
                                          "일",
                                          "월",
                                          "화",
                                          "수",
                                          "목",
                                          "금",
                                          "토",
                                        ][comp.day_of_week]
                                      }
                                      요일
                                    </span>
                                  </div>
                                  <p className="text-xs text-gray-600">
                                    {comp.start_time?.substring(0, 5)} -{" "}
                                    {comp.end_time?.substring(0, 5)}
                                  </p>
                                </div>
                              ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Panel - Timetable or Student Panel (Flexible Width) */}
              {selectedCompositionId ? (
                <ClassStudentPanel
                  classId={selectedClass.id}
                  compositionId={selectedCompositionId}
                  className={selectedClass.title}
                  composition={selectedComposition}
                  classData={selectedClass}
                  allCompositions={selectedClass.class_composition || []}
                  onClose={() => setSelectedCompositionId(null)}
                />
              ) : (
                <div className="flex flex-col flex-1 min-w-0 min-h-0">
                  <div className="flex flex-col flex-1 min-h-0 p-6 overflow-hidden border-0 flat-card rounded-2xl">
                    <h3 className="mb-4 text-lg font-semibold text-gray-800">
                      시간표
                    </h3>
                    {!selectedClass.class_composition ||
                    selectedClass.class_composition.length === 0 ? (
                      <div className="flex items-center justify-center flex-1 text-sm text-center text-gray-500">
                        <div>
                          <Clock className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                          <p>이 수업에는 아직 시간표가 없습니다</p>
                          <p className="mt-1 text-xs text-gray-400">
                            좌측 시간 목록에서 추가 버튼을 눌러 시간표를
                            생성하세요
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex-1 min-h-0">
                        <CanvasSchedule
                          customBlocks={classBlocks}
                          editMode="view"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )
        ) : activeTab === "manage" ? (
          /* MANAGE TAB - Existing Class Management */
          <div className="grid flex-1 min-h-0 grid-cols-3 gap-6">
            {/* Left Section - Edit Form (1 column) */}
            <div className="col-span-1 overflow-y-auto">
              {selectedManageClass ? (
                <SimpleClassForm
                  editingClass={selectedManageClass}
                  onEditComplete={() => setSelectedManageClassId(null)}
                />
              ) : (
                <div className="flex items-center justify-center h-full p-8 text-center border-0 flat-card rounded-2xl">
                  <div>
                    <Settings className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <h3 className="mb-2 text-lg font-medium text-gray-800">
                      수업을 선택하세요
                    </h3>
                    <p className="text-sm text-gray-500">
                      우측 목록에서 수정할 수업을 선택하세요
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Right Section - Class List (2 columns) */}
            <div className="col-span-2 overflow-y-auto">
              <div className="p-6 border-0 flat-card rounded-2xl">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-800">
                    수업 목록
                  </h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setManageCourseTypeFilter("all")}
                      className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                        manageCourseTypeFilter === "all"
                          ? "bg-gradient-to-br from-primary-500 to-primary-600 text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      전체
                    </button>
                    <button
                      onClick={() => setManageCourseTypeFilter("regular")}
                      className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                        manageCourseTypeFilter === "regular"
                          ? "bg-gradient-to-br from-primary-500 to-primary-600 text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      정규수업
                    </button>
                    <button
                      onClick={() => setManageCourseTypeFilter("school_exam")}
                      className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                        manageCourseTypeFilter === "school_exam"
                          ? "bg-gradient-to-br from-primary-500 to-primary-600 text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      학교내신
                    </button>
                  </div>
                </div>
                {classes.length === 0 ? (
                  <p className="py-16 text-center text-gray-500">
                    등록된 수업이 없습니다.
                  </p>
                ) : filteredManageClasses.length === 0 ? (
                  <p className="py-16 text-center text-gray-500">
                    해당 조건의 수업이 없습니다.
                  </p>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    {filteredManageClasses.map((cls) => (
                      <button
                        key={cls.id}
                        onClick={() => setSelectedManageClassId(cls.id)}
                        className={`p-5 text-left transition-all duration-200 border-2 rounded-xl ${
                          selectedManageClassId === cls.id
                            ? "border-primary-500 bg-primary-50 shadow-md"
                            : "border-gray-200 hover:border-primary-300 hover:bg-primary-25 hover:shadow-sm"
                        }`}
                      >
                        <div className="flex items-start gap-3 mb-3">
                          <div
                            className="w-5 h-5 rounded-full flex-shrink-0 mt-0.5"
                            style={{ backgroundColor: cls.color }}
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="mb-1 text-base font-semibold text-gray-800 break-words">
                              {cls.title}
                            </h4>
                          </div>
                        </div>
                        <div className="space-y-1 ml-8">
                          <p className="text-sm text-gray-600">
                            {cls.subject?.subject_name || "과목 미지정"}
                          </p>
                          {cls.teacher && (
                            <p className="text-sm text-gray-500">
                              강사: {cls.teacher.name}
                            </p>
                          )}
                          <div className="flex items-center gap-2 pt-2">
                            <span
                              className={`px-2 py-1 text-xs rounded-md ${
                                cls.course_type === "regular"
                                  ? "bg-blue-100 text-blue-700"
                                  : "bg-purple-100 text-purple-700"
                              }`}
                            >
                              {cls.course_type === "regular"
                                ? "정규수업"
                                : "학교내신"}
                            </span>
                            <span className="px-2 py-1 text-xs rounded-md bg-gray-100 text-gray-700">
                              {cls.split_type === "split"
                                ? "앞/뒤타임"
                                : "단일수업"}
                            </span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* EXAM PERIODS TAB - Exam Period Management */
          <div className="flex flex-col flex-1 min-h-0 border-0 flat-card rounded-2xl">
            <ExamPeriodManagement />
          </div>
        )}
      </PageLayout>

      {/* Time Slot Modal */}
      {selectedClass && (
        <ClassCompositionModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleSubmitTimeSlot}
          classData={{
            id: selectedClass.id,
            title: selectedClass.title,
            split_type: (selectedClass.split_type || "single") as
              | "split"
              | "single",
          }}
        />
      )}
    </>
  );
}
