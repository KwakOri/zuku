"use client";

import { middleSchoolRecords } from "@/lib/mock/middleSchoolRecords";
import { students } from "@/lib/mock/students";
import { MiddleSchoolRecord } from "@/types/schedule";

import {
  BookOpen,
  Calendar,
  CheckCircle,
  Clock,
  Download,
  Edit3,
  Plus,
  Send,
  Star,
  TrendingUp,
  X,
  XCircle,
} from "lucide-react";
import { useMemo, useState } from "react";

interface MiddleSchoolRecordManagerProps {
  teacherId?: string;
  classId?: string;
}

export default function MiddleSchoolRecordManager({
  teacherId = "teacher-1",
  classId = "class-1",
}: MiddleSchoolRecordManagerProps) {
  const [records, setRecords] =
    useState<MiddleSchoolRecord[]>(middleSchoolRecords);
  const [editingRecord, setEditingRecord] = useState<MiddleSchoolRecord | null>(
    null
  );
  const [isAddingRecord, setIsAddingRecord] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState<string>(() => {
    const today = new Date();
    const monday = new Date(today);
    monday.setDate(today.getDate() - today.getDay() + 1);
    return monday.toISOString().split("T")[0];
  });

  // 현재 강사가 담당하는 중등 학생들 (9학년 이하)
  const middleSchoolStudents = useMemo(() => {
    return students.filter((student) => student.grade <= 9);
  }, []);

  // 선택된 주차의 기록들
  const weekRecords = useMemo(() => {
    return records.filter(
      (record) =>
        record.teacherId === teacherId && record.weekOf === selectedWeek
    );
  }, [records, teacherId, selectedWeek]);

  // 새 기록 템플릿
  const [newRecord, setNewRecord] = useState<Partial<MiddleSchoolRecord>>({
    teacherId,
    classId,
    weekOf: selectedWeek,
    attendance: "present",
    participation: 3,
    understanding: 3,
    homework: "good",
    notes: "",
  });

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
    { value: "excellent", label: "우수", color: "text-blue-600 bg-blue-50" },
    { value: "good", label: "양호", color: "text-green-600 bg-green-50" },
    { value: "fair", label: "보통", color: "text-yellow-600 bg-yellow-50" },
    { value: "poor", label: "미흡", color: "text-orange-600 bg-orange-50" },
    {
      value: "not_submitted",
      label: "미제출",
      color: "text-red-600 bg-red-50",
    },
  ];

  // 주차 변경
  const changeWeek = (direction: "prev" | "next") => {
    const currentDate = new Date(selectedWeek);
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + (direction === "next" ? 7 : -7));
    setSelectedWeek(newDate.toISOString().split("T")[0]);
  };

  // 기록 추가
  const handleAddRecord = () => {
    if (!newRecord.studentId) return;

    const record: MiddleSchoolRecord = {
      id: `ms-record-${Date.now()}`,
      studentId: newRecord.studentId!,
      teacherId,
      classId,
      weekOf: selectedWeek,
      attendance: newRecord.attendance!,
      participation: newRecord.participation!,
      understanding: newRecord.understanding!,
      homework: newRecord.homework!,
      notes: newRecord.notes!,
      createdDate: new Date().toISOString().split("T")[0],
      lastModified: new Date().toISOString().split("T")[0],
    };

    setRecords([...records, record]);
    setNewRecord({
      teacherId,
      classId,
      weekOf: selectedWeek,
      attendance: "present",
      participation: 3,
      understanding: 3,
      homework: "good",
      notes: "",
    });
    setIsAddingRecord(false);
  };

  // 기록 수정
  const handleUpdateRecord = () => {
    if (!editingRecord) return;

    setRecords(
      records.map((record) =>
        record.id === editingRecord.id
          ? {
              ...editingRecord,
              lastModified: new Date().toISOString().split("T")[0],
            }
          : record
      )
    );
    setEditingRecord(null);
  };

  // 기록 삭제
  const handleDeleteRecord = (recordId: string) => {
    if (confirm("정말로 이 기록을 삭제하시겠습니까?")) {
      setRecords(records.filter((record) => record.id !== recordId));
    }
  };

  const formatWeekRange = (weekOf: string) => {
    const startDate = new Date(weekOf);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);

    return `${startDate.getMonth() + 1}월 ${startDate.getDate()}일 ~ ${
      endDate.getMonth() + 1
    }월 ${endDate.getDate()}일`;
  };

  const getStudent = (studentId: number) => {
    return students.find((s) => s.id === studentId);
  };

  const getAttendanceOption = (value: string) => {
    return attendanceOptions.find((opt) => opt.value === value);
  };

  const getHomeworkOption = (value: string) => {
    return homeworkOptions.find((opt) => opt.value === value);
  };

  const getScoreColor = (score: number) => {
    if (score >= 4) return "text-blue-600 bg-blue-50";
    if (score >= 3) return "text-green-600 bg-green-50";
    if (score >= 2) return "text-yellow-600 bg-yellow-50";
    return "text-red-600 bg-red-50";
  };

  const renderStars = (score: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < score ? "text-yellow-400 fill-current" : "text-gray-300"
        }`}
      />
    ));
  };

  console.log("weekRecords", weekRecords);

  return (
    <div className="w-full space-y-6">
      {/* 헤더 */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <BookOpen className="w-6 h-6 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                중등 주간 기록 관리
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                학생별 출석, 참여도, 이해도 및 숙제 상태를 기록합니다
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsAddingRecord(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              기록 추가
            </button>
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <Download className="w-4 h-4" />
              내보내기
            </button>
          </div>
        </div>

        {/* 주차 선택 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => changeWeek("prev")}
              className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              ←
            </button>
            <div className="text-center">
              <h3 className="font-semibold text-gray-900">
                {formatWeekRange(selectedWeek)}
              </h3>
              <p className="text-sm text-gray-600">주간 기록</p>
            </div>
            <button
              onClick={() => changeWeek("next")}
              className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              →
            </button>
          </div>

          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span>기록 완료: {weekRecords.length}명</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
              <span>
                미기록: {middleSchoolStudents.length - weekRecords.length}명
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 기록 목록 */}
      <div className="grid gap-6">
        {weekRecords.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              이번 주 기록이 없습니다
            </h3>
            <p className="text-gray-500 mb-4">
              새로운 학생 기록을 추가해보세요.
            </p>
            <button
              onClick={() => setIsAddingRecord(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              첫 기록 추가하기
            </button>
          </div>
        ) : (
          weekRecords.map((record) => {
            const student = getStudent(record.studentId);
            if (!student) return null;

            const attendanceOpt = getAttendanceOption(record.attendance);
            const homeworkOpt = getHomeworkOption(record.homework);

            return (
              <div
                key={record.id}
                className="bg-white rounded-lg border border-gray-200 p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="font-semibold text-blue-600">
                        {student.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {student.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {student.grade}학년 | {student.phone}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setEditingRecord(record)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* 상태 요약 */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  {/* 출석 상태 */}
                  <div className="flex items-center gap-2">
                    {attendanceOpt && (
                      <>
                        <attendanceOpt.icon
                          className={`w-4 h-4 ${
                            attendanceOpt.color.split(" ")[0]
                          }`}
                        />
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${attendanceOpt.color}`}
                        >
                          {attendanceOpt.label}
                        </span>
                      </>
                    )}
                  </div>

                  {/* 참여도 */}
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-gray-600" />
                    <div className="flex items-center gap-1">
                      <span className="text-sm text-gray-600">참여도:</span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getScoreColor(
                          record.participation
                        )}`}
                      >
                        {record.participation}/5
                      </span>
                    </div>
                  </div>

                  {/* 이해도 */}
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-gray-600" />
                    <div className="flex items-center gap-1">
                      <span className="text-sm text-gray-600">이해도:</span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getScoreColor(
                          record.understanding
                        )}`}
                      >
                        {record.understanding}/5
                      </span>
                    </div>
                  </div>

                  {/* 숙제 상태 */}
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-gray-600" />
                    {homeworkOpt && (
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${homeworkOpt.color}`}
                      >
                        {homeworkOpt.label}
                      </span>
                    )}
                  </div>
                </div>

                {/* 평점 별표 */}
                <div className="flex items-center gap-6 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">참여도:</span>
                    <div className="flex gap-1">
                      {renderStars(record.participation)}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">이해도:</span>
                    <div className="flex gap-1">
                      {renderStars(record.understanding)}
                    </div>
                  </div>
                </div>

                {/* 특이사항 */}
                {record.notes && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                      특이사항
                    </h4>
                    <p className="text-sm text-gray-600">{record.notes}</p>
                  </div>
                )}

                <div className="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-500">
                  최종 수정: {record.lastModified}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 기록 추가 모달 */}
      {isAddingRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">새 주간 기록 추가</h3>
                <button
                  onClick={() => setIsAddingRecord(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {formatWeekRange(selectedWeek)} 주간 기록
              </p>
            </div>

            <div className="p-6 space-y-6">
              {/* 학생 선택 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  학생 선택
                </label>
                <select
                  value={newRecord.studentId || ""}
                  onChange={(e) =>
                    setNewRecord({
                      ...newRecord,
                      studentId: parseInt(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">학생을 선택하세요</option>
                  {middleSchoolStudents.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.name} ({student.grade}학년)
                    </option>
                  ))}
                </select>
              </div>

              {/* 출석 상태 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  출석 상태
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {attendanceOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() =>
                        setNewRecord({
                          ...newRecord,
                          attendance:
                            option.value as MiddleSchoolRecord["attendance"],
                        })
                      }
                      className={`p-3 rounded-lg border text-sm transition-colors ${
                        newRecord.attendance === option.value
                          ? "border-blue-500 bg-blue-50 text-blue-700"
                          : "border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      <option.icon className="w-4 h-4 mx-auto mb-1" />
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 참여도 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  참여도 ({newRecord.participation}/5)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={newRecord.participation}
                    onChange={(e) =>
                      setNewRecord({
                        ...newRecord,
                        participation: parseInt(
                          e.target.value
                        ) as MiddleSchoolRecord["participation"],
                      })
                    }
                    className="flex-1"
                  />
                  <div className="flex gap-1">
                    {renderStars(newRecord.participation || 3)}
                  </div>
                </div>
              </div>

              {/* 이해도 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  이해도 ({newRecord.understanding}/5)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={newRecord.understanding}
                    onChange={(e) =>
                      setNewRecord({
                        ...newRecord,
                        understanding: parseInt(
                          e.target.value
                        ) as MiddleSchoolRecord["understanding"],
                      })
                    }
                    className="flex-1"
                  />
                  <div className="flex gap-1">
                    {renderStars(newRecord.understanding || 3)}
                  </div>
                </div>
              </div>

              {/* 숙제 상태 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  숙제 상태
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {homeworkOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() =>
                        setNewRecord({
                          ...newRecord,
                          homework:
                            option.value as MiddleSchoolRecord["homework"],
                        })
                      }
                      className={`p-2 rounded-lg border text-sm transition-colors ${
                        newRecord.homework === option.value
                          ? "border-blue-500 bg-blue-50 text-blue-700"
                          : "border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 특이사항 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  특이사항
                </label>
                <textarea
                  value={newRecord.notes || ""}
                  onChange={(e) =>
                    setNewRecord({ ...newRecord, notes: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={4}
                  placeholder="학생의 특이사항이나 개선점을 기록하세요..."
                />
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => setIsAddingRecord(false)}
                className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleAddRecord}
                disabled={!newRecord.studentId}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 transition-colors"
              >
                추가
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 기록 수정 모달 */}
      {editingRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">주간 기록 수정</h3>
                <button
                  onClick={() => setEditingRecord(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {getStudent(editingRecord.studentId)?.name} |{" "}
                {formatWeekRange(editingRecord.weekOf)}
              </p>
            </div>

            <div className="p-6 space-y-6">
              {/* 출석 상태 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  출석 상태
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {attendanceOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() =>
                        setEditingRecord({
                          ...editingRecord,
                          attendance:
                            option.value as MiddleSchoolRecord["attendance"],
                        })
                      }
                      className={`p-3 rounded-lg border text-sm transition-colors ${
                        editingRecord.attendance === option.value
                          ? "border-blue-500 bg-blue-50 text-blue-700"
                          : "border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      <option.icon className="w-4 h-4 mx-auto mb-1" />
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 참여도 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  참여도 ({editingRecord.participation}/5)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={editingRecord.participation}
                    onChange={(e) =>
                      setEditingRecord({
                        ...editingRecord,
                        participation: parseInt(
                          e.target.value
                        ) as MiddleSchoolRecord["participation"],
                      })
                    }
                    className="flex-1"
                  />
                  <div className="flex gap-1">
                    {renderStars(editingRecord.participation)}
                  </div>
                </div>
              </div>

              {/* 이해도 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  이해도 ({editingRecord.understanding}/5)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={editingRecord.understanding}
                    onChange={(e) =>
                      setEditingRecord({
                        ...editingRecord,
                        understanding: parseInt(
                          e.target.value
                        ) as MiddleSchoolRecord["understanding"],
                      })
                    }
                    className="flex-1"
                  />
                  <div className="flex gap-1">
                    {renderStars(editingRecord.understanding)}
                  </div>
                </div>
              </div>

              {/* 숙제 상태 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  숙제 상태
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {homeworkOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() =>
                        setEditingRecord({
                          ...editingRecord,
                          homework:
                            option.value as MiddleSchoolRecord["homework"],
                        })
                      }
                      className={`p-2 rounded-lg border text-sm transition-colors ${
                        editingRecord.homework === option.value
                          ? "border-blue-500 bg-blue-50 text-blue-700"
                          : "border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 특이사항 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  특이사항
                </label>
                <textarea
                  value={editingRecord.notes}
                  onChange={(e) =>
                    setEditingRecord({
                      ...editingRecord,
                      notes: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={4}
                  placeholder="학생의 특이사항이나 개선점을 기록하세요..."
                />
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => handleDeleteRecord(editingRecord.id)}
                className="px-4 py-2 text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
              >
                삭제
              </button>
              <button
                onClick={() => setEditingRecord(null)}
                className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleUpdateRecord}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                저장
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
