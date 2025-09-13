"use client";

import CanvasSchedule from "@/components/CanvasSchedule";
import {
  convertBlockToStudentSchedule,
  convertStudentSchedulesToBlocks,
  findBlockChanges,
  isNewBlock,
} from "@/lib/scheduleUtils";
import { getGrade } from "@/lib/utils";
import { useStudents } from "@/queries/useStudents";
import {
  studentScheduleKeys,
  useStudentSchedules,
} from "@/queries/useStudentSchedules";
import {
  createStudentSchedule,
  deleteStudentSchedule,
  updateStudentSchedule,
} from "@/services/client/studentScheduleApi";
import { ClassBlock } from "@/types/schedule";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Home, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useRef } from "react";

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
  const studentId = parseInt(id);

  // URL의 id 파라미터로 학생 정보 찾기
  const student = students.find((s) => s.id.toString() === id);

  // 학생 개인 시간표 데이터 가져오기
  const {
    data: studentSchedules = [],
    isLoading: isScheduleLoading,
    error: scheduleError,
  } = useStudentSchedules(studentId);

  // 학생 시간표 데이터를 CanvasSchedule용 블록으로 변환
  const scheduleBlocks = convertStudentSchedulesToBlocks(studentSchedules);

  // 원본 블록 데이터를 참조로 저장 (변경 감지용)
  const originalBlocksRef = useRef<ClassBlock[]>(scheduleBlocks);

  // scheduleBlocks가 변경될 때마다 원본 참조 업데이트
  if (
    originalBlocksRef.current.length !== scheduleBlocks.length ||
    originalBlocksRef.current.some(
      (block, index) => block.id !== scheduleBlocks[index]?.id
    )
  ) {
    originalBlocksRef.current = scheduleBlocks;
  }

  // 새 일정 생성 mutation
  const createScheduleMutation = useMutation({
    mutationFn: (scheduleData: any) =>
      createStudentSchedule(studentId, scheduleData),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: studentScheduleKeys.list(studentId),
      });
    },
  });

  // 일정 수정 mutation
  const updateScheduleMutation = useMutation({
    mutationFn: ({
      scheduleId,
      scheduleData,
    }: {
      scheduleId: string;
      scheduleData: any;
    }) => updateStudentSchedule(studentId, scheduleId, scheduleData),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: studentScheduleKeys.list(studentId),
      });
    },
  });

  // 일정 삭제 mutation
  const deleteScheduleMutation = useMutation({
    mutationFn: (scheduleId: string) =>
      deleteStudentSchedule(studentId, scheduleId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: studentScheduleKeys.list(studentId),
      });
    },
  });

  // 블록 변경 핸들러
  const handleBlocksChange = async (updatedBlocks: ClassBlock[]) => {
    try {
      // 원본과 업데이트된 블록을 비교하여 변경사항 감지
      const changes = findBlockChanges(
        originalBlocksRef.current,
        updatedBlocks
      );

      console.log("Schedule changes detected:", changes);

      // 병렬로 모든 변경사항 처리
      const promises: Promise<any>[] = [];

      // 1. 삭제된 블록들 처리
      changes.deleted.forEach((deletedBlock) => {
        if (!isNewBlock(deletedBlock)) {
          promises.push(
            deleteStudentSchedule(studentId, deletedBlock.id).catch((error) => {
              console.error(
                `Failed to delete schedule ${deletedBlock.id}:`,
                error
              );
              throw error;
            })
          );
        }
      });

      // 2. 새로 추가된 블록들 처리
      changes.added.forEach((addedBlock) => {
        const scheduleData = convertBlockToStudentSchedule(
          addedBlock,
          studentId
        );
        promises.push(
          createStudentSchedule(studentId, scheduleData).catch((error) => {
            console.error(`Failed to create new schedule:`, error);
            throw error;
          })
        );
      });

      // 3. 수정된 블록들 처리
      changes.updated.forEach((updatedBlock) => {
        if (!isNewBlock(updatedBlock)) {
          const scheduleData = convertBlockToStudentSchedule(
            updatedBlock,
            studentId
          );
          promises.push(
            updateStudentSchedule(
              studentId,
              updatedBlock.id,
              scheduleData
            ).catch((error) => {
              console.error(
                `Failed to update schedule ${updatedBlock.id}:`,
                error
              );
              throw error;
            })
          );
        }
      });

      // 모든 변경사항을 병렬로 처리
      if (promises.length > 0) {
        await Promise.all(promises);

        // 성공 시 캐시 무효화하여 최신 데이터 다시 가져오기
        queryClient.invalidateQueries({
          queryKey: studentScheduleKeys.list(studentId),
        });

        console.log(
          `Successfully processed ${promises.length} schedule changes`
        );
      }

      // 원본 참조 업데이트
      originalBlocksRef.current = updatedBlocks;
    } catch (error) {
      console.error("Failed to save schedule changes:", error);

      // 에러 발생 시 사용자에게 알림 (선택사항)
      // alert("시간표 저장에 실패했습니다. 다시 시도해주세요.");

      // 캐시 무효화하여 원본 데이터로 되돌리기
      queryClient.invalidateQueries({
        queryKey: studentScheduleKeys.list(studentId),
      });
    }
  };

  // 뒤로 가기 핸들러
  const handleBack = () => {
    router.back();
  };

  // 로딩 상태
  if (isLoading || isScheduleLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">
            {error
              ? "학생 정보를 불러오는데 실패했습니다."
              : "시간표를 불러오는데 실패했습니다."}
          </p>
          <p className="text-gray-600 mt-1">
            {(error || scheduleError)?.message}
          </p>
          <button
            onClick={handleBack}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            학생을 찾을 수 없습니다
          </h3>
          <p className="text-gray-500 mb-4">
            요청하신 학생 정보가 존재하지 않습니다.
          </p>
          <button
            onClick={handleBack}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Home className="w-5 h-5" />
              </Link>

              <button
                onClick={handleBack}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>

              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  {student.name} 시간표 관리
                </h1>
                <p className="text-sm text-gray-600">
                  개별 학생의 시간표를 수정할 수 있습니다
                </p>
              </div>
            </div>

            {/* 학생 정보 카드 */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
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
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* CanvasSchedule 컴포넌트 - 개별 학생 시간표 관리 */}
        <CanvasSchedule
          studentId={studentId}
          customBlocks={scheduleBlocks}
          onBlocksChange={handleBlocksChange}
          editMode={"admin"}
          showDensity={false}
        />
      </main>
    </div>
  );
}
