"use client";

import { useState, useEffect } from "react";
import { middleSchoolRecords } from "@/lib/mock/middleSchoolRecords";
import { students } from "@/lib/mock/students";
import { teachers } from "@/lib/mock/teachers";
import { classes } from "@/lib/mock/classes";
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
  AlertTriangle
} from "lucide-react";

interface StudentRecordStatus {
  studentId: string;
  studentName: string;
  parentPhone: string;
  records: {
    id: string;
    teacherName: string;
    subject: string;
    classId: string;
    weekOf: string;
    homework: string;
    hasRecord: boolean;
  }[];
  totalRecords: number;
  completedRecords: number;
}

export default function NotificationsPage() {
  const [recordStatuses, setRecordStatuses] = useState<StudentRecordStatus[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<Set<number>>(new Set());
  const [isSending, setIsSending] = useState(false);
  const [sentCount, setSentCount] = useState(0);

  useEffect(() => {
    const studentRecordMap = new Map<number, StudentRecordStatus>();

    // 모든 학생에 대해 기본 상태 초기화
    students.forEach(student => {
      if (student.parentPhone) {
        studentRecordMap.set(student.id, {
          studentId: student.id,
          studentName: student.name,
          parentPhone: student.parentPhone,
          records: [],
          totalRecords: 0,
          completedRecords: 0
        });
      }
    });

    // 기록이 있는 학생들 처리
    middleSchoolRecords.forEach(record => {
      const student = students.find(s => s.id === record.studentId);
      const teacher = teachers.find(t => t.id === record.teacherId);
      const classInfo = classes.find(c => c.id === record.classId);

      if (student && teacher && classInfo && student.parentPhone) {
        const status = studentRecordMap.get(student.id);
        if (status) {
          status.records.push({
            id: record.id,
            teacherName: teacher.name,
            subject: classInfo.subject,
            classId: record.classId,
            weekOf: record.weekOf,
            homework: record.homework,
            hasRecord: true
          });
          status.completedRecords++;
        }
      }
    });

    // 총 기록 수 계산 (여기서는 실제 기록 수로 설정)
    studentRecordMap.forEach(status => {
      status.totalRecords = status.records.length;
    });

    setRecordStatuses(Array.from(studentRecordMap.values()).sort((a, b) => a.studentName.localeCompare(b.studentName)));
  }, []);

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
    const studentsWithRecords = recordStatuses.filter(status => status.completedRecords > 0);
    if (selectedStudents.size === studentsWithRecords.length) {
      setSelectedStudents(new Set());
    } else {
      setSelectedStudents(new Set(studentsWithRecords.map(s => s.studentId)));
    }
  };

  const handleSendNotifications = async () => {
    setIsSending(true);
    setSentCount(0);

    try {
      const selectedStudentData = recordStatuses.filter(status => 
        selectedStudents.has(status.studentId) && status.completedRecords > 0
      );

      for (const studentStatus of selectedStudentData) {
        for (const record of studentStatus.records) {
          await fetch('/api/send-notification', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              to: studentStatus.parentPhone,
              studentName: studentStatus.studentName,
              recordId: record.id,
              subject: record.subject,
              teacherName: record.teacherName,
              weekOf: record.weekOf
            }),
          });
          
          // 실제로는 API 응답을 기다려야 하지만, 여기서는 시뮬레이션
          await new Promise(resolve => setTimeout(resolve, 500));
          setSentCount(prev => prev + 1);
        }
      }

      alert('알림톡이 성공적으로 발송되었습니다!');
      setSelectedStudents(new Set());
    } catch (error) {
      console.error('알림톡 발송 실패:', error);
      alert('알림톡 발송 중 오류가 발생했습니다.');
    } finally {
      setIsSending(false);
      setSentCount(0);
    }
  };

  const getHomeworkStatusColor = (homework: string) => {
    switch (homework) {
      case "excellent": return "text-green-600 bg-green-100";
      case "good": return "text-blue-600 bg-blue-100";
      case "fair": return "text-yellow-600 bg-yellow-100";
      case "poor": return "text-orange-600 bg-orange-100";
      case "not_submitted": return "text-red-600 bg-red-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  const getHomeworkStatusText = (homework: string) => {
    switch (homework) {
      case "excellent": return "우수";
      case "good": return "양호";
      case "fair": return "보통";
      case "poor": return "미흡";
      case "not_submitted": return "미제출";
      default: return "미기록";
    }
  };

  const studentsWithRecords = recordStatuses.filter(status => status.completedRecords > 0);
  const totalMessages = Array.from(selectedStudents).reduce((total, studentId) => {
    const student = recordStatuses.find(s => s.studentId === studentId);
    return total + (student?.completedRecords || 0);
  }, 0);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 헤더 */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <MessageSquare className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  학부모 알림톡 발송
                </h1>
                <p className="text-gray-600 mt-1">
                  중등 학생들의 수업 기록을 확인하고 학부모님께 알림톡을 발송하세요.
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-600">선택된 학생</p>
                <p className="text-2xl font-bold text-blue-600">{selectedStudents.size}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">발송될 메시지</p>
                <p className="text-2xl font-bold text-green-600">{totalMessages}</p>
              </div>
            </div>
          </div>
        </div>

        {/* 액션 버튼 */}
        <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleSelectAll}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Users className="h-4 w-4" />
                <span>
                  {selectedStudents.size === studentsWithRecords.length ? '전체 해제' : '전체 선택'}
                </span>
              </button>
              <div className="text-sm text-gray-600">
                기록이 있는 학생: {studentsWithRecords.length}명
              </div>
            </div>
            <button
              onClick={handleSendNotifications}
              disabled={selectedStudents.size === 0 || isSending}
              className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="h-4 w-4" />
              <span>
                {isSending ? `발송 중... (${sentCount}/${totalMessages})` : '알림톡 발송'}
              </span>
            </button>
          </div>
        </div>

        {/* 학생 목록 */}
        <div className="space-y-4">
          {recordStatuses.map((status) => (
            <div key={status.studentId} className="bg-white rounded-lg shadow-sm border">
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <input
                      type="checkbox"
                      checked={selectedStudents.has(status.studentId)}
                      onChange={() => handleStudentToggle(status.studentId)}
                      disabled={status.completedRecords === 0}
                      className="h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500 disabled:text-gray-400"
                    />
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <User className="h-5 w-5 text-gray-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {status.studentName}
                        </h3>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Phone className="h-4 w-4" />
                          <span>{status.parentPhone}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-sm text-gray-600">완료된 기록</p>
                      <p className="text-lg font-semibold">
                        <span className="text-green-600">{status.completedRecords}</span>
                        <span className="text-gray-400"> / {status.totalRecords}</span>
                      </p>
                    </div>
                    {status.completedRecords > 0 ? (
                      <CheckCircle className="h-6 w-6 text-green-500" />
                    ) : status.totalRecords === 0 ? (
                      <AlertTriangle className="h-6 w-6 text-yellow-500" />
                    ) : (
                      <Clock className="h-6 w-6 text-gray-400" />
                    )}
                  </div>
                </div>

                {/* 기록 상세 */}
                {status.records.length > 0 && (
                  <div className="border-t pt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">수업 기록</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {status.records.map((record) => (
                        <div key={record.id} className="border border-gray-200 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <BookOpen className="h-4 w-4 text-gray-500" />
                              <span className="text-sm font-medium text-gray-900">
                                {record.subject}
                              </span>
                            </div>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${getHomeworkStatusColor(record.homework)}`}>
                              {getHomeworkStatusText(record.homework)}
                            </span>
                          </div>
                          <div className="text-xs text-gray-600 space-y-1">
                            <p>담당: {record.teacherName}</p>
                            <p>주간: {record.weekOf}</p>
                            <p>기록 ID: {record.id}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {status.records.length === 0 && (
                  <div className="border-t pt-4">
                    <div className="text-center py-4 text-gray-500">
                      <XCircle className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                      <p>아직 작성된 수업 기록이 없습니다.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {recordStatuses.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              학생 데이터를 불러오는 중입니다...
            </h3>
            <p className="text-gray-600">
              잠시만 기다려주세요.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}