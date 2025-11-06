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
  Phone,
  Search,
  User,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  Card,
  Button,
  SearchInput,
  Avatar,
  Badge,
  Chip,
  Icon
} from "@/components/design-system";

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

  // 학년별 필터링된 학생 목록 (학년순으로 정렬)
  const filteredStudents = useMemo(() => {
    return students
      .filter((student) => {
        const matchesSearch =
          student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.phone?.includes(searchTerm);

        const matchesGrade =
          selectedGrade === "all" || student.grade === selectedGrade;

        return matchesSearch && matchesGrade;
      })
      .sort((a, b) => {
        // 학년으로 먼저 정렬, 같은 학년이면 이름으로 정렬
        if (a.grade !== b.grade) {
          return a.grade - b.grade;
        }
        return a.name.localeCompare(b.name);
      });
  }, [searchTerm, selectedGrade, students]);

  // 전체 학년 목록
  const availableGrades = useMemo(() => {
    const grades = [...new Set(students.map((s) => s.grade))].sort(
      (a, b) => a - b
    );
    return grades;
  }, [students]);

  // 로딩 상태
  if (isLoading) {
    return (
      <div className="w-full space-y-6">
        <Card size="lg">
          <div className="animate-pulse">
            <div className="h-8 bg-neu-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-neu-200 rounded w-full mb-4"></div>
            <div className="h-12 bg-neu-200 rounded w-full"></div>
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
            <Icon name="alert-triangle" size="xl" color="error" className="mx-auto mb-4" />
            <h3 className="text-lg font-medium text-error-900 mb-2">
              데이터를 불러오는 중 오류가 발생했습니다
            </h3>
            <p className="text-error-600 text-sm">{error.message}</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* 헤더 */}
      <Card size="lg">
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
      <div>
        {filteredStudents.length === 0 ? (
          <Card size="lg">
            <div className="p-12 text-center">
              <Icon name="user" size="2xl" color="muted" className="mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                검색 결과가 없습니다
              </h3>
              <p className="text-gray-500">다른 검색어나 필터를 시도해보세요.</p>
            </div>
          </Card>
        ) : (
          <div className="bg-white rounded-lg p-4 space-y-3">
            {/* 학생 카드들 */}
            {filteredStudents.map((student) => (
              <div
                key={student.id}
                className="bg-gray-50 hover:bg-gray-100 rounded-lg p-4 cursor-pointer transition-colors duration-200"
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
                      className="bg-primary-500 text-white"
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
        )}
      </div>
    </div>
  );
}