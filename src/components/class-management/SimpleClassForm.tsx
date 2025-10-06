"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { BookOpen, Save } from "lucide-react";
import { useCreateClass } from "@/queries/useClasses";
import { useTeachers } from "@/queries/useTeachers";
import { useSubjects } from "@/queries/useSubjects";
import toast from "react-hot-toast";

interface SimpleClassFormData {
  title: string;
  subjectId: string;
  teacherId: string;
  description?: string;
  room?: string;
  maxStudents?: number;
  courseType: "regular" | "school_exam";
  splitType: "single" | "split";
}

export default function SimpleClassForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<SimpleClassFormData>({
    defaultValues: {
      courseType: "regular",
      splitType: "single",
    }
  });

  const createClassMutation = useCreateClass();
  const { data: teachers = [], isLoading: teachersLoading } = useTeachers();
  const { data: subjects = [], isLoading: subjectsLoading } = useSubjects();

  const onSubmit = async (data: SimpleClassFormData) => {
    setIsSubmitting(true);

    try {
      await createClassMutation.mutateAsync({
        ...data,
        studentIds: [], // 학생은 나중에 등록
      });

      toast.success("수업이 성공적으로 개설되었습니다! 시간 배정 탭에서 수업 시간을 설정하세요.");
      reset();
    } catch (error) {
      toast.error("수업 개설 중 오류가 발생했습니다.");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-white border border-gray-200 rounded-2xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-primary-100 rounded-xl">
          <BookOpen className="w-5 h-5 text-primary-600" />
        </div>
        <h2 className="text-lg font-semibold text-gray-800">
          수업 기본 정보
        </h2>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-4">
          {/* 수업명 */}
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              수업명 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...register("title", { required: "수업명을 입력해주세요" })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="예: 고등수학 기초반"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>

          {/* 과목 */}
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              과목 <span className="text-red-500">*</span>
            </label>
            <select
              {...register("subjectId", { required: "과목을 선택해주세요" })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
              <p className="mt-1 text-sm text-red-600">{errors.subjectId.message}</p>
            )}
          </div>

          {/* 담당 강사 */}
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              담당 강사 <span className="text-red-500">*</span>
            </label>
            <select
              {...register("teacherId", { required: "담당 강사를 선택해주세요" })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              disabled={teachersLoading}
            >
              <option value="">담당 강사를 선택하세요</option>
              {teachers.map((teacher) => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.name}
                </option>
              ))}
            </select>
            {errors.teacherId && (
              <p className="mt-1 text-sm text-red-600">{errors.teacherId.message}</p>
            )}
          </div>

          {/* 수업 유형 */}
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              수업 유형 <span className="text-red-500">*</span>
            </label>
            <select
              {...register("courseType", { required: "수업 유형을 선택해주세요" })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="regular">정규수업</option>
              <option value="school_exam">학교내신</option>
            </select>
          </div>

          {/* 수업 구성 타입 */}
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              수업 구성 타입 <span className="text-red-500">*</span>
            </label>
            <select
              {...register("splitType", { required: "수업 구성 타입을 선택해주세요" })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="single">단일 수업</option>
              <option value="split">앞/뒤타임 수업</option>
            </select>
            <p className="mt-1 text-xs text-gray-500">
              앞/뒤타임 수업은 학생별로 다른 시간대를 선택할 수 있습니다
            </p>
          </div>

          {/* 강의실 */}
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              강의실
            </label>
            <input
              type="text"
              {...register("room")}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="예: 301호"
            />
          </div>

          {/* 최대 수강 인원 */}
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="예: 15"
            />
            {errors.maxStudents && (
              <p className="mt-1 text-sm text-red-600">{errors.maxStudents.message}</p>
            )}
          </div>

          {/* 수업 설명 */}
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              수업 설명
            </label>
            <textarea
              {...register("description")}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="수업에 대한 간단한 설명을 입력해주세요"
            />
          </div>
        </div>

        {/* 제출 버튼 */}
        <div className="pt-4 border-t border-gray-200">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 text-white transition-all duration-200 bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl hover:from-primary-600 hover:to-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-b-2 border-white rounded-full animate-spin"></div>
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
    </div>
  );
}
