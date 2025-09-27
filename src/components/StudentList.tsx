"use client";

import { getGrade } from "@/lib/utils";
import { Tables } from "@/types/supabase";
import { useStudents } from "@/queries/useStudents";
import {
  Calendar,
  ChevronDown,
  Edit3,
  Filter,
  GraduationCap,
  Mail,
  MessageSquare,
  Phone,
  Search,
  User,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useSendKakaoNotification } from "@/queries/useNotifications";

interface StudentListProps {
  onStudentSelect?: (student: Tables<"students">) => void;
  onStudentEdit?: (student: Tables<"students">) => void;
}

export default function StudentList({
  onStudentSelect,
  onStudentEdit,
}: StudentListProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGrade, setSelectedGrade] = useState<number | "all">("all");
  const [showFilters, setShowFilters] = useState(false);

  // API에서 학생 데이터 가져오기
  const { data: students = [], isLoading, error } = useStudents();

  // 알림톡 전송 mutation
  const sendNotification = useSendKakaoNotification();

  // 학년별 필터링된 학생 목록
  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const matchesSearch =
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.phone?.includes(searchTerm);

      const matchesGrade =
        selectedGrade === "all" || student.grade === selectedGrade;

      return matchesSearch && matchesGrade;
    });
  }, [searchTerm, selectedGrade, students]);

  // 학년별 그룹화
  const studentsByGrade = useMemo(() => {
    const groups: { [grade: number]: Tables<"students">[] } = {};
    filteredStudents.forEach((student) => {
      if (!groups[student.grade]) {
        groups[student.grade] = [];
      }
      groups[student.grade].push(student);
    });
    return groups;
  }, [filteredStudents]);

  // 전체 학년 목록
  const availableGrades = useMemo(() => {
    const grades = [...new Set(students.map((s) => s.grade))].sort(
      (a, b) => a - b
    );
    return grades;
  }, [students]);


  const getGradeColor = (grade: number) => {
    if (grade <= 9) return "bg-blue-50 text-blue-700 border-blue-200";
    return "bg-purple-50 text-purple-700 border-purple-200";
  };

  // 알림톡 전송 핸들러
  const handleSendNotification = (studentId: string, studentName: string) => {
    if (confirm(`${studentName} 학생의 학부모에게 알림톡을 전송하시겠습니까?`)) {
      sendNotification.mutate(studentId);
    }
  };

  // 로딩 상태
  if (isLoading) {
    return (
      <div className="w-full space-y-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
            <div className="h-12 bg-gray-200 rounded w-full"></div>
          </div>
        </div>
      </div>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <div className="w-full space-y-6">
        <div className="bg-white rounded-lg border border-red-200 p-6">
          <div className="text-center">
            <div className="text-red-600 mb-4">⚠️</div>
            <h3 className="text-lg font-medium text-red-900 mb-2">
              데이터를 불러오는 중 오류가 발생했습니다
            </h3>
            <p className="text-red-600 text-sm">{error.message}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* 헤더 */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <GraduationCap className="w-6 h-6 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">학생 관리</h1>
          </div>
          <div className="text-sm text-gray-500">
            총 {filteredStudents.length}명의 학생
          </div>
        </div>

        {/* 검색 및 필터 */}
        <div className="space-y-4">
          {/* 검색바 */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#2d2d2d]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="이름, 이메일, 전화번호로 검색..."
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-400"
            />
          </div>

          {/* 필터 섹션 */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-[#2d2d2d]"
            >
              <Filter className="w-4 h-4" />
              <span>필터</span>
              <ChevronDown
                className={`w-4 h-4 transition-transform ${
                  showFilters ? "rotate-180" : ""
                }`}
              />
            </button>

            {selectedGrade !== "all" && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">필터:</span>
                <div
                  className={`px-3 py-1 rounded-full text-xs border ${getGradeColor(
                    selectedGrade as number
                  )}`}
                >
                  {getGrade(selectedGrade as number, "half")}
                </div>
                <button
                  onClick={() => setSelectedGrade("all")}
                  className="text-sm text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            )}
          </div>

          {/* 필터 옵션 */}
          {showFilters && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-700">
                  학년별 필터
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedGrade("all")}
                    className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                      selectedGrade === "all"
                        ? "bg-blue-100 text-blue-700 border-blue-300"
                        : "bg-white text-gray-700 border-gray-200 hover:bg-gray-100"
                    }`}
                  >
                    전체
                  </button>
                  {availableGrades.map((grade) => (
                    <button
                      key={grade}
                      onClick={() => setSelectedGrade(grade)}
                      className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                        selectedGrade === grade
                          ? `${getGradeColor(grade)
                              .replace("bg-", "bg-")
                              .replace("text-", "text-")
                              .replace("border-", "border-")}`
                          : "bg-white text-gray-700 border-gray-200 hover:bg-gray-100"
                      }`}
                    >
                      {getGrade(grade, "half")}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 학생 목록 */}
      <div className="space-y-6">
        {Object.keys(studentsByGrade).length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              검색 결과가 없습니다
            </h3>
            <p className="text-gray-500">다른 검색어나 필터를 시도해보세요.</p>
          </div>
        ) : (
          Object.entries(studentsByGrade)
            .sort(([a], [b]) => parseInt(a) - parseInt(b))
            .map(([grade, studentsInGrade]) => (
              <div
                key={grade}
                className="bg-white rounded-lg border border-gray-200 overflow-hidden text-[#2d2d2d]"
              >
                {/* 학년 헤더 */}
                <div
                  className={`px-6 py-3 border-b border-gray-200 ${getGradeColor(
                    parseInt(grade)
                  )
                    .replace("border-", "bg-")
                    .replace("text-", "text-gray-800")}`}
                >
                  <h3 className="font-semibold">
                    {getGrade(parseInt(grade))} ({studentsInGrade.length}
                    명)
                  </h3>
                </div>

                {/* 학생 카드들 */}
                <div className="divide-y divide-gray-200">
                  {studentsInGrade.map((student) => (
                    <div
                      key={student.id}
                      className="p-6 hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => {
                        if (onStudentSelect) {
                          onStudentSelect(student);
                        } else {
                          router.push(`/students/${student.id}`);
                        }
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          {/* 학생 아바타 */}
                          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <User className="w-6 h-6 text-blue-600" />
                          </div>

                          {/* 학생 정보 */}
                          <div className="space-y-1">
                            <div className="flex items-center gap-3">
                              <h4 className="font-semibold text-gray-900">
                                {student.name}
                              </h4>
                              <span
                                className={`px-2 py-1 text-xs rounded-full border ${getGradeColor(
                                  student.grade
                                )}`}
                              >
                                {getGrade(student.grade, "half")}
                              </span>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              {student.phone && (
                                <div className="flex items-center gap-1">
                                  <Phone className="w-3 h-3" />
                                  <span>{student.phone}</span>
                                </div>
                              )}
                              {student.email && (
                                <div className="flex items-center gap-1">
                                  <Mail className="w-3 h-3" />
                                  <span>{student.email}</span>
                                </div>
                              )}
                            </div>
                            {student.parent_phone && (
                              <div className="text-xs text-gray-500">
                                학부모: {student.parent_phone}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* 액션 버튼들 */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              // TODO: 일정 보기 기능
                            }}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="일정 보기"
                          >
                            <Calendar className="w-4 h-4" />
                          </button>
                          {student.parent_phone && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSendNotification(student.id, student.name);
                              }}
                              disabled={sendNotification.isPending}
                              className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              title="알림톡 전송"
                            >
                              <MessageSquare className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onStudentEdit?.(student);
                            }}
                            className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="편집"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
        )}
      </div>
    </div>
  );
}
