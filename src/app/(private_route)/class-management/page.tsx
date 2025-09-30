"use client";

import CanvasSchedule from "@/components/common/schedule/CanvasSchedule";
import { useClasses } from "@/queries/useClasses";
import { ClassBlock } from "@/types/schedule";
import { Tables } from "@/types/supabase";
import { useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  Calendar,
  CheckCircle,
  Clock,
  Home,
  MapPin,
  Settings,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

type ClassRow = Tables<"classes">;
type ClassStudentRow = Tables<"class_students">;

interface ClassWithStudents extends ClassRow {
  students?: ClassStudentRow[];
  studentCount?: number;
}

export default function ClassManagementPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  // 수업 목록 조회
  const { data: classes = [], isLoading, error } = useClasses();

  // 선택된 수업 상태
  const [selectedClass, setSelectedClass] = useState<ClassWithStudents | null>(
    null
  );
  const [selectedClassStudents, setSelectedClassStudents] = useState<
    ClassStudentRow[]
  >([]);

  // 수업 필터 상태
  const [filterType, setFilterType] = useState<
    "all" | "scheduled" | "unscheduled"
  >("all");

  // 수업을 확정/미확정으로 분류
  const { scheduledClasses, unscheduledClasses, allClasses } = useMemo(() => {
    const scheduled = classes.filter(
      (cls) =>
        cls.day_of_week !== null &&
        cls.start_time !== null &&
        cls.end_time !== null
    );
    const unscheduled = classes.filter(
      (cls) =>
        cls.day_of_week === null ||
        cls.start_time === null ||
        cls.end_time === null
    );

    return {
      scheduledClasses: scheduled,
      unscheduledClasses: unscheduled,
      allClasses: classes,
    };
  }, [classes]);

  // 필터링된 수업 목록
  const filteredClasses = useMemo(() => {
    switch (filterType) {
      case "scheduled":
        return scheduledClasses;
      case "unscheduled":
        return unscheduledClasses;
      default:
        return allClasses;
    }
  }, [filterType, scheduledClasses, unscheduledClasses, allClasses]);

  // 선택된 수업의 학생 정보를 ClassBlock으로 변환
  const classBlocks: ClassBlock[] = useMemo(() => {
    if (!selectedClass) return [];

    // 수업이 시간표에 설정되어 있지 않으면 기본 시간 (월요일 18:00-19:30) 설정
    const dayOfWeek = selectedClass.day_of_week ?? 1; // 월요일
    const startTime = selectedClass.start_time ?? "18:00";
    const endTime = selectedClass.end_time ?? "19:30";

    return [
      {
        id: selectedClass.id,
        classId: selectedClass.id,
        title: selectedClass.title,
        subject: selectedClass.title,
        teacherName: "담당 강사", // TODO: 실제 강사 정보 연결
        startTime,
        endTime,
        dayOfWeek,
        color: selectedClass.color,
        room: selectedClass.room || undefined,
        studentCount: selectedClassStudents.length,
        maxStudents: selectedClass.max_students || 20,
        isException: false,
      },
    ];
  }, [selectedClass, selectedClassStudents]);

  // 수업 클릭 핸들러
  const handleClassClick = async (cls: ClassWithStudents) => {
    setSelectedClass(cls);

    // 해당 수업의 학생 목록 조회
    try {
      const response = await fetch(`/api/class-students?class_id=${cls.id}`);
      if (response.ok) {
        const data = await response.json();
        setSelectedClassStudents(data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch class students:", error);
      setSelectedClassStudents([]);
    }
  };

  // 시간표 블록 변경 핸들러
  const handleBlocksChange = async (updatedBlocks: ClassBlock[]) => {
    if (!selectedClass || updatedBlocks.length === 0) return;

    const updatedBlock = updatedBlocks[0]; // 선택된 수업 하나만 처리

    try {
      // 수업 시간 업데이트 API 호출
      const response = await fetch(`/api/classes/${selectedClass.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          day_of_week: updatedBlock.dayOfWeek,
          start_time: updatedBlock.startTime,
          end_time: updatedBlock.endTime,
          room: updatedBlock.room,
        }),
      });

      if (response.ok) {
        // 성공 시 캐시 무효화
        queryClient.invalidateQueries({ queryKey: ["classes"] });

        // 선택된 수업 정보도 업데이트
        setSelectedClass((prev) =>
          prev
            ? {
                ...prev,
                day_of_week: updatedBlock.dayOfWeek,
                start_time: updatedBlock.startTime,
                end_time: updatedBlock.endTime,
                room: updatedBlock.room || null,
              }
            : null
        );
      }
    } catch (error) {
      console.error("Failed to update class schedule:", error);
    }
  };

  // 뒤로 가기 핸들러
  const handleBack = () => {
    router.back();
  };

  // 로딩 상태
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">수업 목록을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-error-600">수업 목록을 불러오는데 실패했습니다.</p>
          <p className="text-gray-600 mt-1">{error.message}</p>
          <button
            onClick={handleBack}
            className="mt-4 px-4 py-2 flat-card bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-2xl hover:from-primary-600 hover:to-primary-700 transition-all duration-200"
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
      <header className="flat-surface bg-gray-50 border-0 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="p-2 flat-card text-gray-500 hover:text-gray-700 rounded-2xl hover:flat-pressed transition-all duration-200"
              >
                <Home className="w-5 h-5" />
              </Link>


              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl shadow-md">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-800">수업 관리</h1>
                  <p className="text-sm text-gray-600">수업 시간표를 설정하고 관리할 수 있습니다</p>
                </div>
              </div>
            </div>

            {/* 통계 정보 */}
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-lg font-bold text-gray-800">
                  {allClasses.length}
                </div>
                <div className="text-xs text-gray-500">전체 수업</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-success-600">
                  {scheduledClasses.length}
                </div>
                <div className="text-xs text-gray-500">시간 확정</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-warning-600">
                  {unscheduledClasses.length}
                </div>
                <div className="text-xs text-gray-500">시간 미확정</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* 좌측 패널 - 수업 목록 */}
          <div className="lg:col-span-1">
            {/* 필터 */}
            <div className="flat-card rounded-2xl border-0 p-4 mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                수업 필터
              </h3>
              <div className="space-y-2">
                {[
                  {
                    value: "all",
                    label: "전체 수업",
                    count: allClasses.length,
                    icon: Settings,
                  },
                  {
                    value: "scheduled",
                    label: "시간 확정",
                    count: scheduledClasses.length,
                    icon: CheckCircle,
                  },
                  {
                    value: "unscheduled",
                    label: "시간 미확정",
                    count: unscheduledClasses.length,
                    icon: AlertCircle,
                  },
                ].map((filter) => {
                  const Icon = filter.icon;
                  return (
                    <button
                      key={filter.value}
                      onClick={() =>
                        setFilterType(
                          filter.value as "all" | "scheduled" | "unscheduled"
                        )
                      }
                      className={`w-full text-left px-3 py-2 rounded-2xl text-sm transition-all duration-200 ${
                        filterType === filter.value
                          ? "flat-surface bg-primary-50 text-primary-700 border-0"
                          : "flat-card bg-neu-100 text-gray-700 hover:flat-pressed"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4" />
                          <span>{filter.label}</span>
                        </div>
                        <span className="text-xs">{filter.count}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 수업 목록 */}
            <div className="flat-card rounded-2xl border-0 p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                수업 목록
              </h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredClasses.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">
                    수업이 없습니다.
                  </p>
                ) : (
                  filteredClasses.map((cls) => {
                    const isScheduled =
                      cls.day_of_week !== null &&
                      cls.start_time !== null &&
                      cls.end_time !== null;
                    const isSelected = selectedClass?.id === cls.id;

                    return (
                      <div
                        key={cls.id}
                        onClick={() => handleClassClick(cls)}
                        className={`p-3 rounded-2xl cursor-pointer transition-all duration-200 ${
                          isSelected
                            ? "flat-surface bg-primary-50 border-0"
                            : "flat-card bg-neu-100 hover:flat-pressed"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: cls.color }}
                              />
                              <span className="font-medium text-sm text-gray-800">
                                {cls.title}
                              </span>
                              {isScheduled ? (
                                <CheckCircle className="w-4 h-4 text-success-500" />
                              ) : (
                                <AlertCircle className="w-4 h-4 text-warning-500" />
                              )}
                            </div>

                            {cls.description && (
                              <p className="text-xs text-gray-600 mb-2">
                                {cls.description}
                              </p>
                            )}

                            <div className="text-xs text-gray-600 space-y-1">
                              {isScheduled && (
                                <div className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {
                                    ["일", "월", "화", "수", "목", "금", "토"][
                                      cls.day_of_week!
                                    ]
                                  }{" "}
                                  {cls.start_time} - {cls.end_time}
                                </div>
                              )}
                              {cls.room && (
                                <div className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  {cls.room}
                                </div>
                              )}
                              <div className="flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                최대 {cls.max_students || 20}명
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* 우측 패널 - 시간표 */}
          <div className="lg:col-span-3">
            {selectedClass ? (
              <div>
                {/* 선택된 수업 정보 */}
                <div className="flat-card rounded-2xl border-0 p-4 mb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">
                        {selectedClass.title}
                      </h3>
                      <p className="text-sm text-gray-600">
                        수강생 {selectedClassStudents.length}명 / 최대{" "}
                        {selectedClass.max_students || 20}명
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: selectedClass.color }}
                      />
                      <span className="text-sm text-gray-600">
                        {selectedClass.day_of_week !== null &&
                        selectedClass.start_time
                          ? "시간 확정"
                          : "시간 미확정"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 시간표 */}
                <CanvasSchedule
                  key={`class-${selectedClass.id}-${selectedClassStudents.length}`}
                  customBlocks={classBlocks}
                  onBlocksChange={handleBlocksChange}
                  editMode="admin"
                  showDensity={true}
                />
              </div>
            ) : (
              <div className="flat-card rounded-2xl border-0 p-8 text-center">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-800 mb-2">
                  수업을 선택해주세요
                </h3>
                <p className="text-gray-500">
                  좌측 목록에서 수업을 클릭하면 시간표에서 수업 시간을 설정할 수
                  있습니다.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
