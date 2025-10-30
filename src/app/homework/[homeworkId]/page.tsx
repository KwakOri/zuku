"use client";

import { useParams } from "next/navigation";
import { useMiddleRecord } from "@/queries/useMiddleRecords";
import { getGrade } from "@/lib/utils";
import { Card } from "@/components/design-system";
import {
  BookOpen,
  Calendar,
  CheckCircle,
  Clock,
  TrendingUp,
  XCircle,
  Star,
  User,
  School,
  FileText,
  Loader2,
} from "lucide-react";

export default function HomeworkDetailPage() {
  const params = useParams();
  const homeworkId = params.homeworkId as string;

  const { data: record, isLoading, error } = useMiddleRecord(homeworkId);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 mx-auto mb-4 text-primary-600 animate-spin" />
          <p className="text-gray-600">기록을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error || !record) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">기록을 찾을 수 없습니다</h2>
          <p className="text-gray-600">요청하신 기록이 존재하지 않거나 삭제되었습니다.</p>
        </div>
      </div>
    );
  }

  // 출석 상태 옵션
  const attendanceOptions = [
    {
      value: "present",
      label: "출석",
      color: "text-green-600 bg-green-50",
      icon: CheckCircle,
    },
    {
      value: "late",
      label: "지각",
      color: "text-yellow-600 bg-yellow-50",
      icon: Clock,
    },
    {
      value: "absent",
      label: "결석",
      color: "text-red-600 bg-red-50",
      icon: XCircle,
    },
  ];

  // 숙제 상태 옵션
  const homeworkOptions = [
    {
      value: "excellent",
      label: "우수",
      color: "text-primary-700 bg-primary-100",
    },
    {
      value: "good",
      label: "양호",
      color: "text-primary-600 bg-primary-50",
    },
    {
      value: "fair",
      label: "보통",
      color: "text-yellow-600 bg-yellow-50",
    },
    {
      value: "poor",
      label: "미흡",
      color: "text-orange-600 bg-orange-50",
    },
    {
      value: "not_submitted",
      label: "미제출",
      color: "text-red-600 bg-red-50",
    },
  ];

  const attendanceOpt = attendanceOptions.find(
    (opt) => opt.value === record.attendance
  );
  const homeworkOpt = homeworkOptions.find(
    (opt) => opt.value === record.homework
  );

  const getScoreColor = (score: number) => {
    if (score >= 4) return "text-primary-600 bg-primary-50";
    if (score >= 3) return "text-green-600 bg-green-50";
    if (score >= 2) return "text-yellow-600 bg-yellow-50";
    return "text-red-600 bg-red-50";
  };

  const getScoreLabel = (score: number) => {
    if (score === 1) return "매우 부족";
    if (score === 2) return "부족";
    if (score === 3) return "보통";
    if (score === 4) return "좋음";
    if (score === 5) return "매우 좋음";
    return "";
  };

  const renderStars = (score: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-5 h-5 ${
          i < score ? "text-yellow-400 fill-current" : "text-gray-300"
        }`}
      />
    ));
  };

  const formatWeekRange = (weekOf: string) => {
    const startDate = new Date(weekOf);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);

    return `${startDate.getMonth() + 1}월 ${startDate.getDate()}일 ~ ${
      endDate.getMonth() + 1
    }월 ${endDate.getDate()}일`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-purple-50 to-pink-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* 헤더 */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <BookOpen className="w-8 h-8 text-primary-600" />
            <h1 className="text-3xl font-bold text-gray-900">주간 학습 기록</h1>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Calendar className="w-4 h-4" />
            <span className="text-sm font-medium">
              {formatWeekRange(record.week_of)}
            </span>
          </div>
        </div>

        {/* 학생 정보 카드 */}
        <Card size="lg" className="mb-6">
          <div className="flex items-start gap-6">
            <div className="flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex-shrink-0">
              <span className="text-2xl font-bold text-white">
                {record.student?.name.charAt(0)}
              </span>
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {record.student?.name}
              </h2>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-600">
                  <User className="w-4 h-4" />
                  <span className="text-sm">
                    {getGrade(record.student?.grade || 0, "full")}
                  </span>
                </div>
                {record.class && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <BookOpen className="w-4 h-4" />
                    <span className="text-sm">
                      {record.class.subject?.subject_name} - {record.class.title}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* 학습 평가 카드 */}
        <Card size="lg" className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary-600" />
            학습 평가
          </h3>

          <div className="space-y-6">
            {/* 출석 상태 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                출석 상태
              </label>
              {attendanceOpt && (
                <div className="inline-flex items-center gap-2">
                  <attendanceOpt.icon
                    className={`w-5 h-5 ${
                      attendanceOpt.color.split(" ")[0]
                    }`}
                  />
                  <span
                    className={`px-4 py-2 rounded-full text-sm font-semibold ${attendanceOpt.color}`}
                  >
                    {attendanceOpt.label}
                  </span>
                </div>
              )}
            </div>

            {/* 참여도 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                수업 참여도
              </label>
              <div className="flex items-center gap-4">
                <div className="flex gap-1">{renderStars(record.participation)}</div>
                <span
                  className={`px-4 py-2 rounded-full text-sm font-semibold ${getScoreColor(
                    record.participation
                  )}`}
                >
                  {record.participation}/5 - {getScoreLabel(record.participation)}
                </span>
              </div>
            </div>

            {/* 이해도 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                학습 이해도
              </label>
              <div className="flex items-center gap-4">
                <div className="flex gap-1">{renderStars(record.understanding)}</div>
                <span
                  className={`px-4 py-2 rounded-full text-sm font-semibold ${getScoreColor(
                    record.understanding
                  )}`}
                >
                  {record.understanding}/5 - {getScoreLabel(record.understanding)}
                </span>
              </div>
            </div>

            {/* 숙제 상태 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                숙제 제출 상태
              </label>
              {homeworkOpt && (
                <span
                  className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${homeworkOpt.color}`}
                >
                  {homeworkOpt.label}
                </span>
              )}
            </div>
          </div>
        </Card>

        {/* 특이사항 카드 */}
        {record.notes && (
          <Card size="lg" className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary-600" />
              특이사항
            </h3>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                {record.notes}
              </p>
            </div>
          </Card>
        )}

        {/* 기록 일자 정보 */}
        <Card size="md">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>작성일: {record.created_date}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>최종 수정: {record.last_modified}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
