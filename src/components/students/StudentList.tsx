"use client";

import {
  Avatar,
  Badge,
  Button,
  Card,
  Chip,
  Icon,
  SearchInput,
} from "@/components/design-system";
import { getGrade } from "@/lib/utils";
import { useStudents } from "@/queries/useStudents";
import { Tables } from "@/types/supabase";
import {
  Calendar,
  ChevronDown,
  Edit3,
  Filter,
  Mail,
  Phone,
  User,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

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

  // 로딩 상태
  if (isLoading) {
    return (
      <div className="w-full space-y-6">
        <Card size="lg">
          <div className="animate-pulse">
            <div className="w-1/3 h-8 mb-4 rounded bg-neu-200"></div>
            <div className="w-full h-4 mb-4 rounded bg-neu-200"></div>
            <div className="w-full h-12 rounded bg-neu-200"></div>
          </div>
        </Card>
      </div>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <div className="w-full space-y-6">
        <Card size="lg" variant="flat" className="border-error-200">
          <div className="text-center">
            <Icon
              name="alert-triangle"
              size="xl"
              color="error"
              className="mx-auto mb-4"
            />
            <h3 className="mb-2 text-lg font-medium text-error-900">
              데이터를 불러오는 중 오류가 발생했습니다
            </h3>
            <p className="text-sm text-error-600">{error.message}</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 w-full min-h-0 space-y-6">
      {/* 헤더 */}
      <Card size="lg" className="shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Icon name="graduation-cap" size="lg" color="primary" />
            <h1 className="text-2xl font-bold text-gray-900">학생 관리</h1>
          </div>
          <Badge variant="outline" size="lg">
            총 {filteredStudents.length}명의 학생
          </Badge>
        </div>

        {/* 검색 및 필터 */}
        <div className="space-y-4">
          {/* 검색바 */}
          <SearchInput
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onSearch={(query) => setSearchTerm(query)}
            placeholder="이름, 이메일, 전화번호로 검색..."
          />

          {/* 필터 섹션 */}
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="md"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="w-4 h-4 mr-2" />
              필터
              <ChevronDown
                className={`w-4 h-4 ml-2 transition-transform ${
                  showFilters ? "rotate-180" : ""
                }`}
              />
            </Button>

            {selectedGrade !== "all" && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">필터:</span>
                <Chip
                  variant="primary"
                  size="sm"
                  deletable
                  onDelete={() => setSelectedGrade("all")}
                >
                  {getGrade(selectedGrade as number, "half")}
                </Chip>
              </div>
            )}
          </div>

          {/* 필터 옵션 */}
          {showFilters && (
            <Card variant="flat" className="bg-gray-50">
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-700">
                  학년별 필터
                </label>
                <div className="flex flex-wrap gap-2">
                  <Chip
                    variant={selectedGrade === "all" ? "primary" : "outline"}
                    size="sm"
                    onClick={() => setSelectedGrade("all")}
                    className="cursor-pointer"
                  >
                    전체
                  </Chip>
                  {availableGrades.map((grade) => (
                    <Chip
                      key={grade}
                      variant={selectedGrade === grade ? "primary" : "outline"}
                      size="sm"
                      onClick={() => setSelectedGrade(grade)}
                      className="cursor-pointer"
                    >
                      {getGrade(grade, "half")}
                    </Chip>
                  ))}
                </div>
              </div>
            </Card>
          )}
        </div>
      </Card>

      {/* 학생 목록 */}
      <div className="flex-1 min-h-0 space-y-6 overflow-y-auto">
        {Object.keys(studentsByGrade).length === 0 ? (
          <Card size="lg">
            <div className="p-12 text-center">
              <User className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="mb-2 text-lg font-medium text-gray-900">
                검색 결과가 없습니다
              </h3>
              <p className="text-gray-500">
                다른 검색어나 필터를 시도해보세요.
              </p>
            </div>
          </Card>
        ) : (
          Object.entries(studentsByGrade)
            .sort(([a], [b]) => parseInt(a) - parseInt(b))
            .map(([grade, studentsInGrade]) => (
              <Card key={grade} size="lg" className="overflow-hidden">
                {/* 학년 헤더 */}
                <div className="px-6 py-3 border-b border-neu-200 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-800">
                      {getGrade(parseInt(grade))}
                    </h3>
                    <Badge variant="secondary" size="sm">
                      {studentsInGrade.length}명
                    </Badge>
                  </div>
                </div>

                {/* 학생 카드들 */}
                <div className="divide-y divide-neu-200">
                  {studentsInGrade.map((student) => (
                    <div
                      key={student.id}
                      className="p-6 transition-colors cursor-pointer hover:bg-gray-50"
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
                          <Avatar
                            size="lg"
                            variant="flat"
                            fallback={student.name.substring(0, 2)}
                            className="text-white bg-primary-500"
                          />

                          {/* 학생 정보 */}
                          <div className="space-y-1">
                            <div className="flex items-center gap-3">
                              <h4 className="font-semibold text-gray-900">
                                {student.name}
                              </h4>
                              <Chip variant="secondary" size="sm">
                                {getGrade(student.grade, "half")}
                              </Chip>
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
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              // TODO: 일정 보기 기능
                            }}
                            title="일정 보기"
                          >
                            <Calendar className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              onStudentEdit?.(student);
                            }}
                            title="편집"
                          >
                            <Edit3 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            ))
        )}
      </div>
    </div>
  );
}
