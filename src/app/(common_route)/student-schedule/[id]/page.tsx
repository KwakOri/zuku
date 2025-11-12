"use client";

import StudentHtmlSchedule from "@/components/common/schedule/StudentHtmlSchedule";
import ClassCompositionEditModal from "@/components/students/ClassCompositionEditModal";
import ClassEnrollmentModal from "@/components/students/ClassEnrollmentModal";
import { getSubjectColor } from "@/lib/scheduleUtils";
import { getGrade } from "@/lib/utils";
import { fullScheduleKeys, useFullSchedule } from "@/queries/useFullSchedule";
import { useStudents } from "@/queries/useStudents";
import { Tables } from "@/types/supabase";
import { useQueryClient } from "@tanstack/react-query";
import { Home, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useState } from "react";

interface StudentDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function StudentDetailPage({ params }: StudentDetailPageProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: students = [], isLoading, error } = useStudents();

  // params를 unwrap
  const { id } = use(params);
  const studentId = id; // UUID 그대로 사용

  // URL의 id 파라미터로 학생 정보 찾기
  const student = students.find((s) => s.id === id);

  // 학생 전체 시간표 데이터 가져오기 (개인 일정 + 수업 일정)
  const {
    data: fullScheduleData,
    isLoading: isScheduleLoading,
    error: scheduleError,
  } = useFullSchedule(studentId);

  console.log("학생 전체 시간표 데이터 -> ", fullScheduleData);

  // 전체 시간표에 색상 정보 추가
  const allSchedules = (fullScheduleData?.all || []).map((schedule) => {
    const isPersonal = schedule.type !== "class";
    const compositionOrder =
      "composition_order" in schedule ? schedule.composition_order : null;
    const isFrontTime = compositionOrder === 0 || !compositionOrder;
    const compositionType =
      ("composition_type" in schedule ? schedule.composition_type : null) ||
      "class";
    const subjectName =
      "subject_name" in schedule ? schedule.subject_name : null;

    const color = getSubjectColor(
      subjectName || undefined,
      isPersonal,
      isFrontTime,
      compositionType
    );

    return {
      ...schedule,
      color,
    };
  });

  // UI 상태
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [showCompositionEditModal, setShowCompositionEditModal] =
    useState(false);
  const [selectedClassForEdit, setSelectedClassForEdit] = useState<{
    classStudentId: string;
    classId: string;
    className: string;
    classColor: string;
    subjectName?: string;
    teacherName?: string;
    allCompositions: Tables<"class_compositions">[];
  } | null>(null);

  // 뒤로 가기 핸들러
  const handleBack = () => {
    router.back();
  };

  // 로딩 상태
  if (isLoading || isScheduleLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 mx-auto border-b-2 border-blue-600 rounded-full animate-spin"></div>
          <p className="mt-2 text-gray-600">
            {isLoading
              ? "학생 정보를 불러오는 중..."
              : "시간표를 불러오는 중..."}
          </p>
        </div>
      </div>
    );
  }

  // 에러 상태
  if (error || scheduleError) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <p className="text-red-600">
            {error
              ? "학생 정보를 불러오는데 실패했습니다."
              : "시간표를 불러오는데 실패했습니다."}
          </p>
          <p className="mt-1 text-gray-600">
            {(error || scheduleError)?.message}
          </p>
          <button
            onClick={handleBack}
            className="px-4 py-2 mt-4 text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            돌아가기
          </button>
        </div>
      </div>
    );
  }

  // 학생을 찾지 못한 경우
  if (!student) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <User className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <h3 className="mb-2 text-lg font-medium text-gray-900">
            학생을 찾을 수 없습니다
          </h3>
          <p className="mb-4 text-gray-500">
            요청하신 학생 정보가 존재하지 않습니다.
          </p>
          <button
            onClick={handleBack}
            className="px-4 py-2 text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="flex-shrink-0 border-0 shadow-sm flat-surface bg-gray-50">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="hidden md:block p-2 text-gray-500 transition-all duration-200 flat-card hover:text-gray-700 rounded-2xl hover:flat-pressed"
              >
                <Home className="w-5 h-5" />
              </Link>

              <div className="flex items-center gap-3">
                <div className="p-3 shadow-md bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-800">
                    {student.name} 시간표
                  </h1>
                  <p className="hidden md:block text-sm text-gray-600">
                    주간 시간표를 확인할 수 있습니다
                  </p>
                </div>
              </div>
            </div>

            {/* 학생 정보 카드 */}
            <div className="hidden md:flex items-center gap-3 p-3 rounded-lg bg-gray-50">
              <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-sm">
                <div className="font-medium text-gray-900">
                  {student.name}
                </div>
                <div className="text-gray-500">{getGrade(student.grade)}</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="flex-1 flex flex-col overflow-hidden px-4 py-4">
        <div className="flex-1 w-full h-full min-h-0">
          <StudentHtmlSchedule
            scheduleData={allSchedules.map((schedule) => ({
              id: schedule.id,
              title: schedule.title,
              start_time: schedule.start_time,
              end_time: schedule.end_time,
              day_of_week: schedule.day_of_week,
              color: schedule.color,
              type: schedule.type,
              composition_type: "composition_type" in schedule ? schedule.composition_type : undefined,
              subject_name: "subject_name" in schedule ? schedule.subject_name : null,
            }))}
            studentName={student.name}
          />
        </div>
      </main>

      {/* 수업 등록 모달 */}
      {showEnrollModal && (
        <ClassEnrollmentModal
          studentId={studentId}
          studentName={student.name}
          onClose={() => setShowEnrollModal(false)}
          onSuccess={() => {
            // 등록 성공 시 전체 시간표 새로고침
            queryClient.invalidateQueries({
              queryKey: fullScheduleKeys.byStudent(studentId),
            });
          }}
        />
      )}

      {/* 수업 구성 편집 모달 */}
      {showCompositionEditModal && selectedClassForEdit && (
        <ClassCompositionEditModal
          classStudentId={selectedClassForEdit.classStudentId}
          classId={selectedClassForEdit.classId}
          className={selectedClassForEdit.className}
          classColor={selectedClassForEdit.classColor}
          subjectName={selectedClassForEdit.subjectName}
          teacherName={selectedClassForEdit.teacherName}
          studentName={student.name}
          allCompositions={selectedClassForEdit.allCompositions}
          onClose={() => {
            setShowCompositionEditModal(false);
            setSelectedClassForEdit(null);
          }}
          onSuccess={() => {
            // 수정 성공 시 전체 시간표 새로고침
            queryClient.invalidateQueries({
              queryKey: fullScheduleKeys.byStudent(studentId),
            });
            setShowCompositionEditModal(false);
            setSelectedClassForEdit(null);
          }}
        />
      )}
    </div>
  );
}
