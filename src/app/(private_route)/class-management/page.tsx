"use client";

import ClassCompositionModal, {
  ClassCompositionFormData,
} from "@/components/class-management/ClassCompositionModal";
import SimpleClassForm from "@/components/class-management/SimpleClassForm";
import { PageHeader, PageLayout } from "@/components/common/layout";
import { useCreateClassComposition } from "@/queries/useClassComposition";
import { useClasses } from "@/queries/useClasses";
import type { StudentComprehensiveSchedule } from "@/types/comprehensiveSchedule";
import { Calendar, Clock, Plus, Settings } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

type TabType = "create" | "assign" | "manage";

export default function ClassManagementPage() {
  const router = useRouter();

  // Tab state
  const [activeTab, setActiveTab] = useState<TabType>("create");

  // Selected class for time assignment
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Data queries
  const { data: classes = [], isLoading, error } = useClasses();

  // Mutations
  const createComposition = useCreateClassComposition();

  // All classes (no need to filter by schedule status anymore)
  const allClasses = classes;

  // Find selected class
  const selectedClass = classes.find((c) => c.id === selectedClassId);

  // Convert selected class to StudentComprehensiveSchedule format for CanvasScheduleTable
  const canvasScheduleData = useMemo((): StudentComprehensiveSchedule[] => {
    if (
      !selectedClass ||
      !selectedClass.class_composition ||
      selectedClass.class_composition.length === 0
    ) {
      return [];
    }

    // Create a single row representing the class schedule
    // 요일 인덱스: 월(0), 화(1), 수(2), 목(3), 금(4), 토(5), 일(6)
    const weeklySchedule = Array.from({ length: 7 }, (_, dayIndex) => {
      const dayCompositions = (selectedClass.class_composition || []).filter(
        (comp: { day_of_week: number }) => comp.day_of_week === dayIndex
      );

      return {
        day: dayIndex,
        schedules: dayCompositions.map(
          (comp: {
            start_time: string;
            end_time: string;
            type: string | null;
          }) => ({
            title: selectedClass.title,
            startTime: comp.start_time.substring(0, 5), // HH:MM format
            endTime: comp.end_time.substring(0, 5), // HH:MM format
            color: selectedClass.color,
            type: comp.type || undefined,
          })
        ),
      };
    });

    return [
      {
        student: {
          id: "class-" + selectedClass.id, // Dummy UUID
          name: selectedClass.title,
          grade: 0,
        },
        school: selectedClass.subject?.subject_name || "",
        weeklySchedule,
      },
    ];
  }, [selectedClass]);

  const handleBack = () => {
    router.back();
  };

  const handleAddTimeSlot = () => {
    if (!selectedClass) return;
    setIsModalOpen(true);
  };

  const handleSubmitTimeSlot = async (data: ClassCompositionFormData) => {
    try {
      await createComposition.mutateAsync(data);
      setIsModalOpen(false);
    } catch (error) {
      // Error handled by React Query hook with toast
      console.error("Failed to create time slot:", error);
    }
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
        </div>

        {activeTab === "create" ? (
          /* CREATE TAB - Simple Class Creation */
          <div className="flex-1 w-full py-8 overflow-y-auto">
            <SimpleClassForm />
          </div>
        ) : activeTab === "assign" ? (
          /* ASSIGN TAB - Time Assignment */
          <div className="grid flex-1 min-h-0 grid-cols-1 gap-8 lg:grid-cols-4">
            {/* Panel 1 - Class List (1/4) */}
            <div className="flex flex-col min-h-0 lg:col-span-1">
              <div className="flex flex-col flex-1 min-h-0 p-6 border-0 flat-card rounded-2xl">
                <h3 className="mb-4 text-lg font-semibold text-gray-800">
                  수업 목록
                </h3>
                <div className="flex-1 min-h-0 space-y-2 overflow-y-auto">
                  {classes.length === 0 ? (
                    <p className="py-4 text-sm text-center text-gray-500">
                      등록된 수업이 없습니다.
                    </p>
                  ) : (
                    classes.map((cls) => (
                      <div
                        key={cls.id}
                        onClick={() => setSelectedClassId(cls.id)}
                        className={`p-3 transition-colors border rounded-lg cursor-pointer ${
                          selectedClassId === cls.id
                            ? "border-primary-500 bg-primary-50"
                            : "border-gray-200 hover:border-primary-500 hover:bg-primary-50"
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: cls.color }}
                          />
                          <span className="text-sm font-medium text-gray-800">
                            {cls.title}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600">
                          {cls.split_type === "split"
                            ? "앞/뒤타임 수업"
                            : "단일 수업"}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Panel 2 - Time Slots List (1/4) */}
            <div className="flex flex-col min-h-0 lg:col-span-1">
              <div className="flex flex-col flex-1 min-h-0 p-6 border-0 flat-card rounded-2xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">
                    시간 목록
                  </h3>
                  {selectedClass && (
                    <button
                      onClick={handleAddTimeSlot}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm text-white transition-all duration-200 bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg hover:from-primary-600 hover:to-primary-700"
                    >
                      <Plus className="w-4 h-4" />
                      <span>추가</span>
                    </button>
                  )}
                </div>

                {!selectedClass ? (
                  <p className="py-8 text-sm text-center text-gray-500">
                    좌측에서 수업을 선택하세요
                  </p>
                ) : (
                  <div className="flex-1 min-h-0 overflow-y-auto">
                    {!selectedClass.class_composition ||
                    selectedClass.class_composition.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <Clock className="w-12 h-12 mb-3 text-gray-400" />
                        <p className="text-sm font-medium text-gray-700">
                          아직 시간표가 없습니다
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                          위의 '추가' 버튼을 눌러 시간표를 생성하세요
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {selectedClass.class_composition.map((comp: any) => (
                          <div
                            key={comp.id}
                            className="p-3 transition-colors border border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50"
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium text-gray-800">
                                {
                                  ["일", "월", "화", "수", "목", "금", "토"][
                                    comp.day_of_week
                                  ]
                                }
                                요일
                              </span>
                              {comp.type && (
                                <span className="px-2 py-0.5 text-xs font-medium text-primary-700 bg-primary-100 rounded">
                                  {comp.type === "class"
                                    ? "정규 수업"
                                    : comp.type === "clinic"
                                    ? "클리닉"
                                    : "전체"}
                                </span>
                              )}
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

            {/* Panel 3-4 - Timetable (2/4) */}
            <div className="flex flex-col min-h-0 lg:col-span-2">
              <div className="flex flex-col flex-1 min-h-0 p-6 border-0 flat-card rounded-2xl">
                <h3 className="mb-4 text-lg font-semibold text-gray-800">
                  시간표
                </h3>
                {!selectedClass ? (
                  <div className="flex items-center justify-center flex-1 text-sm text-center text-gray-500">
                    <div>
                      <Clock className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                      <p>좌측에서 수업을 선택하세요</p>
                    </div>
                  </div>
                ) : !selectedClass.class_composition ||
                  selectedClass.class_composition.length === 0 ? (
                  <div className="flex items-center justify-center flex-1 text-sm text-center text-gray-500">
                    <div>
                      <Clock className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                      <p>이 수업에는 아직 시간표가 없습니다</p>
                      <p className="mt-1 text-xs text-gray-400">
                        시간 목록에서 추가 버튼을 눌러 시간표를 생성하세요
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 min-h-0 overflow-auto">
                    <ClassScheduleCanvas schedules={canvasScheduleData} />
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* MANAGE TAB - Existing Class Management */
          <div className="p-8 text-center border-0 flat-card rounded-2xl">
            <Settings className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <h3 className="mb-2 text-lg font-medium text-gray-800">
              기존 수업 관리
            </h3>
            <p className="text-gray-500">이 탭은 추후 구현될 예정입니다.</p>
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
            split_type: selectedClass.split_type || "single",
          }}
        />
      )}
    </>
  );
}
