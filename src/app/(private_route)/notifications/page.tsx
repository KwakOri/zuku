"use client";

import { useState, useEffect, useMemo } from "react";
import { useStudents } from "@/queries/useStudents";
import { useSendKakaoNotification } from "@/queries/useNotifications";
import { usePendingStudents } from "@/queries/useMiddleRecords";
import { useAuthState } from "@/queries/useAuth";
import { PageHeader, PageLayout } from "@/components/common/layout";
import { formatDateToYYYYMMDD, getWeekStartDate } from "@/lib/utils";
import {
  Send,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  MessageSquare,
  Phone,
  User,
  BookOpen,
  AlertTriangle,
  FileText
} from "lucide-react";

interface StudentForNotification {
  id: string;
  name: string;
  parentPhone: string;
  grade: number;
}

export default function NotificationsPage() {
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set());
  const [isSending, setIsSending] = useState(false);
  const [sentCount, setSentCount] = useState(0);
  const [selectedWeek] = useState<string>(() => {
    return formatDateToYYYYMMDD(getWeekStartDate());
  });

  const { user } = useAuthState();
  const { data: students = [], isLoading, error } = useStudents();
  const { data: pendingData } = usePendingStudents(user?.id, selectedWeek);
  const sendNotification = useSendKakaoNotification();

  // 중등 학생만 필터링 (7-9학년) + 학부모 연락처가 있는 학생
  const middleSchoolStudents = useMemo(() => {
    return students.filter(student =>
      student.grade >= 7 &&
      student.grade <= 9 &&
      student.parent_phone
    );
  }, [students]);

  // 기록 작성된 학생 ID 목록
  const recordedStudentIds = useMemo(() => {
    if (!pendingData?.meta) return new Set<string>();

    const pendingIds = new Set(pendingData.data.map(item => item.student_id));
    return new Set(
      middleSchoolStudents
        .map(s => s.id)
        .filter(id => !pendingIds.has(id))
    );
  }, [middleSchoolStudents, pendingData]);

  // 기록 작성된 학생과 미작성 학생 분리
  const studentsWithRecord = useMemo(() => {
    return middleSchoolStudents.filter(s => recordedStudentIds.has(s.id));
  }, [middleSchoolStudents, recordedStudentIds]);

  const studentsWithoutRecord = useMemo(() => {
    return middleSchoolStudents.filter(s => !recordedStudentIds.has(s.id));
  }, [middleSchoolStudents, recordedStudentIds]);

  const handleStudentToggle = (studentId: string) => {
    const newSelected = new Set(selectedStudents);
    if (newSelected.has(studentId)) {
      newSelected.delete(studentId);
    } else {
      newSelected.add(studentId);
    }
    setSelectedStudents(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedStudents.size === studentsWithRecord.length) {
      setSelectedStudents(new Set());
    } else {
      setSelectedStudents(new Set(studentsWithRecord.map(s => s.id)));
    }
  };

  const handleSendNotifications = async () => {
    setIsSending(true);
    setSentCount(0);

    try {
      const selectedStudentData = studentsWithRecord.filter(student =>
        selectedStudents.has(student.id)
      );

      for (const student of selectedStudentData) {
        try {
          const response = await fetch('/api/notifications', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              studentId: student.id
            }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || '알림톡 전송에 실패했습니다.');
          }

          setSentCount(prev => prev + 1);
          // 각 전송 사이에 잠시 대기 (API 과부하 방지)
          await new Promise(resolve => setTimeout(resolve, 300));
        } catch (error) {
          console.error(`${student.name} 알림톡 전송 실패:`, error);
          // 개별 실패는 계속 진행
        }
      }

      alert(`${sentCount}명의 학부모님께 알림톡이 발송되었습니다!`);
      setSelectedStudents(new Set());
    } catch (error) {
      console.error('알림톡 발송 실패:', error);
      alert('알림톡 발송 중 오류가 발생했습니다.');
    } finally {
      setIsSending(false);
      setSentCount(0);
    }
  };

  const getGrade = (grade: number) => {
    if (grade <= 6) return `초등 ${grade}학년`;
    if (grade <= 9) return `중등 ${grade - 6}학년`;
    return `고등 ${grade - 9}학년`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">학생 데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-error-600">학생 데이터를 불러오는데 실패했습니다.</p>
          <p className="text-gray-600 mt-1">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        icon={FileText}
        title="중등 주간보고서 관리"
        description="중등 학생들의 주간 학습 기록을 학부모님께 전송하세요"
        actions={
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-lg font-bold text-primary-600">{selectedStudents.size}</div>
              <div className="text-xs text-gray-500">선택된 학생</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-success-600">{studentsWithRecord.length}</div>
              <div className="text-xs text-gray-500">기록 완료</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-orange-600">{studentsWithoutRecord.length}</div>
              <div className="text-xs text-gray-500">미작성</div>
            </div>
          </div>
        }
      />

      <PageLayout>

        {/* 액션 버튼 */}
        <div className="flat-card rounded-2xl border-0 p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleSelectAll}
                className="flex items-center space-x-2 px-4 py-2 flat-card rounded-2xl bg-neu-100 hover:flat-pressed transition-all duration-200"
              >
                <Users className="h-4 w-4" />
                <span>
                  {selectedStudents.size === studentsWithRecord.length ? '전체 해제' : '전체 선택'}
                </span>
              </button>
              <div className="text-sm text-gray-600">
                기록 완료: {studentsWithRecord.length}명 | 미작성: {studentsWithoutRecord.length}명
              </div>
            </div>
            <button
              onClick={handleSendNotifications}
              disabled={selectedStudents.size === 0 || isSending}
              className="flex items-center space-x-2 px-6 py-2 flat-card bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-2xl hover:from-primary-600 hover:to-primary-700 disabled:from-neu-300 disabled:to-neu-400 disabled:cursor-not-allowed disabled:text-gray-500 transition-all duration-200"
            >
              <Send className="h-4 w-4" />
              <span>
                {isSending ? `발송 중... (${sentCount}/${selectedStudents.size})` : '알림톡 발송'}
              </span>
            </button>
          </div>
        </div>

        {/* 기록 완료된 학생 목록 */}
        {studentsWithRecord.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-success-600" />
              기록 완료 ({studentsWithRecord.length}명)
            </h2>
            <div className="space-y-4">
              {studentsWithRecord.map((student) => (
            <div key={student.id} className="flat-card rounded-2xl border-0">
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <input
                      type="checkbox"
                      checked={selectedStudents.has(student.id)}
                      onChange={() => handleStudentToggle(student.id)}
                      className="h-5 w-5 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                    />
                    <div className="flex items-center space-x-3">
                      <div className="p-2 flat-surface bg-neu-100 rounded-2xl">
                        <User className="h-5 w-5 text-gray-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">
                          {student.name}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <BookOpen className="h-4 w-4" />
                            <span>{getGrade(student.grade)}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Phone className="h-4 w-4" />
                            <span>{student.parent_phone}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-6 w-6 text-success-500" />
                  </div>
                </div>
              </div>
            </div>
              ))}
            </div>
          </div>
        )}

        {/* 미작성 학생 목록 */}
        {studentsWithoutRecord.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <XCircle className="h-5 w-5 text-orange-600" />
              기록 미작성 ({studentsWithoutRecord.length}명)
            </h2>
            <div className="space-y-4">
              {studentsWithoutRecord.map((student) => (
                <div key={student.id} className="flat-card rounded-2xl border-0 bg-orange-50">
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 flat-surface bg-orange-100 rounded-2xl">
                            <User className="h-5 w-5 text-orange-600" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-800">
                              {student.name}
                            </h3>
                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                              <div className="flex items-center space-x-1">
                                <BookOpen className="h-4 w-4" />
                                <span>{getGrade(student.grade)}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Phone className="h-4 w-4" />
                                <span>{student.parent_phone}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <XCircle className="h-6 w-6 text-orange-500" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {middleSchoolStudents.length === 0 && !isLoading && (
          <div className="flat-card rounded-2xl border-0 p-8 text-center">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              중등 학생이 없습니다
            </h3>
            <p className="text-gray-600">
              학부모 연락처가 등록된 중등 학생(7-9학년)이 없습니다.
            </p>
          </div>
        )}
      </PageLayout>
    </>
  );
}