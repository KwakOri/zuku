'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { AlertCircle, Calendar, CheckCircle, Clock, FileText, School, User, XCircle } from 'lucide-react';
import { getGrade } from '@/lib/utils';

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
          throw new Error(errorData.error || '리포트를 불러오는데 실패했습니다.');
        }

        const result = await response.json();
        setData(result.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [reportId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
          <p className="mt-4 text-gray-600">주간 리포트를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center min-h-screen px-4 bg-gradient-to-br from-red-50 to-pink-100">
        <div className="w-full max-w-md p-6 text-center bg-white shadow-xl rounded-2xl">
          <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full">
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="mb-2 text-xl font-bold text-gray-900">오류가 발생했습니다</h1>
          <p className="text-gray-600">{error || '리포트를 찾을 수 없습니다.'}</p>
        </div>
      </div>
    );
  }

  // 만료된 경우
  if (data.isExpired) {
    return (
      <div className="flex items-center justify-center min-h-screen px-4 bg-gradient-to-br from-amber-50 to-orange-100">
        <div className="w-full max-w-md p-6 text-center bg-white shadow-xl rounded-2xl">
          <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-amber-100 rounded-full">
            <Clock className="w-8 h-8 text-amber-600" />
          </div>
          <h1 className="mb-2 text-xl font-bold text-gray-900">링크가 만료되었습니다</h1>
          <p className="mb-4 text-gray-600">
            이 리포트는 {new Date(data.report.expired_at).toLocaleDateString('ko-KR')}에 만료되었습니다.
          </p>
          <p className="text-sm text-gray-500">
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

  // homework 문자열을 기반으로 완료 상태 판단
  const getHomeworkStatus = (homework: string): 'completed' | 'incomplete' | 'partial' => {
    if (!homework || homework === '안 함' || homework === '미완료') return 'incomplete';
    if (homework === '완료' || homework === '완벽') return 'completed';
    return 'partial'; // 부분 완료 또는 기타 상태
  };

  // 숙제 완료 상태별 아이콘 및 색상
  const getCompletionBadge = (status: 'completed' | 'incomplete' | 'partial') => {
    switch (status) {
      case 'completed':
        return (
          <div className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full">
            <CheckCircle className="w-3 h-3" />
            <span>완료</span>
          </div>
        );
      case 'partial':
        return (
          <div className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-amber-700 bg-amber-100 rounded-full">
            <AlertCircle className="w-3 h-3" />
            <span>부분완료</span>
          </div>
        );
      case 'incomplete':
        return (
          <div className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-red-700 bg-red-100 rounded-full">
            <XCircle className="w-3 h-3" />
            <span>미완료</span>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen px-4 py-6 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-2xl mx-auto">
        {/* 헤더 */}
        <div className="mb-6 overflow-hidden bg-white shadow-lg rounded-2xl">
          <div className="p-6 bg-gradient-to-r from-blue-600 to-indigo-600">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex items-center justify-center w-12 h-12 bg-white rounded-full">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">주간 학습 리포트</h1>
                <p className="hidden md:block text-sm text-blue-100">
                  {new Date(weekStart).toLocaleDateString('ko-KR')} ~ {new Date(weekEnd).toLocaleDateString('ko-KR')}
                </p>
              </div>
            </div>
          </div>

          <div className="hidden md:block p-6 space-y-3">
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">학생</p>
                <p className="font-semibold text-gray-900">{student.name}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <School className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">학교 / 학년</p>
                <p className="font-semibold text-gray-900">
                  {student.schools?.name || '학교 정보 없음'} · {getGrade(student.grade, 'half')}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">리포트 생성일</p>
                <p className="font-semibold text-gray-900">
                  {new Date(report.created_at).toLocaleDateString('ko-KR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 과목별 숙제 기록 */}
        {Object.keys(recordsBySubject).length === 0 ? (
          <div className="p-8 text-center bg-white shadow-lg rounded-2xl">
            <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-600">이번 주 학습 기록이 없습니다.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(recordsBySubject).map(([subjectName, records]) => (
              <div key={subjectName} className="overflow-hidden bg-white shadow-lg rounded-2xl">
                <div className="px-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-500">
                  <h2 className="text-lg font-bold text-white">{subjectName}</h2>
                </div>

                <div className="p-4 space-y-3">
                  {records.map((record) => (
                    <div
                      key={record.id}
                      className="p-4 transition-shadow border border-gray-200 rounded-xl hover:shadow-md"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {new Date(record.created_date).toLocaleDateString('ko-KR', {
                              month: 'long',
                              day: 'numeric',
                              weekday: 'short',
                            })}
                          </p>
                        </div>
                        {getCompletionBadge(getHomeworkStatus(record.homework))}
                      </div>

                      {/* 출석 */}
                      <div className="mb-2">
                        <span className="text-sm text-gray-500">출석: </span>
                        <span className="font-medium text-gray-900">{record.attendance}</span>
                      </div>

                      {/* 숙제 */}
                      <div className="mb-2">
                        <span className="text-sm text-gray-500">숙제: </span>
                        <span className="font-medium text-gray-900">{record.homework}</span>
                      </div>

                      {/* 참여도 */}
                      <div className="mb-2">
                        <span className="text-sm text-gray-500">참여도: </span>
                        <span className="font-medium text-gray-900">{record.participation}/10</span>
                      </div>

                      {/* 이해도 */}
                      <div className="mb-2">
                        <span className="text-sm text-gray-500">이해도: </span>
                        <span className="font-medium text-gray-900">{record.understanding}/10</span>
                      </div>

                      {record.notes && (
                        <div className="p-3 mt-2 text-sm bg-gray-50 rounded-lg">
                          <p className="mb-1 font-medium text-gray-700">특이사항</p>
                          <p className="text-gray-600 whitespace-pre-wrap">{record.notes}</p>
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
          <p className="text-sm text-gray-500">
            이 링크는 {new Date(report.expired_at).toLocaleDateString('ko-KR')}까지 유효합니다.
          </p>
        </div>
      </div>
    </div>
  );
}
