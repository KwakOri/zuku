"use client";

import { useState, useMemo } from "react";
import { Search, X, UserPlus, Users, CheckCircle, ArrowUpDown, Trash2 } from "lucide-react";
import { Tables } from "@/types/supabase";
import { useEnrollStudent } from "@/queries/useClassStudents";
import { useEnrollComposition, useUnenrollComposition } from "@/queries/useStudentCompositions";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getGrade } from "@/lib/utils";

type Student = Tables<"students"> & {
  school?: Pick<Tables<"schools">, "id" | "name" | "level"> | null;
};
type ClassComposition = Tables<"class_composition">;
type Class = Tables<"classes">;

// Type for the response from /api/student-compositions
interface CompositionStudent extends Tables<"compositions_students"> {
  class?: Pick<Tables<"classes">, "id" | "title"> & {
    subject?: Pick<Tables<"subjects">, "id" | "subject_name"> | null;
    teacher?: Pick<Tables<"teachers">, "id" | "name"> | null;
  } | null;
  student?: Pick<Tables<"students">, "id" | "name" | "grade" | "phone" | "email"> & {
    school?: Pick<Tables<"schools">, "id" | "name"> | null;
  } | null;
  composition?: Pick<Tables<"class_composition">, "id" | "day_of_week" | "start_time" | "end_time" | "type" | "class_id"> | null;
}

interface ClassStudentPanelProps {
  classId: string;
  compositionId: string | null;
  className: string;
  composition: ClassComposition | null;
  classData: Class | null; // 앞/뒤타임 체크를 위한 전체 수업 데이터
  allCompositions: ClassComposition[]; // 해당 수업의 모든 시간대
  onClose: () => void;
}

export default function ClassStudentPanel({
  classId,
  compositionId,
  className,
  composition,
  classData,
  allCompositions,
  onClose,
}: ClassStudentPanelProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const queryClient = useQueryClient();

  // 정렬 상태
  type SortField = "name" | "school" | "grade";
  type SortOrder = "asc" | "desc";
  const [sortField, setSortField] = useState<SortField>("grade");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

  // 🎯 심플하게: composition_id로 compositions_students를 직접 조회하여 학생 목록 가져오기
  const { data: compositionStudents = [], isLoading: isLoadingEnrolled } = useQuery<CompositionStudent[]>({
    queryKey: ["composition-students", compositionId],
    queryFn: async () => {
      if (!compositionId) return [];
      const response = await fetch(`/api/student-compositions?composition_id=${compositionId}`);
      if (!response.ok) throw new Error("Failed to fetch composition students");
      const result = await response.json();
      return result.data || [];
    },
    enabled: !!compositionId,
  });

  // 이 시간대에 등록된 학생 ID 목록
  const enrolledStudentIds = useMemo(
    () => new Set(compositionStudents.map((cs) => cs.student_id)),
    [compositionStudents]
  );

  // 전체 학생 목록 조회
  const { data: allStudents = [], isLoading: isLoadingAll } = useQuery({
    queryKey: ["students"],
    queryFn: async () => {
      const response = await fetch("/api/students");
      if (!response.ok) throw new Error("Failed to fetch students");
      const result = await response.json();
      return result.data as Student[];
    },
  });

  // 해당 수업의 모든 학생 compositions 조회 (앞/뒤타임 체크용)
  const { data: allClassCompositions = [] } = useQuery<CompositionStudent[]>({
    queryKey: ["class-all-compositions", classId],
    queryFn: async () => {
      const response = await fetch(`/api/student-compositions?class_id=${classId}`);
      if (!response.ok) throw new Error("Failed to fetch class compositions");
      const result = await response.json();
      return result.data || [];
    },
    enabled: !!classId && classData?.split_type === "split",
  });

  // 학생 등록/삭제 mutations
  const enrollStudent = useEnrollStudent();
  const enrollComposition = useEnrollComposition();
  const unenrollComposition = useUnenrollComposition();

  // 이 시간대에 등록된 학생들의 상세 정보
  type StudentInComposition = NonNullable<CompositionStudent['student']>;
  const studentsInThisComposition = useMemo((): StudentInComposition[] => {
    return compositionStudents
      .map((cs) => cs.student)
      .filter((student): student is StudentInComposition => student !== null && student !== undefined);
  }, [compositionStudents]);

  // 앞/뒤타임 체크 로직
  const isSplitClass = classData?.split_type === "split";
  const currentCompositionType = composition?.type; // "class" or "clinic"

  // 같은 요일, 같은 시간대의 반대 타입 composition ID 찾기
  const oppositeCompositionIds = useMemo(() => {
    if (!isSplitClass || !currentCompositionType || !composition) return [];
    const oppositeType = currentCompositionType === "class" ? "clinic" : "class";

    // 같은 요일, 같은 시작 시간의 반대 타입만 찾기
    return allCompositions
      .filter((comp) =>
        comp.type === oppositeType &&
        comp.day_of_week === composition.day_of_week &&
        comp.start_time === composition.start_time
      )
      .map((comp) => comp.id);
  }, [isSplitClass, currentCompositionType, allCompositions, composition]);

  // 반대 타임만 등록하고 현재 타임은 등록하지 않은 학생 ID 찾기
  const partiallyEnrolledStudentIds = useMemo(() => {
    if (!isSplitClass || oppositeCompositionIds.length === 0 || !compositionId) return new Set<string>();

    const studentsByComposition = new Map<string, Set<string>>();

    allClassCompositions.forEach((cs) => {
      if (!studentsByComposition.has(cs.composition_id)) {
        studentsByComposition.set(cs.composition_id, new Set());
      }
      if (cs.student_id) {
        studentsByComposition.get(cs.composition_id)?.add(cs.student_id);
      }
    });

    // 현재 타임에 등록된 학생들
    const currentTimeStudents = studentsByComposition.get(compositionId) || new Set();

    // 모든 반대 타입 시간대에 등록된 학생들을 수집
    const allOppositeStudents = new Set<string>();
    oppositeCompositionIds.forEach((oppId) => {
      const oppStudents = studentsByComposition.get(oppId) || new Set();
      oppStudents.forEach((studentId) => allOppositeStudents.add(studentId));
    });

    // 반대 타임에는 있지만 현재 타임에는 없는 학생들만 추출
    const partialStudents = new Set<string>();
    allOppositeStudents.forEach((studentId) => {
      if (!currentTimeStudents.has(studentId)) {
        partialStudents.add(studentId);
      }
    });

    return partialStudents;
  }, [isSplitClass, oppositeCompositionIds, allClassCompositions, compositionId]);

  // 검색 필터링 및 정렬된 전체 학생 목록 (등록되지 않은 학생만)
  const { partiallyEnrolledStudents, regularAvailableStudents } = useMemo(() => {
    const filtered = allStudents.filter((student) => {
      // 이미 등록된 학생 제외
      if (enrolledStudentIds.has(student.id)) return false;

      // 검색어 필터링
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        student.name.toLowerCase().includes(query) ||
        student.grade?.toString().includes(query) ||
        student.phone?.toLowerCase().includes(query) ||
        student.email?.toLowerCase().includes(query)
      );
    });

    // 정렬 함수
    const sortStudents = (students: Student[]) => {
      return [...students].sort((a, b) => {
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
    };

    // 반대 타임만 등록한 학생과 일반 학생 분리
    const partial: Student[] = [];
    const regular: Student[] = [];

    filtered.forEach((student) => {
      if (partiallyEnrolledStudentIds.has(student.id)) {
        partial.push(student);
      } else {
        regular.push(student);
      }
    });

    return {
      partiallyEnrolledStudents: sortStudents(partial),
      regularAvailableStudents: sortStudents(regular),
    };
  }, [allStudents, enrolledStudentIds, searchQuery, sortField, sortOrder, partiallyEnrolledStudentIds]);

  const handleEnrollStudent = async (studentId: string) => {
    if (!compositionId) return;

    try {
      // 1단계: class_students 테이블에 학생-수업 관계 생성
      await enrollStudent.mutateAsync({
        class_id: classId,
        student_id: studentId,
        enrolled_date: new Date().toISOString().split("T")[0],
        status: "active",
      });

      // 2단계: compositions_students 테이블에 composition 등록
      await enrollComposition.mutateAsync({
        class_id: classId,
        student_id: studentId,
        composition_id: compositionId,
        enrolled_date: new Date().toISOString().split("T")[0],
        status: "active",
      });

      // 등록 성공 후 관련 쿼리 캐시 초기화
      await queryClient.invalidateQueries({
        queryKey: ["composition-students", compositionId],
      });
      await queryClient.invalidateQueries({
        queryKey: ["class-all-compositions", classId],
      });
      await queryClient.invalidateQueries({
        queryKey: ["students"],
      });
    } catch (error) {
      console.error("Failed to enroll student:", error);
    }
  };

  const handleUnenrollStudent = async (compositionStudentId: string) => {
    if (!compositionId) return;

    try {
      // compositions_students 테이블에서 삭제
      await unenrollComposition.mutateAsync(compositionStudentId);

      // 삭제 성공 후 관련 쿼리 캐시 초기화
      await queryClient.invalidateQueries({
        queryKey: ["composition-students", compositionId],
      });
      await queryClient.invalidateQueries({
        queryKey: ["class-all-compositions", classId],
      });
      await queryClient.invalidateQueries({
        queryKey: ["students"],
      });
    } catch (error) {
      console.error("Failed to unenroll student:", error);
    }
  };

  const getDayOfWeekLabel = (dayOfWeek: number) => {
    return ["일", "월", "화", "수", "목", "금", "토"][dayOfWeek];
  };

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
    <div className="flex flex-1 min-w-0 min-h-0 gap-6">
      {/* Left Panel - Available Students */}
      <div className="flex flex-col flex-1 min-h-0">
        <div className="flex flex-col flex-1 min-h-0 p-6 overflow-hidden border-0 flat-card rounded-2xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <UserPlus className="w-5 h-5 text-primary-600" />
                <h3 className="text-lg font-semibold text-gray-800">학생 추가</h3>
              </div>
              <p className="text-xs text-gray-500">
                {className} - {composition && getDayOfWeekLabel(composition.day_of_week)}요일{" "}
                {composition?.start_time.substring(0, 5)}
              </p>
            </div>
          </div>

          {/* Search Section */}
          <div className="mb-4">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                <input
                  type="text"
                  placeholder="이름, 학년, 연락처로 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full py-2 pl-10 pr-4 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              {/* 정렬 버튼들 */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => handleSort("name")}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                    sortField === "name"
                      ? "bg-primary-100 text-primary-700 font-medium"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                  title="이름순 정렬"
                >
                  <span>이름</span>
                  {sortField === "name" && <ArrowUpDown className="w-3 h-3" />}
                </button>
                <button
                  onClick={() => handleSort("school")}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                    sortField === "school"
                      ? "bg-primary-100 text-primary-700 font-medium"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                  title="학교순 정렬"
                >
                  <span>학교</span>
                  {sortField === "school" && <ArrowUpDown className="w-3 h-3" />}
                </button>
                <button
                  onClick={() => handleSort("grade")}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                    sortField === "grade"
                      ? "bg-primary-100 text-primary-700 font-medium"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                  title="학년순 정렬"
                >
                  <span>학년</span>
                  {sortField === "grade" && <ArrowUpDown className="w-3 h-3" />}
                </button>
              </div>
            </div>
          </div>

          {/* Available Students List */}
          <div className="flex-1 min-h-0 overflow-y-auto">
            {isLoadingAll ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-6 h-6 border-b-2 rounded-full animate-spin border-primary-600"></div>
              </div>
            ) : partiallyEnrolledStudents.length === 0 && regularAvailableStudents.length === 0 ? (
              <div className="py-12 text-center">
                <Users className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p className="text-sm font-medium text-gray-700">
                  {searchQuery
                    ? "검색 결과가 없습니다."
                    : "추가 가능한 학생이 없습니다."}
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  {searchQuery
                    ? "다른 검색어로 시도해보세요."
                    : "모든 학생이 이미 등록되었습니다."}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* 앞/뒤타임 미등록 학생 (상단) */}
                {partiallyEnrolledStudents.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 px-3 py-2 mb-2 rounded-lg bg-amber-50 border border-amber-200">
                      <span className="text-xs font-semibold text-amber-800">
                        ⚠️ {currentCompositionType === "class" ? "뒤타임만" : "앞타임만"} 등록된 학생
                      </span>
                    </div>
                    <div className="space-y-2">
                      {partiallyEnrolledStudents.map((student) => (
                        <div
                          key={student.id}
                          className="flex items-center gap-3 p-3 transition-colors border-2 border-amber-300 rounded-lg bg-amber-50 hover:border-amber-500 hover:bg-amber-100"
                        >
                          <div className="flex-1">
                            <div className="font-medium text-gray-800">{student.name}</div>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              {student.grade && (
                                <span className="font-medium text-primary-600">
                                  {getGrade(student.grade, "half")}
                                </span>
                              )}
                              {student.school?.name && (
                                <>
                                  <span>•</span>
                                  <span>{student.school.name}</span>
                                </>
                              )}
                              {student.phone && (
                                <>
                                  <span>•</span>
                                  <span>{student.phone}</span>
                                </>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => handleEnrollStudent(student.id)}
                            disabled={enrollStudent.isPending || enrollComposition.isPending}
                            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white transition-all duration-200 bg-gradient-to-r from-amber-500 to-amber-600 rounded-lg hover:from-amber-600 hover:to-amber-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <UserPlus className="w-3 h-3" />
                            <span>추가</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 일반 학생 목록 */}
                {regularAvailableStudents.length > 0 && (
                  <div>
                    {partiallyEnrolledStudents.length > 0 && (
                      <div className="mb-2 text-xs font-semibold text-gray-500 uppercase px-3">
                        전체 학생
                      </div>
                    )}
                    <div className="space-y-2">
                      {regularAvailableStudents.map((student) => (
                        <div
                          key={student.id}
                          className="flex items-center gap-3 p-3 transition-colors border border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50"
                        >
                          <div className="flex-1">
                            <div className="font-medium text-gray-800">{student.name}</div>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              {student.grade && (
                                <span className="font-medium text-primary-600">
                                  {getGrade(student.grade, "half")}
                                </span>
                              )}
                              {student.school?.name && (
                                <>
                                  <span>•</span>
                                  <span>{student.school.name}</span>
                                </>
                              )}
                              {student.phone && (
                                <>
                                  <span>•</span>
                                  <span>{student.phone}</span>
                                </>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => handleEnrollStudent(student.id)}
                            disabled={enrollStudent.isPending || enrollComposition.isPending}
                            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white transition-all duration-200 bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg hover:from-primary-600 hover:to-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <UserPlus className="w-3 h-3" />
                            <span>추가</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Panel - Enrolled Students */}
      <div className="flex flex-col flex-1 min-h-0">
        <div className="flex flex-col flex-1 min-h-0 p-6 overflow-hidden border-0 flat-card rounded-2xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Users className="w-5 h-5 text-green-600" />
                <h3 className="text-lg font-semibold text-gray-800">등록된 학생</h3>
              </div>
              {composition && (
                <p className="text-xs text-gray-600">
                  {getDayOfWeekLabel(composition.day_of_week)}요일{" "}
                  {composition.start_time.substring(0, 5)} - {composition.end_time.substring(0, 5)}
                  {composition.type && (
                    <span className="ml-2 text-xs font-medium text-primary-600">
                      ({composition.type === "class" ? "정규 수업" : "클리닉"})
                    </span>
                  )}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="flex items-center justify-center w-8 h-8 transition-colors rounded-lg hover:bg-gray-100"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Enrolled Students List */}
          <div className="flex-1 min-h-0 overflow-y-auto">
            <div className="flex items-center gap-2 px-3 py-2 mb-3 rounded-lg bg-green-50 border border-green-200">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm font-semibold text-green-800">
                총 {studentsInThisComposition.length}명
              </span>
            </div>

            {isLoadingEnrolled ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-6 h-6 border-b-2 rounded-full animate-spin border-primary-600"></div>
              </div>
            ) : studentsInThisComposition.length === 0 ? (
              <div className="py-12 text-center">
                <Users className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p className="text-sm font-medium text-gray-700">
                  등록된 학생이 없습니다.
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  왼쪽 패널에서 학생을 추가하세요.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {compositionStudents.map((cs) => {
                  const student = cs.student;
                  if (!student) return null;

                  return (
                    <div
                      key={cs.id}
                      className="flex items-center gap-3 p-3 transition-colors border border-green-200 rounded-lg bg-green-50 hover:border-red-300 hover:bg-red-50 group"
                    >
                      <div className="flex-1">
                        <div className="font-medium text-gray-800">
                          {student.name}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          {student.grade && (
                            <span className="font-medium text-primary-600">
                              {getGrade(student.grade, "half")}
                            </span>
                          )}
                          {student.school?.name && (
                            <>
                              <span>•</span>
                              <span>{student.school.name}</span>
                            </>
                          )}
                          {student.phone && (
                            <>
                              <span>•</span>
                              <span>{student.phone}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handleUnenrollStudent(cs.id)}
                        disabled={unenrollComposition.isPending}
                        className="flex items-center justify-center flex-shrink-0 w-8 h-8 transition-all duration-200 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="이 시간대에서 삭제"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
