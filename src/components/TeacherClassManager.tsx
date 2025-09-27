"use client";

import { getGrade } from "@/lib/utils";
import { useAuthState } from "@/queries/useAuth";
import { useCreateClass } from "@/queries/useClasses";
import { useStudents } from "@/queries/useStudents";
import { useSubjects } from "@/queries/useSubjects";
import { useTeacherClasses } from "@/queries/useTeacherClasses";
import { useTeachers } from "@/queries/useTeachers";
import {
  BookOpen,
  Calendar,
  ChevronRight,
  Clock,
  Plus,
  Save,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

interface CreateClassFormData {
  title: string;
  subjectId: string;
  teacherId: string;
  description?: string;
  room?: string;
  maxStudents?: number;
  studentIds: string[];
}

export default function TeacherClassManager() {
  const { user, isAuthenticated } = useAuthState();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>("");

  // 선택된 강사의 수업 목록 조회
  const {
    data: classes = [],
    isLoading,
    error,
    refetch,
  } = useTeacherClasses(selectedTeacherId || "");
  const { data: students = [], isLoading: studentsLoading } = useStudents();
  const { data: subjects = [], isLoading: subjectsLoading } = useSubjects();
  const { data: teachers = [], isLoading: teachersLoading } = useTeachers();
  const createClassMutation = useCreateClass();

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CreateClassFormData>({
    defaultValues: {
      studentIds: [],
    },
  });

  // 인증되지 않은 사용자 처리
  if (!isAuthenticated) {
    return (
      <div className="w-full space-y-6">
        <div className="bg-white rounded-lg border border-yellow-200 p-6">
          <div className="text-center">
            <div className="text-yellow-600 mb-4">⚠️</div>
            <h3 className="text-lg font-medium text-yellow-900 mb-2">
              로그인이 필요합니다
            </h3>
            <p className="text-yellow-600 text-sm">
              강사 전용 기능을 사용하려면 로그인해주세요.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 학생 선택/해제
  const toggleStudent = (studentId: string) => {
    const newSelection = selectedStudents.includes(studentId)
      ? selectedStudents.filter((id) => id !== studentId)
      : [...selectedStudents, studentId];

    setSelectedStudents(newSelection);
    setValue("studentIds", newSelection);
  };

  // 수업 생성 핸들러
  const onSubmit = async (data: CreateClassFormData) => {
    if (!data.teacherId) {
      toast.error("담당 강사를 선택해주세요.");
      return;
    }

    if (data.studentIds.length === 0) {
      toast.error("최소 1명의 학생을 선택해주세요.");
      return;
    }

    setIsSubmitting(true);

    try {
      await createClassMutation.mutateAsync({
        ...data,
        teacherId: data.teacherId,
        studentIds: selectedStudents,
      });

      toast.success("수업이 성공적으로 개설되었습니다!");

      // 폼 리셋
      reset();
      setSelectedStudents([]);
      setShowCreateForm(false);

      // 수업 목록 새로고침 (선택된 강사의 수업 목록)
      if (selectedTeacherId === data.teacherId) {
        refetch();
      }
    } catch (error) {
      toast.error("수업 개설 중 오류가 발생했습니다.");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full space-y-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full space-y-6">
        <div className="bg-white rounded-lg border border-red-200 p-6">
          <div className="text-center">
            <div className="text-red-600 mb-4">⚠️</div>
            <h3 className="text-lg font-medium text-red-900 mb-2">
              담당 수업을 불러오는 중 오류가 발생했습니다
            </h3>
            <p className="text-red-600 text-sm">{error.message}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* 강사 선택 섹션 */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Users className="w-6 h-6 text-purple-600" />
          <h2 className="text-xl font-bold text-gray-900">강사 선택</h2>
        </div>

        {teachersLoading ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-500">강사 목록을 불러오는 중...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {teachers.map((teacher) => (
              <button
                key={teacher.id}
                onClick={() => setSelectedTeacherId(teacher.id)}
                className={`p-4 border rounded-lg text-left transition-all duration-200 hover:shadow-md ${
                  selectedTeacherId === teacher.id
                    ? "border-purple-500 bg-purple-50 ring-2 ring-purple-200"
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">{teacher.name}</h3>
                    <p className="text-sm text-gray-600">{teacher.email}</p>
                    {teacher.phone && (
                      <p className="text-xs text-gray-500">{teacher.phone}</p>
                    )}
                  </div>
                  <ChevronRight
                    className={`w-4 h-4 transition-colors ${
                      selectedTeacherId === teacher.id
                        ? "text-purple-600"
                        : "text-gray-400"
                    }`}
                  />
                </div>
              </button>
            ))}
          </div>
        )}

        {selectedTeacherId && (
          <div className="mt-4 p-3 bg-purple-50 rounded-lg border border-purple-200">
            <p className="text-sm text-purple-700">
              ✓ 선택된 강사: <strong>{teachers.find(t => t.id === selectedTeacherId)?.name}</strong>
            </p>
          </div>
        )}
      </div>

      {/* 수업 개설 섹션 */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Plus className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">새 수업 개설</h2>
          </div>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            disabled={!selectedTeacherId}
            className={`px-4 py-2 rounded-lg transition-colors ${
              !selectedTeacherId
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : showCreateForm
                ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            {showCreateForm ? (
              <>
                <X className="w-4 h-4 inline mr-2" />
                취소
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 inline mr-2" />
                수업 개설
              </>
            )}
          </button>
        </div>

        {showCreateForm && (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* 기본 정보 */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  수업명 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...register("title", { required: "수업명을 입력해주세요" })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="예: 고등수학 기초반"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.title.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  과목 <span className="text-red-500">*</span>
                </label>
                <select
                  {...register("subjectId", {
                    required: "과목을 선택해주세요",
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={subjectsLoading}
                >
                  <option value="">과목을 선택하세요</option>
                  {subjects.map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.subject_name}
                    </option>
                  ))}
                </select>
                {errors.subjectId && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.subjectId.message}
                  </p>
                )}
                {subjectsLoading && (
                  <p className="mt-1 text-sm text-gray-500">
                    과목 목록을 불러오는 중...
                  </p>
                )}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  담당 강사 <span className="text-red-500">*</span>
                </label>
                <select
                  {...register("teacherId", {
                    required: "담당 강사를 선택해주세요",
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={teachersLoading}
                  defaultValue={selectedTeacherId}
                >
                  <option value="">담당 강사를 선택하세요</option>
                  {teachers.map((teacher) => (
                    <option key={teacher.id} value={teacher.id}>
                      {teacher.name}
                    </option>
                  ))}
                </select>
                {errors.teacherId && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.teacherId.message}
                  </p>
                )}
                {teachersLoading && (
                  <p className="mt-1 text-sm text-gray-500">
                    강사 목록을 불러오는 중...
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  최대 수강 인원
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  {...register("maxStudents", {
                    min: { value: 1, message: "최소 1명 이상이어야 합니다" },
                    max: { value: 50, message: "최대 50명까지 가능합니다" },
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="예: 15"
                />
                {errors.maxStudents && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.maxStudents.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                수업 설명
              </label>
              <textarea
                {...register("description")}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="수업에 대한 간단한 설명을 입력해주세요"
              />
            </div>

            {/* 수강 학생 선택 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                수강 학생 선택 <span className="text-red-500">*</span>
                <span className="ml-2 text-sm text-gray-500">
                  ({selectedStudents.length}명 선택됨)
                </span>
              </label>
              {studentsLoading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                </div>
              ) : (
                <div className="border border-gray-200 rounded-lg max-h-40 overflow-y-auto">
                  {students.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      등록된 학생이 없습니다.
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-200">
                      {students.map((student) => (
                        <label
                          key={student.id}
                          className="flex items-center p-3 hover:bg-gray-50 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={selectedStudents.includes(student.id)}
                            onChange={() => toggleStudent(student.id)}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <div className="ml-3 flex-1">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-gray-900">
                                {student.name}
                              </span>
                              <span className="text-xs text-gray-500">
                                {student.grade}학년
                              </span>
                            </div>
                            {student.phone && (
                              <span className="text-xs text-gray-500">
                                {student.phone}
                              </span>
                            )}
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 제출 버튼 */}
            <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(false);
                  reset();
                  setSelectedStudents([]);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>수업 개설 중...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>수업 개설</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* 담당 수업 목록 */}
      {selectedTeacherId && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <BookOpen className="w-6 h-6 text-green-600" />
              <h2 className="text-xl font-bold text-gray-900">
                {teachers.find(t => t.id === selectedTeacherId)?.name} 강사의 수업 목록
              </h2>
              <span className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full">
                {classes.length}개 수업
              </span>
            </div>
          </div>

          {classes.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                담당 수업이 없습니다
              </h3>
              <p className="text-gray-500">
                관리자에게 수업 배정을 요청해주세요.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {classes.map((classItem) => {
                return (
                  <div
                    key={classItem.id}
                    className="p-4 border border-gray-200 rounded-lg text-left transition-all duration-200 hover:shadow-md hover:border-gray-300 hover:bg-gray-50"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">
                          {classItem.title}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">
                          {classItem.subject?.subject_name || "과목 미정"}
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </div>

                    <div className="space-y-2">
                      {classItem.day_of_week !== null && classItem.start_time && classItem.end_time ? (
                        <>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="w-4 h-4" />
                            <span>
                              {["일", "월", "화", "수", "목", "금", "토"][classItem.day_of_week]}요일
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Clock className="w-4 h-4" />
                            <span>
                              {classItem.start_time.substring(0, 5)} - {classItem.end_time.substring(0, 5)}
                            </span>
                          </div>
                        </>
                      ) : (
                        <div className="flex items-center gap-2 text-sm text-orange-600">
                          <Clock className="w-4 h-4" />
                          <span>시간표 미설정</span>
                        </div>
                      )}

                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Users className="w-4 h-4" />
                        <span>학생 {classItem.student_count}명</span>
                        {classItem.max_students && (
                          <span className="text-gray-400">
                            / {classItem.max_students}명
                          </span>
                        )}
                      </div>

                      {classItem.room && (
                        <div className="text-sm text-gray-500">
                          📍 {classItem.room}
                        </div>
                      )}
                    </div>

                    {/* 수강 학생 미리보기 */}
                    {classItem.students.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="flex flex-wrap gap-1">
                          {classItem.students.slice(0, 3).map((student) => (
                            <span
                              key={student.id}
                              className="px-2 py-1 bg-gray-100 text-xs rounded-full text-gray-600"
                            >
                              {student.name} ({getGrade(student.grade, "half")})
                            </span>
                          ))}
                          {classItem.students.length > 3 && (
                            <span className="px-2 py-1 bg-gray-100 text-xs rounded-full text-gray-600">
                              +{classItem.students.length - 3}명
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}