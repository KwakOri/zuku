"use client";

import { useState, useMemo } from "react";
import { Search, X, UserPlus, Users, CheckCircle } from "lucide-react";
import { Tables } from "@/types/supabase";
import { useStudentsByClass, useEnrollStudent } from "@/queries/useClassStudents";
import { useQuery } from "@tanstack/react-query";
import { getGrade } from "@/lib/utils";

type Student = Tables<"students">;
type ClassComposition = Tables<"class_composition">;

interface ClassStudentPanelProps {
  classId: string;
  compositionId: string | null;
  className: string;
  composition: ClassComposition | null;
  onClose: () => void;
}

export default function ClassStudentPanel({
  classId,
  compositionId,
  className,
  composition,
  onClose,
}: ClassStudentPanelProps) {
  const [searchQuery, setSearchQuery] = useState("");

  // 이 수업에 등록된 학생들 조회
  const { data: enrolledStudents = [], isLoading: isLoadingEnrolled } = useStudentsByClass(classId);

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

  // 학생 등록 mutation
  const enrollStudent = useEnrollStudent();

  // 이미 등록된 학생 ID 목록
  const enrolledStudentIds = useMemo(
    () => new Set(enrolledStudents.map((es) => es.student_id)),
    [enrolledStudents]
  );

  // 검색 필터링된 전체 학생 목록 (등록되지 않은 학생만)
  const filteredAvailableStudents = useMemo(() => {
    return allStudents.filter((student) => {
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
  }, [allStudents, enrolledStudentIds, searchQuery]);

  // 이 시간대에 등록된 학생 목록
  const studentsInThisComposition = useMemo(() => {
    if (!compositionId) return [];
    return enrolledStudents.filter((es) => es.composition_id === compositionId);
  }, [enrolledStudents, compositionId]);

  const handleEnrollStudent = async (studentId: string) => {
    try {
      await enrollStudent.mutateAsync({
        class_id: classId,
        student_id: studentId,
        composition_id: compositionId,
        enrolled_date: new Date().toISOString().split("T")[0],
        status: "active",
      });
    } catch (error) {
      console.error("Failed to enroll student:", error);
    }
  };

  const getDayOfWeekLabel = (dayOfWeek: number) => {
    return ["일", "월", "화", "수", "목", "금", "토"][dayOfWeek];
  };

  return (
    <div className="flex flex-col flex-1 min-w-0 min-h-0">
      <div className="flex flex-col flex-1 min-h-0 p-6 overflow-hidden border-0 flat-card rounded-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-5 h-5 text-primary-600" />
              <h3 className="text-lg font-semibold text-gray-800">{className}</h3>
            </div>
            {composition && (
              <p className="text-sm text-gray-600">
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

        {/* Enrolled Students Section */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <h4 className="text-sm font-semibold text-gray-700">
              등록된 학생 ({studentsInThisComposition.length}명)
            </h4>
          </div>
          <div className="p-4 space-y-2 border border-gray-200 rounded-lg bg-gray-50">
            {isLoadingEnrolled ? (
              <div className="py-8 text-center">
                <div className="w-6 h-6 mx-auto border-b-2 rounded-full animate-spin border-primary-600"></div>
              </div>
            ) : studentsInThisComposition.length === 0 ? (
              <p className="py-4 text-sm text-center text-gray-500">
                등록된 학생이 없습니다.
              </p>
            ) : (
              studentsInThisComposition.map((enrollment) => (
                <div
                  key={enrollment.id}
                  className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="font-medium text-gray-800">
                      {enrollment.student?.name}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      {enrollment.student?.grade && (
                        <span className="font-medium text-primary-600">
                          {getGrade(enrollment.student.grade, "half")}
                        </span>
                      )}
                      {enrollment.student?.school?.name && (
                        <>
                          <span>•</span>
                          <span>{enrollment.student.school.name}</span>
                        </>
                      )}
                      {enrollment.student?.phone && (
                        <>
                          <span>•</span>
                          <span>{enrollment.student.phone}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-center flex-shrink-0 w-6 h-6 bg-green-100 rounded-full">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Search Section */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-3">
            <UserPlus className="w-4 h-4 text-primary-600" />
            <h4 className="text-sm font-semibold text-gray-700">학생 추가</h4>
          </div>
          <div className="relative">
            <Search className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
            <input
              type="text"
              placeholder="이름, 학년, 연락처로 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full py-2 pl-10 pr-4 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Available Students List */}
        <div className="flex-1 min-h-0 overflow-y-auto">
          {isLoadingAll ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-6 h-6 border-b-2 rounded-full animate-spin border-primary-600"></div>
            </div>
          ) : filteredAvailableStudents.length === 0 ? (
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
            <div className="space-y-2">
              {filteredAvailableStudents.map((student) => (
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
                    disabled={enrollStudent.isPending}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white transition-all duration-200 bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg hover:from-primary-600 hover:to-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <UserPlus className="w-3 h-3" />
                    <span>추가</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
