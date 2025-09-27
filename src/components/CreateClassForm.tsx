"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Calendar, Clock, Users, MapPin, BookOpen, Save, Plus, X } from "lucide-react";
import { useCreateClass } from "@/queries/useClasses";
import { useTeachers } from "@/queries/useTeachers";
import { useStudents } from "@/queries/useStudents";
import toast from "react-hot-toast";

interface CreateClassFormProps {
  userRole: string;
  userId: string;
}

interface CreateClassFormData {
  title: string;
  subject: string;
  description?: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  teacherId: string;
  room?: string;
  maxStudents?: number;
  studentIds: string[];
}

const subjects = [
  "수학", "영어", "국어", "과학", "사회", "역사", "물리", "화학", "생물", "지구과학"
];

const dayNames = ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"];

export default function CreateClassForm({ userRole, userId }: CreateClassFormProps) {
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<CreateClassFormData>({
    defaultValues: {
      teacherId: userRole === 'teacher' ? userId : '',
      studentIds: [],
    }
  });

  const createClassMutation = useCreateClass();
  const { data: teachers = [], isLoading: teachersLoading } = useTeachers();
  const { data: students = [], isLoading: studentsLoading } = useStudents();

  const watchedStartTime = watch("startTime");
  const watchedEndTime = watch("endTime");

  // 시간 유효성 검증
  const validateTimeRange = () => {
    if (!watchedStartTime || !watchedEndTime) return true;
    return watchedStartTime < watchedEndTime;
  };

  // 학생 선택/해제
  const toggleStudent = (studentId: string) => {
    const newSelection = selectedStudents.includes(studentId)
      ? selectedStudents.filter(id => id !== studentId)
      : [...selectedStudents, studentId];

    setSelectedStudents(newSelection);
    setValue("studentIds", newSelection);
  };

  // 폼 제출
  const onSubmit = async (data: CreateClassFormData) => {
    if (!validateTimeRange()) {
      toast.error("종료 시간은 시작 시간보다 늦어야 합니다.");
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
        studentIds: selectedStudents,
      });

      toast.success("수업이 성공적으로 개설되었습니다!");

      // 폼 초기화는 부모 컴포넌트에서 처리하거나 페이지 이동
      // router.push("/classes") 등으로 처리 가능
    } catch (error) {
      toast.error("수업 개설 중 오류가 발생했습니다.");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* 기본 정보 섹션 */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
            <BookOpen className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">기본 정보</h3>
        </div>

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
              <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              과목 <span className="text-red-500">*</span>
            </label>
            <select
              {...register("subject", { required: "과목을 선택해주세요" })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">과목을 선택하세요</option>
              {subjects.map((subject) => (
                <option key={subject} value={subject}>
                  {subject}
                </option>
              ))}
            </select>
            {errors.subject && (
              <p className="mt-1 text-sm text-red-600">{errors.subject.message}</p>
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

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              강의실
            </label>
            <input
              type="text"
              {...register("room")}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="예: A-101"
            />
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
                max: { value: 50, message: "최대 50명까지 가능합니다" }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="예: 15"
            />
            {errors.maxStudents && (
              <p className="mt-1 text-sm text-red-600">{errors.maxStudents.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* 시간 설정 섹션 */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-green-100 text-green-600 rounded-lg flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">시간 설정</h3>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              요일 <span className="text-red-500">*</span>
            </label>
            <select
              {...register("dayOfWeek", {
                required: "요일을 선택해주세요",
                valueAsNumber: true
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">요일 선택</option>
              {dayNames.map((day, index) => (
                <option key={index} value={index}>
                  {day}
                </option>
              ))}
            </select>
            {errors.dayOfWeek && (
              <p className="mt-1 text-sm text-red-600">{errors.dayOfWeek.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              시작 시간 <span className="text-red-500">*</span>
            </label>
            <input
              type="time"
              {...register("startTime", { required: "시작 시간을 입력해주세요" })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {errors.startTime && (
              <p className="mt-1 text-sm text-red-600">{errors.startTime.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              종료 시간 <span className="text-red-500">*</span>
            </label>
            <input
              type="time"
              {...register("endTime", { required: "종료 시간을 입력해주세요" })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {errors.endTime && (
              <p className="mt-1 text-sm text-red-600">{errors.endTime.message}</p>
            )}
            {watchedStartTime && watchedEndTime && !validateTimeRange() && (
              <p className="mt-1 text-sm text-red-600">종료 시간은 시작 시간보다 늦어야 합니다</p>
            )}
          </div>
        </div>
      </div>

      {/* 강사 배정 섹션 */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">담당 강사</h3>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            강사 선택 <span className="text-red-500">*</span>
          </label>
          <select
            {...register("teacherId", { required: "담당 강사를 선택해주세요" })}
            disabled={userRole === 'teacher'}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
          >
            <option value="">강사를 선택하세요</option>
            {teachers.map((teacher) => (
              <option key={teacher.id} value={teacher.id}>
                {teacher.name} - {teacher.email}
              </option>
            ))}
          </select>
          {userRole === 'teacher' && (
            <p className="mt-1 text-sm text-blue-600">강사는 자신을 담당 강사로 자동 배정됩니다</p>
          )}
          {errors.teacherId && (
            <p className="mt-1 text-sm text-red-600">{errors.teacherId.message}</p>
          )}
        </div>
      </div>

      {/* 학생 선택 섹션 */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">수강 학생</h3>
          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
            {selectedStudents.length}명 선택됨
          </span>
        </div>

        {studentsLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">학생 목록을 불러오는 중...</p>
          </div>
        ) : (
          <div className="border border-gray-200 rounded-lg max-h-60 overflow-y-auto">
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
                        <span className="text-xs text-gray-500">{student.phone}</span>
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
      <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200">
        <button
          type="button"
          className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
          onClick={() => window.history.back()}
        >
          취소
        </button>
        <button
          type="submit"
          disabled={isSubmitting || !validateTimeRange()}
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
  );
}