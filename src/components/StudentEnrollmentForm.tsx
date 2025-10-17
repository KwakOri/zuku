"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { UserPlus, Calendar, Clock } from "lucide-react";
import { useStudents } from "@/queries/useStudents";
import { useClasses } from "@/queries/useClasses";
import { useClassCompositions } from "@/queries/useClassComposition";
import toast from "react-hot-toast";
import ClassCompositionSelector from "./ClassCompositionSelector";

interface StudentEnrollmentFormProps {
  onSuccess?: () => void;
}

interface EnrollmentFormData {
  studentId: string;
  classId: string;
  compositionId?: string;
  enrolledDate: string;
}

export default function StudentEnrollmentForm({ onSuccess }: StudentEnrollmentFormProps) {
  const [selectedCompositionId, setSelectedCompositionId] = useState<string>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<EnrollmentFormData>({
    defaultValues: {
      enrolledDate: new Date().toISOString().split('T')[0],
    }
  });

  const { data: students = [], isLoading: studentsLoading } = useStudents();
  const { data: classes = [], isLoading: classesLoading } = useClasses();

  const selectedClassId = watch("classId");
  const selectedClass = classes.find(c => c.id === selectedClassId);

  const onSubmit = async (data: EnrollmentFormData) => {
    // split 타입인데 시간대를 선택하지 않은 경우
    if (selectedClass?.split_type === "split" && !selectedCompositionId) {
      toast.error("앞/뒤타임 중 하나를 선택해주세요.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/class-students", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          composition_id: selectedCompositionId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to enroll student");
      }

      toast.success("학생이 성공적으로 등록되었습니다!");
      onSuccess?.();
    } catch (error) {
      toast.error("학생 등록 중 오류가 발생했습니다.");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* 학생 선택 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          학생 선택 *
        </label>
        <select
          {...register("studentId", { required: "학생을 선택해주세요" })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={studentsLoading}
        >
          <option value="">학생을 선택하세요</option>
          {students.map((student) => (
            <option key={student.id} value={student.id}>
              {student.name} ({student.grade}학년)
            </option>
          ))}
        </select>
        {errors.studentId && (
          <p className="mt-1 text-xs text-red-600">{errors.studentId.message}</p>
        )}
      </div>

      {/* 수업 선택 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          수업 선택 *
        </label>
        <select
          {...register("classId", { required: "수업을 선택해주세요" })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={classesLoading}
        >
          <option value="">수업을 선택하세요</option>
          {classes.map((cls) => (
            <option key={cls.id} value={cls.id}>
              {cls.title} - {cls.subject?.subject_name} ({cls.teacher?.name})
            </option>
          ))}
        </select>
        {errors.classId && (
          <p className="mt-1 text-xs text-red-600">{errors.classId.message}</p>
        )}
      </div>

      {/* 앞/뒤타임 선택 (split 타입인 경우만) */}
      {selectedClass?.split_type === "split" && selectedClassId && (
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="text-sm font-medium text-blue-900 mb-3">
            시간대 선택 (앞타임/뒤타임)
          </h4>
          <ClassCompositionSelector
            classId={selectedClassId}
            splitType="split"
            selectedCompositionId={selectedCompositionId}
            onSelect={setSelectedCompositionId}
          />
          {!selectedCompositionId && (
            <p className="mt-2 text-xs text-red-600">
              앞타임 또는 뒤타임을 선택해주세요
            </p>
          )}
        </div>
      )}

      {/* 등록일 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          등록일 *
        </label>
        <input
          type="date"
          {...register("enrolledDate", { required: "등록일을 선택해주세요" })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {errors.enrolledDate && (
          <p className="mt-1 text-xs text-red-600">{errors.enrolledDate.message}</p>
        )}
      </div>

      {/* 제출 버튼 */}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <UserPlus className="w-4 h-4" />
          {isSubmitting ? "등록 중..." : "학생 등록"}
        </button>
      </div>
    </form>
  );
}
