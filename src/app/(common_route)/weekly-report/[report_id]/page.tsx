"use client";

import { getGrade } from "@/lib/utils";
import {
  AlertCircle,
  Calendar,
  CheckCircle,
  Clock,
  FileText,
  School,
  User,
  XCircle,
} from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

interface HomeworkRecord {
  id: string;
  student_id: string;
  class_id: string;
  week_of: string;
  attendance: string;
  homework: string;
  participation: number;
  understanding: number;
  notes: string;
  created_date: string;
  classes: {
    id: string;
    subject_id: string;
    subjects: {
      id: string;
      subject_name: string;
    };
  };
}

interface Student {
  id: string;
  name: string;
  grade: number;
  school_id: string;
  schools: {
    id: string;
    name: string;
  } | null;
}

interface WeeklyReport {
  id: string;
  student_id: string;
  week_of: string;
  expired_at: string;
  created_at: string;
  students: Student;
}

interface WeeklyReportData {
  report: WeeklyReport;
  isExpired: boolean;
  homeworkRecords: HomeworkRecord[];
}

export default function WeeklyReportPage() {
  const params = useParams();
  const reportId = params?.report_id as string;

  const [data, setData] = useState<WeeklyReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!reportId) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/weekly-reports/${reportId}`);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error || "리포트를 불러오는데 실패했습니다."
          );
        }

        const result = await response.json();
        setData(result.data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [reportId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-neu-50">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto border-4 rounded-full border-primary-500 border-t-transparent animate-spin"></div>
          <p className="mt-4 text-neu-700">주간 리포트를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center min-h-screen px-4 bg-error-50">
        <div className="w-full max-w-md p-6 text-center flat-card">
          <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-error-100">
            <XCircle className="w-8 h-8 text-error-600" />
          </div>
          <h1 className="mb-2 text-xl font-bold text-neu-900">
            오류가 발생했습니다
          </h1>
          <p className="text-neu-700">
            {error || "리포트를 찾을 수 없습니다."}
          </p>
        </div>
      </div>
    );
  }

  // 만료된 경우
  if (data.isExpired) {
    return (
      <div className="flex items-center justify-center min-h-screen px-4 bg-warning-50">
        <div className="w-full max-w-md p-6 text-center flat-card">
          <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-warning-100">
            <Clock className="w-8 h-8 text-warning-600" />
          </div>
          <h1 className="mb-2 text-xl font-bold text-neu-900">
            링크가 만료되었습니다
          </h1>
          <p className="mb-4 text-neu-700">
            이 리포트는{" "}
            {new Date(data.report.expired_at).toLocaleDateString("ko-KR")}에
            만료되었습니다.
          </p>
          <p className="text-sm text-neu-600">
            리포트를 확인하시려면 로그인 후 학생 페이지에서 확인해주세요.
          </p>
        </div>
      </div>
    );
  }

  const { report, homeworkRecords } = data;
  const student = report.students;

  // 주차 계산 (week_of는 월요일)
  const weekStart = new Date(report.week_of);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6); // 일요일까지

  // 학교명 + 학년 표시 (예: "의정부고3", "효자중2")
  const getSchoolGradeLabel = () => {
    const schoolName = student.schools?.name || "학교정보없음";
    const gradeNumber = getGrade(student.grade, "half").replace(
      /[초중고]/g,
      ""
    );
    return `${schoolName}${gradeNumber}`;
  };

  // 과목별로 그룹화
  const recordsBySubject = homeworkRecords.reduce((acc, record) => {
    const subjectName = record.classes?.subjects?.subject_name;
    if (!subjectName) return acc; // subjects 정보가 없으면 스킵
    if (!acc[subjectName]) {
      acc[subjectName] = [];
    }
    acc[subjectName].push(record);
    return acc;
  }, {} as Record<string, HomeworkRecord[]>);

  // 출석 상태 영어 → 한글 변환
  const getAttendanceLabel = (attendance: string): string => {
    const labelMap: Record<string, string> = {
      present: "출석",
      absent: "결석",
      late: "지각",
    };
    return labelMap[attendance] || attendance;
  };

  // 숙제 상태 영어 → 한글 변환
  const getHomeworkLabel = (homework: string): string => {
    const labelMap: Record<string, string> = {
      excellent: "완벽",
      good: "잘함",
      fair: "보통",
      poor: "미흡",
      not_submitted: "미제출",
    };
    return labelMap[homework] || homework;
  };

  // homework 값을 기반으로 완료 상태 판단
  const getHomeworkStatus = (
    homework: string
  ): "completed" | "incomplete" | "partial" => {
    if (!homework || homework === "not_submitted") return "incomplete";
    if (homework === "excellent" || homework === "good") return "completed";
    return "partial"; // fair, poor 등
  };

  // 출석 상태별 칩
  const getAttendanceChip = (attendance: string) => {
    const statusMap: Record<
      string,
      { bg: string; text: string }
    > = {
      present: { bg: "bg-success-100", text: "text-success-700" },
      late: { bg: "bg-warning-100", text: "text-warning-700" },
      absent: { bg: "bg-error-100", text: "text-error-700" },
    };

    const status = statusMap[attendance] || {
      bg: "bg-neu-100",
      text: "text-neu-700",
    };

    return (
      <span
        className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${status.bg} ${status.text}`}
      >
        {getAttendanceLabel(attendance)}
      </span>
    );
  };

  // 숙제 상태별 칩
  const getHomeworkChip = (homework: string) => {
    const status = getHomeworkStatus(homework);
    const statusMap = {
      completed: { bg: "bg-success-100", text: "text-success-700" },
      partial: { bg: "bg-warning-100", text: "text-warning-700" },
      incomplete: { bg: "bg-error-100", text: "text-error-700" },
    };

    const style = statusMap[status];

    return (
      <span
        className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${style.bg} ${style.text}`}
      >
        {getHomeworkLabel(homework)}
      </span>
    );
  };

  // 점수 프로그레스바 (5점 만점)
  const getScoreProgressBar = (score: number, maxScore: number = 5) => {
    const percentage = (score / maxScore) * 100;

    // 점수에 따른 색상 결정
    let colorClass = "bg-success-500";
    if (percentage < 40) {
      colorClass = "bg-error-500";
    } else if (percentage < 70) {
      colorClass = "bg-warning-500";
    }

    return (
      <div className="flex items-center gap-2">
        <div className="flex-1 h-2 overflow-hidden rounded-full bg-neu-200">
          <div
            className={`h-full transition-all duration-300 ${colorClass}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <span className="text-sm font-medium text-neu-900 min-w-[2rem]">
          {score}/{maxScore}
        </span>
      </div>
    );
  };

  // 숙제 완료 상태별 아이콘 및 색상
  const getCompletionBadge = (
    status: "completed" | "incomplete" | "partial"
  ) => {
    switch (status) {
      case "completed":
        return (
          <div className="flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full text-success-700 bg-success-100">
            <CheckCircle className="w-3 h-3" />
            <span>완료</span>
          </div>
        );
      case "partial":
        return (
          <div className="flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full text-warning-700 bg-warning-100">
            <AlertCircle className="w-3 h-3" />
            <span>부분완료</span>
          </div>
        );
      case "incomplete":
        return (
          <div className="flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full text-error-700 bg-error-100">
            <XCircle className="w-3 h-3" />
            <span>미완료</span>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen px-4 py-6 bg-neu-50">
      <div className="max-w-2xl mx-auto">
        {/* 헤더 */}
        <div className="mb-6 overflow-hidden flat-card">
          <div className="p-6 bg-gradient-to-r from-primary-600 to-secondary-600">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-12 h-12 bg-white rounded-full">
                <FileText className="w-6 h-6 text-primary-600" />
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-white">
                  주간 학습 리포트
                </h1>
                <div className="flex items-center gap-2 mt-1 text-sm text-primary-50">
                  <span>{getSchoolGradeLabel()}</span>
                  <span className="text-primary-200">·</span>
                  <span>{student.name}</span>
                </div>
                <p className="mt-1 text-xs md:block text-primary-100">
                  {new Date(weekStart).toLocaleDateString("ko-KR")} ~{" "}
                  {new Date(weekEnd).toLocaleDateString("ko-KR")}
                </p>
              </div>
            </div>
          </div>

          <div className="hidden p-6 space-y-3 md:block">
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-neu-500" />
              <div>
                <p className="text-sm text-neu-600">학생</p>
                <p className="font-semibold text-neu-900">{student.name}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <School className="w-5 h-5 text-neu-500" />
              <div>
                <p className="text-sm text-neu-600">학교 / 학년</p>
                <p className="font-semibold text-neu-900">
                  {student.schools?.name || "학교 정보 없음"} ·{" "}
                  {getGrade(student.grade, "half")}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-neu-500" />
              <div>
                <p className="text-sm text-neu-600">리포트 생성일</p>
                <p className="font-semibold text-neu-900">
                  {new Date(report.created_at).toLocaleDateString("ko-KR", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 과목별 숙제 기록 */}
        {Object.keys(recordsBySubject).length === 0 ? (
          <div className="p-8 text-center flat-card">
            <FileText className="w-16 h-16 mx-auto mb-4 text-neu-300" />
            <p className="text-neu-600">이번 주 학습 기록이 없습니다.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(recordsBySubject).map(([subjectName, records]) => (
              <div key={subjectName} className="overflow-hidden flat-card">
                <div className="px-4 py-3 bg-gradient-to-r from-primary-500 to-primary-600">
                  <h2 className="text-lg font-bold text-white">
                    {subjectName}
                  </h2>
                </div>

                <div className="p-4 space-y-3">
                  {records.map((record) => (
                    <div
                      key={record.id}
                      className="p-4 transition-all border border-neu-300 rounded-xl hover:border-neu-400"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="text-sm font-medium text-neu-900">
                            {new Date(record.created_date).toLocaleDateString(
                              "ko-KR",
                              {
                                month: "long",
                                day: "numeric",
                                weekday: "short",
                              }
                            )}
                          </p>
                        </div>
                        {getCompletionBadge(getHomeworkStatus(record.homework))}
                      </div>

                      {/* 출석 & 숙제 칩 */}
                      <div className="flex items-center gap-2 mb-3">
                        {getAttendanceChip(record.attendance)}
                        <span className="text-neu-300">·</span>
                        {getHomeworkChip(record.homework)}
                      </div>

                      {/* 참여도 */}
                      <div className="mb-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-neu-600">참여도</span>
                        </div>
                        {getScoreProgressBar(record.participation, 5)}
                      </div>

                      {/* 이해도 */}
                      <div className="mb-2">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-neu-600">이해도</span>
                        </div>
                        {getScoreProgressBar(record.understanding, 5)}
                      </div>

                      {record.notes && (
                        <div className="p-3 mt-2 text-sm rounded-lg bg-neu-50">
                          <p className="mb-1 font-medium text-neu-800">
                            특이사항
                          </p>
                          <p className="whitespace-pre-wrap text-neu-700">
                            {record.notes}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 푸터 */}
        <div className="mt-6 text-center">
          <p className="text-sm text-neu-600">
            이 링크는 {new Date(report.expired_at).toLocaleDateString("ko-KR")}
            까지 유효합니다.
          </p>
        </div>
      </div>
    </div>
  );
}
