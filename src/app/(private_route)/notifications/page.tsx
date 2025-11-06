"use client";

import { PageHeader, PageLayout } from "@/components/common/layout";
import { getGrade } from "@/lib/utils";
import {
  useSendBulkAlimtalk,
  useSendSingleAlimtalk,
} from "@/queries/useAlimtalk";
import { useAuthState } from "@/queries/useAuth";
import { useStudentSubjectsBatch } from "@/queries/useClassStudents";
import { useMiddleRecords } from "@/queries/useMiddleRecords";
import { useStudents } from "@/queries/useStudents";
import {
  useCreateWeeklyReportLog,
  useWeeklyReportLogs,
} from "@/queries/useWeeklyReportLogs";
import { addWeeks, endOfWeek, format, startOfWeek, subWeeks } from "date-fns";
import { ko } from "date-fns/locale";
import {
  Calendar,
  CheckCircle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Loader2,
  MessageSquare,
  Phone,
  Send,
  User,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

// 고정 템플릿 ID
const TEMPLATE_ID = process.env.NEXT_PUBLIC_WEEKLY_REPORT_TEMPLATE_ID || "";

// 버튼 URL 베이스
const HOMEWORK_URL_BASE =
  process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

interface TemplateVariable {
  key: string;
  value: string;
}

interface RecipientData {
  studentId: string;
  studentName: string;
  parentPhone: string;
  variables: TemplateVariable[];
  reportId: string; // 중등 기록 ID
}

export default function NotificationsPage() {
  // 현재 주의 월요일을 기본값으로 설정
  const getCurrentMonday = () => {
    const today = new Date();
    const monday = startOfWeek(today, { weekStartsOn: 1 });
    return monday;
  };

  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(
    new Set()
  );
  const [recipientsData, setRecipientsData] = useState<RecipientData[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [expandedStudent, setExpandedStudent] = useState<string | null>(null);
  const [currentMonday, setCurrentMonday] = useState<Date>(getCurrentMonday());
  const [activeTab, setActiveTab] = useState<"all" | "unavailable" | "sent">(
    "all"
  );

  const { data: students = [], isLoading: studentsLoading } = useStudents();
  const sendSingle = useSendSingleAlimtalk();
  const sendBulk = useSendBulkAlimtalk();
  const createWeeklyReportLog = useCreateWeeklyReportLog();
  const { user } = useAuthState();

  // 주간 시작/종료 날짜 계산
  const weekStartDate = useMemo(() => {
    return format(currentMonday, "yyyy-MM-dd");
  }, [currentMonday]);

  const weekEndDate = useMemo(() => {
    const sunday = endOfWeek(currentMonday, { weekStartsOn: 1 });
    return format(sunday, "yyyy-MM-dd");
  }, [currentMonday]);

  // 주간 시작 날짜로 week_of 계산 (해당 주의 월요일)
  const weekOf = useMemo(() => {
    return weekStartDate;
  }, [weekStartDate]);

  // 해당 주차의 중등 기록 조회
  const { data: middleRecords = [], isLoading: middleRecordsLoading } =
    useMiddleRecords({
      weekOf,
    });

  // 해당 주차의 발송 기록 조회
  const { data: weeklyReportLogs = [], isLoading: logsLoading } =
    useWeeklyReportLogs({
      week_of: weekOf,
    });

  // 중등 학생만 필터링 (7~9학년)
  const middleSchoolStudents = useMemo(() => {
    return students.filter(
      (student) => student.grade >= 7 && student.grade <= 9
    );
  }, [students]);

  // 중등 학생들의 수강 과목 조회
  const middleSchoolStudentIds = useMemo(
    () => middleSchoolStudents.map((s) => s.id),
    [middleSchoolStudents]
  );

  const { data: studentSubjectsMap = {}, isLoading: subjectsLoading } =
    useStudentSubjectsBatch(middleSchoolStudentIds);

  // 학생별 상태 확인 (중등 학생만 표시) - 발송 가능한 학생 우선 정렬
  const studentsWithStatus = useMemo(() => {
    const studentsWithInfo = middleSchoolStudents.map((student) => {
      const hasParentPhone = !!student.parent_phone;

      // 학생의 수강 과목 목록
      const studentSubjects = studentSubjectsMap[student.id] || [];

      // 해당 주에 작성된 기록들 (학생별)
      const studentRecords = middleRecords.filter(
        (r) => r.student_id === student.id
      );

      // 기록이 있는 과목 ID 목록 (class -> subject)
      const completedSubjectIds = new Set(
        studentRecords
          .map((r) => r.class?.subject?.id)
          .filter((id): id is string => !!id)
      );

      // 과목별 완료 상태
      const subjectsWithStatus = studentSubjects.map((subject) => ({
        ...subject,
        hasRecord: completedSubjectIds.has(subject.id),
      }));

      // 미작성 과목 목록
      const missingSubjects = subjectsWithStatus.filter((s) => !s.hasRecord);

      // 모든 과목에 기록이 있는지 확인
      const allSubjectsCompleted =
        studentSubjects.length > 0 && missingSubjects.length === 0;

      // 발송 기록 확인 - 해당 학생의 모든 과목에 대해 발송 기록이 있는지
      const studentLogs = weeklyReportLogs.filter(
        (log) => log.student_id === student.id
      );
      const sentSubjectIds = new Set(studentLogs.map((log) => log.subject_id));

      // 모든 수강 과목에 대해 발송 기록이 있으면 이미 발송 완료
      const isAlreadySent =
        studentSubjects.length > 0 &&
        studentSubjects.every((subject) => sentSubjectIds.has(subject.id));

      // 발송 가능 여부 (작성 완료 + 미발송)
      const isEligible =
        hasParentPhone && allSubjectsCompleted && !isAlreadySent;

      // 누락 정보 목록
      const missingInfo: string[] = [];
      if (!hasParentPhone) missingInfo.push("부모님 연락처");
      if (studentSubjects.length === 0) missingInfo.push("수강 과목");

      // reportId 가져오기
      const record = middleRecords.find((r) => r.student_id === student.id);
      const reportId = record?.id;

      return {
        ...student,
        hasParentPhone,
        studentSubjects: subjectsWithStatus,
        completedSubjectIds: Array.from(completedSubjectIds),
        missingSubjects,
        isEligible,
        isAlreadySent,
        missingInfo,
        reportId,
      };
    });

    // 발송 가능한 학생을 먼저, 발송 완료는 마지막에 정렬
    return studentsWithInfo.sort((a, b) => {
      if (a.isAlreadySent && !b.isAlreadySent) return 1;
      if (!a.isAlreadySent && b.isAlreadySent) return -1;
      if (a.isEligible && !b.isEligible) return -1;
      if (!a.isEligible && b.isEligible) return 1;
      return 0;
    });
  }, [
    middleSchoolStudents,
    middleRecords,
    studentSubjectsMap,
    weeklyReportLogs,
  ]);

  // 탭별 필터링된 학생 목록
  const filteredStudents = useMemo(() => {
    if (activeTab === "unavailable") {
      return studentsWithStatus.filter(
        (s) => !s.isEligible && !s.isAlreadySent
      );
    }
    if (activeTab === "sent") {
      return studentsWithStatus.filter((s) => s.isAlreadySent);
    }
    return studentsWithStatus;
  }, [studentsWithStatus, activeTab]);

  // 미발송 학생 수 (발송 완료 제외)
  const unavailableStudentsCount = useMemo(() => {
    return studentsWithStatus.filter((s) => !s.isEligible && !s.isAlreadySent)
      .length;
  }, [studentsWithStatus]);

  // 발송 완료 학생 수
  const sentStudentsCount = useMemo(() => {
    return studentsWithStatus.filter((s) => s.isAlreadySent).length;
  }, [studentsWithStatus]);

  // 고정된 템플릿 변수: start_date, end_date, student
  const templateVariables = ["start_date", "end_date", "student"];

  // 이전 주로 이동
  const goToPreviousWeek = () => {
    setCurrentMonday((prev) => subWeeks(prev, 1));
  };

  // 다음 주로 이동
  const goToNextWeek = () => {
    setCurrentMonday((prev) => addWeeks(prev, 1));
  };

  // 이번 주로 이동
  const goToCurrentWeek = () => {
    setCurrentMonday(getCurrentMonday());
  };

  // 주가 변경될 때마다 선택된 학생들의 날짜 변수 업데이트
  useEffect(() => {
    setRecipientsData((prev) =>
      prev.map((r) => ({
        ...r,
        variables: r.variables.map((v) => {
          if (v.key === "start_date") return { ...v, value: weekStartDate };
          if (v.key === "end_date") return { ...v, value: weekEndDate };
          return v;
        }),
      }))
    );
  }, [weekStartDate, weekEndDate]);

  // 학생 선택/해제
  const handleStudentToggle = (studentId: string) => {
    const newSelected = new Set(selectedStudents);
    if (newSelected.has(studentId)) {
      newSelected.delete(studentId);
      setRecipientsData((prev) =>
        prev.filter((r) => r.studentId !== studentId)
      );
    } else {
      newSelected.add(studentId);
      const student = studentsWithStatus.find((s) => s.id === studentId);

      if (student && student.isEligible && student.reportId) {
        setRecipientsData((prev) => [
          ...prev,
          {
            studentId: student.id,
            studentName: student.name,
            parentPhone: student.parent_phone || "",
            reportId: student.reportId!, // 위 if문에서 이미 체크함
            variables: [
              { key: "start_date", value: weekStartDate },
              { key: "end_date", value: weekEndDate },
              { key: "student", value: student.name },
            ],
          },
        ]);
      }
    }
    setSelectedStudents(newSelected);
  };

  // 전체 선택/해제
  const handleSelectAll = () => {
    const eligibleStudents = studentsWithStatus.filter((s) => s.isEligible);

    if (selectedStudents.size === eligibleStudents.length) {
      setSelectedStudents(new Set());
      setRecipientsData([]);
    } else {
      const allIds = new Set(eligibleStudents.map((s) => s.id));
      setSelectedStudents(allIds);
      setRecipientsData(
        eligibleStudents
          .filter((student) => student.reportId) // reportId가 있는 학생만
          .map((student) => ({
            studentId: student.id,
            studentName: student.name,
            parentPhone: student.parent_phone || "",
            reportId: student.reportId!, // filter에서 이미 체크함
            variables: [
              { key: "start_date", value: weekStartDate },
              { key: "end_date", value: weekEndDate },
              { key: "student", value: student.name },
            ],
          }))
      );
    }
  };

  // 변수 값 업데이트
  const handleVariableChange = (
    studentId: string,
    variableKey: string,
    value: string
  ) => {
    setRecipientsData((prev) =>
      prev.map((recipient) => {
        if (recipient.studentId === studentId) {
          return {
            ...recipient,
            variables: recipient.variables.map((v) =>
              v.key === variableKey ? { ...v, value } : v
            ),
          };
        }
        return recipient;
      })
    );
  };

  // 단일 발송
  const handleSendSingle = async (recipientData: RecipientData) => {
    if (!TEMPLATE_ID) {
      alert("템플릿 ID가 설정되지 않았습니다.");
      return;
    }

    if (!user?.id) {
      alert("사용자 정보를 불러올 수 없습니다. 다시 로그인해주세요.");
      return;
    }

    const variables = recipientData.variables.reduce((acc, v) => {
      acc[v.key] = v.value;
      return acc;
    }, {} as Record<string, string>);

    // report_id와 student_id를 variables에 포함
    variables.report_id = recipientData.reportId;
    variables.student_id = recipientData.studentId;

    try {
      // 알림톡 발송
      await sendSingle.mutateAsync({
        templateId: TEMPLATE_ID,
        to: recipientData.parentPhone,
        variables,
      });

      // 발송 성공 시 로그 저장
      const student = studentsWithStatus.find(
        (s) => s.id === recipientData.studentId
      );
      if (student && student.studentSubjects.length > 0) {
        const subjectIds = student.studentSubjects.map((s) => s.id);
        await createWeeklyReportLog.mutateAsync({
          week_of: weekOf,
          student_id: recipientData.studentId,
          subject_ids: subjectIds,
          sent_by: user.id,
        });
      }

      alert(`${recipientData.studentName} 학부모님께 알림톡이 발송되었습니다.`);
    } catch (error) {
      alert(
        `발송 실패: ${
          error instanceof Error ? error.message : "알 수 없는 오류"
        }`
      );
    }
  };

  // 일괄 발송
  const handleBulkSend = async () => {
    if (!TEMPLATE_ID) {
      alert("템플릿 ID가 설정되지 않았습니다.");
      return;
    }

    if (!user?.id) {
      alert("사용자 정보를 불러올 수 없습니다. 다시 로그인해주세요.");
      return;
    }

    if (recipientsData.length === 0) {
      alert("발송할 대상을 선택해주세요.");
      return;
    }

    // 모든 변수가 입력되었는지 확인
    const incompleteRecipients = recipientsData.filter((r) =>
      r.variables.some((v) => !v.value.trim())
    );

    if (incompleteRecipients.length > 0) {
      alert(
        `다음 학생의 변수가 입력되지 않았습니다:\n${incompleteRecipients
          .map((r) => r.studentName)
          .join(", ")}`
      );
      return;
    }

    setIsSending(true);

    try {
      const recipients = recipientsData.map((r) => {
        const variables = r.variables.reduce((acc, v) => {
          acc[v.key] = v.value;
          return acc;
        }, {} as Record<string, string>);

        // report_id와 student_id를 variables에 포함
        variables.report_id = r.reportId;
        variables.student_id = r.studentId;

        return {
          to: r.parentPhone,
          variables,
        };
      });

      // 알림톡 발송
      await sendBulk.mutateAsync({
        templateId: TEMPLATE_ID,
        recipients,
      });

      // 발송 성공 시 각 학생별로 로그 저장
      for (const recipient of recipientsData) {
        const student = studentsWithStatus.find(
          (s) => s.id === recipient.studentId
        );
        if (student && student.studentSubjects.length > 0) {
          const subjectIds = student.studentSubjects.map((s) => s.id);
          try {
            await createWeeklyReportLog.mutateAsync({
              week_of: weekOf,
              student_id: recipient.studentId,
              subject_ids: subjectIds,
              sent_by: user.id,
            });
          } catch (logError) {
            console.error(
              `로그 저장 실패 (${recipient.studentName}):`,
              logError
            );
          }
        }
      }

      alert(`${recipientsData.length}명의 학부모님께 알림톡이 발송되었습니다.`);
      setSelectedStudents(new Set());
      setRecipientsData([]);
    } catch (error) {
      alert(
        `발송 실패: ${
          error instanceof Error ? error.message : "알 수 없는 오류"
        }`
      );
    } finally {
      setIsSending(false);
    }
  };

  if (studentsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 mx-auto border-b-2 rounded-full animate-spin border-primary-600"></div>
          <p className="mt-2 text-gray-600">데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        icon={MessageSquare}
        title="주간 보고서 알림톡 (중등)"
        description="주간 기간을 설정하고 중등 학생 학부모님께 알림톡을 발송하세요"
        actions={
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-lg font-bold text-primary-600">
                {selectedStudents.size}
              </div>
              <div className="text-xs text-gray-500">선택된 학생</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-success-600">
                {studentsWithStatus.filter((s) => s.isEligible).length}
              </div>
              <div className="text-xs text-gray-500">발송 가능</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-green-600">
                {studentsWithStatus.filter((s) => s.isAlreadySent).length}
              </div>
              <div className="text-xs text-gray-500">발송 완료</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-gray-600">
                {studentsWithStatus.length}
              </div>
              <div className="text-xs text-gray-500">중등 학생</div>
            </div>
          </div>
        }
      />

      <PageLayout>
        {/* 주간 기간 설정 */}
        <div className="p-6 mb-6 border-0 flat-card rounded-2xl">
          <h2 className="flex items-center gap-2 mb-4 text-lg font-semibold text-gray-900">
            <Calendar className="w-5 h-5 text-primary-600" />
            주간 선택
          </h2>
          <div className="flex items-center justify-between">
            <button
              onClick={goToPreviousWeek}
              className="p-3 transition-all duration-200 flat-card rounded-2xl bg-neu-100 hover:flat-pressed"
            >
              <ChevronLeft className="w-5 h-5 text-gray-700" />
            </button>

            <div className="flex flex-col items-center gap-2">
              <div className="text-2xl font-bold text-gray-900">
                {format(currentMonday, "yyyy년 MM월 dd일", { locale: ko })} ~{" "}
                {format(new Date(weekEndDate), "MM월 dd일", { locale: ko })}
              </div>
              <button
                onClick={goToCurrentWeek}
                className="text-sm font-medium underline text-primary-600 hover:text-primary-700"
              >
                이번 주로 이동
              </button>
            </div>

            <button
              onClick={goToNextWeek}
              className="p-3 transition-all duration-200 flat-card rounded-2xl bg-neu-100 hover:flat-pressed"
            >
              <ChevronRight className="w-5 h-5 text-gray-700" />
            </button>
          </div>
          <div className="p-4 mt-4 bg-primary-50 rounded-xl">
            <p className="text-sm text-center text-primary-700">
              <strong>주간 보고서:</strong>{" "}
              {format(currentMonday, "M월 d일", { locale: ko })} (월) ~{" "}
              {format(new Date(weekEndDate), "M월 d일", { locale: ko })} (일)
            </p>
          </div>
        </div>

        {/* 액션 버튼 */}
        <div className="p-4 mb-6 border-0 flat-card rounded-2xl">
          <div className="flex items-center justify-between">
            <button
              onClick={handleSelectAll}
              className="flex items-center px-4 py-2 space-x-2 transition-all duration-200 flat-card rounded-2xl bg-neu-100 hover:flat-pressed"
            >
              <CheckCircle className="w-4 h-4" />
              <span>
                {selectedStudents.size ===
                studentsWithStatus.filter((s) => s.isEligible).length
                  ? "전체 해제"
                  : "전체 선택"}
              </span>
            </button>
            <button
              onClick={handleBulkSend}
              disabled={selectedStudents.size === 0 || isSending}
              className="flex items-center px-6 py-2 space-x-2 text-white transition-all duration-200 flat-card bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl hover:from-primary-600 hover:to-primary-700 disabled:from-neu-300 disabled:to-neu-400 disabled:cursor-not-allowed disabled:text-gray-500"
            >
              {isSending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              <span>
                {isSending
                  ? "발송 중..."
                  : `일괄 발송 (${selectedStudents.size}명)`}
              </span>
            </button>
          </div>
        </div>

        {/* 학생 목록 */}
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
              <User className="w-5 h-5 text-primary-600" />
              중등 학생 목록
            </h2>
          </div>

          {/* 탭 */}
          <div className="p-2 mb-4 border-0 flat-card rounded-2xl">
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab("all")}
                className={`flex-1 px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                  activeTab === "all"
                    ? "bg-primary-600 text-white shadow-md"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                전체 ({studentsWithStatus.length})
              </button>
              <button
                onClick={() => setActiveTab("unavailable")}
                className={`flex-1 px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                  activeTab === "unavailable"
                    ? "bg-red-600 text-white shadow-md"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                미발송 학생 ({unavailableStudentsCount})
              </button>
              <button
                onClick={() => setActiveTab("sent")}
                className={`flex-1 px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                  activeTab === "sent"
                    ? "bg-green-600 text-white shadow-md"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                발송 완료 ({sentStudentsCount})
              </button>
            </div>
          </div>

          {filteredStudents.map((student) => {
            const isSelected = selectedStudents.has(student.id);
            const recipientData = recipientsData.find(
              (r) => r.studentId === student.id
            );
            const isExpanded = expandedStudent === student.id;
            const isDisabled = !student.isEligible || student.isAlreadySent;

            return (
              <div
                key={student.id}
                className={`flat-card rounded-2xl border-0 ${
                  isSelected
                    ? "bg-primary-50"
                    : student.isAlreadySent
                    ? "bg-green-50 opacity-75"
                    : isDisabled
                    ? "bg-gray-50 opacity-75"
                    : ""
                }`}
              >
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleStudentToggle(student.id)}
                        disabled={isDisabled}
                        className="w-5 h-5 border-gray-300 rounded text-primary-600 focus:ring-primary-500 disabled:cursor-not-allowed disabled:opacity-50"
                      />
                      <div className="flex items-center space-x-3">
                        <div className="p-2 flat-surface bg-neu-100 rounded-2xl">
                          <User className="w-5 h-5 text-gray-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-semibold text-gray-800">
                              {student.name}
                            </h3>
                            {student.isAlreadySent && (
                              <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-lg">
                                <CheckCircle className="w-3 h-3" />
                                발송 완료
                              </span>
                            )}
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span>{getGrade(student.grade, "half")}</span>
                            {student.hasParentPhone ? (
                              <div className="flex items-center space-x-1">
                                <Phone className="w-4 h-4" />
                                <span>{student.parent_phone}</span>
                              </div>
                            ) : (
                              <div className="flex items-center space-x-1 text-red-600">
                                <Phone className="w-4 h-4" />
                                <span>연락처 없음</span>
                              </div>
                            )}
                          </div>
                          {/* 누락된 정보 표시 */}
                          {(student.missingInfo.length > 0 || student.missingSubjects.length > 0) &&
                            !student.isAlreadySent && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {/* 기본 누락 정보 (부모님 연락처, 수강 과목) */}
                                {student.missingInfo.map((info) => (
                                  <span
                                    key={info}
                                    className="px-2 py-1 text-xs font-medium text-red-700 bg-red-100 rounded-lg"
                                  >
                                    {info} 없음
                                  </span>
                                ))}
                                {/* 미작성 과목별 칩 */}
                                {student.missingSubjects.map((subject) => (
                                  <span
                                    key={subject.id}
                                    className="px-2 py-1 text-xs font-medium text-orange-700 bg-orange-100 rounded-lg"
                                  >
                                    {subject.subject_name} 미작성
                                  </span>
                                ))}
                              </div>
                            )}
                        </div>
                      </div>
                    </div>
                    {isSelected && templateVariables.length > 0 && (
                      <button
                        onClick={() =>
                          setExpandedStudent(isExpanded ? null : student.id)
                        }
                        className="p-2 transition-colors rounded-lg hover:bg-gray-100"
                      >
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5 text-gray-600" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-600" />
                        )}
                      </button>
                    )}
                  </div>

                  {/* 변수 입력 폼 */}
                  {isSelected && isExpanded && recipientData && (
                    <div className="pt-4 mt-4 border-t border-gray-200">
                      <div className="grid grid-cols-1 gap-4 mb-4">
                        {recipientData.variables.map((variable) => (
                          <div key={variable.key}>
                            <label className="block mb-1 text-sm font-medium text-gray-700">
                              {variable.key === "start_date"
                                ? "시작 날짜"
                                : variable.key === "end_date"
                                ? "종료 날짜"
                                : "학생 이름"}
                            </label>
                            <input
                              type={
                                variable.key === "start_date" ||
                                variable.key === "end_date"
                                  ? "date"
                                  : "text"
                              }
                              value={variable.value}
                              onChange={(e) =>
                                handleVariableChange(
                                  student.id,
                                  variable.key,
                                  e.target.value
                                )
                              }
                              readOnly
                              className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg cursor-not-allowed"
                            />
                          </div>
                        ))}
                      </div>
                      <button
                        onClick={() => handleSendSingle(recipientData)}
                        disabled={recipientData.variables.some(
                          (v) => !v.value.trim()
                        )}
                        className="flex items-center justify-center w-full px-4 py-2 space-x-2 text-white transition-colors rounded-lg bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                      >
                        <Send className="w-4 h-4" />
                        <span>개별 발송</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {filteredStudents.length === 0 && (
            <div className="p-8 text-center border-0 flat-card rounded-2xl">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              {activeTab === "unavailable" ? (
                <>
                  <h3 className="mb-2 text-lg font-semibold text-gray-800">
                    미발송 학생이 없습니다
                  </h3>
                  <p className="text-gray-600">
                    모든 학생이 발송 가능하거나 이미 발송 완료되었습니다.
                  </p>
                </>
              ) : activeTab === "sent" ? (
                <>
                  <h3 className="mb-2 text-lg font-semibold text-gray-800">
                    발송 완료된 학생이 없습니다
                  </h3>
                  <p className="text-gray-600">
                    이번 주에 발송된 알림톡이 없습니다.
                  </p>
                </>
              ) : (
                <>
                  <h3 className="mb-2 text-lg font-semibold text-gray-800">
                    등록된 중등 학생이 없습니다
                  </h3>
                  <p className="text-gray-600">
                    중1~중3 학생을 먼저 등록해주세요.
                  </p>
                </>
              )}
            </div>
          )}
        </div>
      </PageLayout>
    </>
  );
}
