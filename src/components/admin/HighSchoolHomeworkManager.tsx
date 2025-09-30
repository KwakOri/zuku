"use client";

import { assistants } from "@/lib/mock/assistants";
import { highSchoolHomeworkRecords } from "@/lib/mock/highSchoolHomeworkRecords";
import { students } from "@/lib/mock/students";
import { HighSchoolHomeworkRecord } from "@/types/schedule";

import {
  BarChart3,
  BookCheck,
  Calendar,
  CheckCircle,
  Download,
  Edit3,
  Plus,
  Search,
  Target,
  User,
} from "lucide-react";
import { useMemo, useState } from "react";
import {
  Card,
  Button,
  FormField,
  Avatar,
  Badge,
  Chip,
  Icon,
  Modal,
  SearchInput,
  Progress
} from "@/components/design-system";

interface HighSchoolHomeworkManagerProps {
  assistantId?: string;
  classId?: string;
}

export default function HighSchoolHomeworkManager({
  assistantId = "assistant-1",
  classId = "class-1",
}: HighSchoolHomeworkManagerProps) {
  const [records, setRecords] = useState<HighSchoolHomeworkRecord[]>(
    highSchoolHomeworkRecords
  );
  const [editingRecord, setEditingRecord] =
    useState<HighSchoolHomeworkRecord | null>(null);
  const [isAddingRecord, setIsAddingRecord] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    return new Date().toISOString().split("T")[0];
  });
  const [filterAchievement, setFilterAchievement] = useState<string>("all");

  // 현재 조교 정보
  const currentAssistant = assistants.find((a) => a.id === assistantId);

  // 고등학생들 (10학년 이상)
  const highSchoolStudents = useMemo(() => {
    return students.filter((student) => student.grade >= 10);
  }, []);

  // 필터링된 기록들
  const filteredRecords = useMemo(() => {
    return records
      .filter((record) => {
        const student = students.find((s) => s.id === record.studentId);
        if (!student) return false;

        const matchesSearch = student.name
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
        const matchesAssistant = record.assistantId === assistantId;
        const matchesAchievement =
          filterAchievement === "all" ||
          record.achievement === filterAchievement;
        const matchesDate = !selectedDate || record.date === selectedDate;

        return (
          matchesSearch && matchesAssistant && matchesAchievement && matchesDate
        );
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [records, assistantId, searchTerm, filterAchievement, selectedDate]);

  // 새 기록 템플릿
  const [newRecord, setNewRecord] = useState<Partial<HighSchoolHomeworkRecord>>(
    {
      assistantId,
      classId,
      date: selectedDate,
      homeworkRange: "",
      achievement: "good",
      completionRate: 80,
      accuracy: 75,
      notes: "",
    }
  );

  // 성취도 옵션
  const achievementOptions = [
    {
      value: "excellent",
      label: "우수",
      color: "text-blue-600 bg-blue-50",
      percentage: "90-100%",
    },
    {
      value: "good",
      label: "양호",
      color: "text-green-600 bg-green-50",
      percentage: "70-89%",
    },
    {
      value: "fair",
      label: "보통",
      color: "text-yellow-600 bg-yellow-50",
      percentage: "50-69%",
    },
    {
      value: "poor",
      label: "미흡",
      color: "text-orange-600 bg-orange-50",
      percentage: "30-49%",
    },
    {
      value: "not_submitted",
      label: "미제출",
      color: "text-red-600 bg-red-50",
      percentage: "0-29%",
    },
  ];

  // 기록 추가
  const handleAddRecord = () => {
    if (!newRecord.studentId || !newRecord.homeworkRange) return;

    const record: HighSchoolHomeworkRecord = {
      id: `hs-record-${Date.now()}`,
      studentId: newRecord.studentId!,
      assistantId,
      classId,
      date: selectedDate,
      homeworkRange: newRecord.homeworkRange!,
      achievement: newRecord.achievement!,
      completionRate: newRecord.completionRate!,
      accuracy: newRecord.accuracy!,
      notes: newRecord.notes || "",
      createdDate: new Date().toISOString().split("T")[0],
    };

    setRecords([...records, record]);
    setNewRecord({
      assistantId,
      classId,
      date: selectedDate,
      homeworkRange: "",
      achievement: "good",
      completionRate: 80,
      accuracy: 75,
      notes: "",
    });
    setIsAddingRecord(false);
  };

  // 기록 수정
  const handleUpdateRecord = () => {
    if (!editingRecord) return;

    setRecords(
      records.map((record) =>
        record.id === editingRecord.id ? editingRecord : record
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

  const getStudent = (studentId: number) => {
    return students.find((s) => s.id === studentId);
  };

  const getAchievementOption = (value: string) => {
    return achievementOptions.find((opt) => opt.value === value);
  };

  const getCompletionColor = (rate: number) => {
    if (rate >= 90) return "text-blue-600 bg-blue-50";
    if (rate >= 70) return "text-green-600 bg-green-50";
    if (rate >= 50) return "text-yellow-600 bg-yellow-50";
    if (rate >= 30) return "text-orange-600 bg-orange-50";
    return "text-red-600 bg-red-50";
  };

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 90) return "text-blue-600 bg-blue-50";
    if (accuracy >= 80) return "text-green-600 bg-green-50";
    if (accuracy >= 60) return "text-yellow-600 bg-yellow-50";
    if (accuracy >= 40) return "text-orange-600 bg-orange-50";
    return "text-red-600 bg-red-50";
  };

  // 통계 계산
  const stats = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    const todayRecords = records.filter(
      (r) => r.date === today && r.assistantId === assistantId
    );

    const totalRecords = filteredRecords.length;
    const excellentCount = filteredRecords.filter(
      (r) => r.achievement === "excellent"
    ).length;
    const avgCompletion =
      totalRecords > 0
        ? Math.round(
            filteredRecords.reduce((sum, r) => sum + r.completionRate, 0) /
              totalRecords
          )
        : 0;
    const avgAccuracy =
      totalRecords > 0
        ? Math.round(
            filteredRecords.reduce((sum, r) => sum + r.accuracy, 0) /
              totalRecords
          )
        : 0;

    return {
      todayRecords: todayRecords.length,
      totalRecords,
      excellentRate:
        totalRecords > 0
          ? Math.round((excellentCount / totalRecords) * 100)
          : 0,
      avgCompletion,
      avgAccuracy,
    };
  }, [records, filteredRecords, assistantId]);

  return (
    <div className="w-full space-y-6">
      {/* 헤더 */}
      <Card size="lg">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Avatar
              size="md"
              variant="flat"
              className="bg-secondary-100"
              fallback={<Icon name="book-check" size="sm" color="secondary" />}
            />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                고등 숙제 검사 기록
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                조교: {currentAssistant?.name} | 담당 과목:{" "}
                {currentAssistant?.subjects.join(", ")}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={() => setIsAddingRecord(true)}
              variant="secondary"
              size="md"
            >
              <Plus className="w-4 h-4 mr-2" />
              검사 기록 추가
            </Button>
            <Button variant="outline" size="md">
              <Download className="w-4 h-4 mr-2" />
              내보내기
            </Button>
          </div>
        </div>

        {/* 통계 요약 */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">
                오늘 검사
              </span>
            </div>
            <div className="text-2xl font-bold text-blue-900">
              {stats.todayRecords}
            </div>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">
                총 기록
              </span>
            </div>
            <div className="text-2xl font-bold text-green-900">
              {stats.totalRecords}
            </div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-800">
                우수율
              </span>
            </div>
            <div className="text-2xl font-bold text-purple-900">
              {stats.excellentRate}%
            </div>
          </div>
          <div className="bg-orange-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="w-4 h-4 text-orange-600" />
              <span className="text-sm font-medium text-orange-800">
                평균 완성도
              </span>
            </div>
            <div className="text-2xl font-bold text-orange-900">
              {stats.avgCompletion}%
            </div>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-800">
                평균 정확도
              </span>
            </div>
            <div className="text-2xl font-bold text-yellow-900">
              {stats.avgAccuracy}%
            </div>
          </div>
        </div>

        {/* 검색 및 필터 */}
        <div className="flex flex-col md:flex-row gap-4">
          {/* 검색바 */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="학생 이름으로 검색..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* 날짜 선택 */}
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
          />

          {/* 성취도 필터 */}
          <select
            value={filterAchievement}
            onChange={(e) => setFilterAchievement(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">전체 성취도</option>
            {achievementOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </Card>

      {/* 기록 목록 */}
      <div className="space-y-4">
        {filteredRecords.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <BookCheck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              검사 기록이 없습니다
            </h3>
            <p className="text-gray-500 mb-4">
              새로운 숙제 검사 기록을 추가해보세요.
            </p>
            <button
              onClick={() => setIsAddingRecord(true)}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              첫 검사 기록 추가하기
            </button>
          </div>
        ) : (
          filteredRecords.map((record) => {
            const student = getStudent(record.studentId);
            if (!student) return null;

            const achievementOpt = getAchievementOption(record.achievement);

            return (
              <div
                key={record.id}
                className="bg-white rounded-lg border border-gray-200 p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-semibold text-gray-900">
                          {student.name}
                        </h3>
                        <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full">
                          {student.grade}학년
                        </span>
                        {achievementOpt && (
                          <span
                            className={`px-2 py-1 text-xs rounded-full font-medium ${achievementOpt.color}`}
                          >
                            {achievementOpt.label}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">
                        {record.date} 검사
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setEditingRecord(record)}
                    className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>

                {/* 숙제 범위 */}
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    숙제 범위
                  </h4>
                  <p className="text-sm text-gray-900">
                    {record.homeworkRange}
                  </p>
                </div>

                {/* 성과 지표 */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                  {/* 성취도 */}
                  <div className="text-center">
                    <div className="text-xs text-gray-600 mb-1">성취도</div>
                    {achievementOpt && (
                      <div
                        className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium ${achievementOpt.color}`}
                      >
                        {achievementOpt.label}
                      </div>
                    )}
                  </div>

                  {/* 완성도 */}
                  <div className="text-center">
                    <div className="text-xs text-gray-600 mb-1">완성도</div>
                    <div
                      className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium ${getCompletionColor(
                        record.completionRate
                      )}`}
                    >
                      {record.completionRate}%
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div
                        className="bg-purple-600 h-2 rounded-full transition-all"
                        style={{ width: `${record.completionRate}%` }}
                      />
                    </div>
                  </div>

                  {/* 정확도 */}
                  <div className="text-center">
                    <div className="text-xs text-gray-600 mb-1">정확도</div>
                    <div
                      className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium ${getAccuracyColor(
                        record.accuracy
                      )}`}
                    >
                      {record.accuracy}%
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div
                        className="bg-green-600 h-2 rounded-full transition-all"
                        style={{ width: `${record.accuracy}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* 특이사항 */}
                {record.notes && (
                  <div className="border-t pt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                      특이사항
                    </h4>
                    <p className="text-sm text-gray-600">{record.notes}</p>
                  </div>
                )}
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
              <h3 className="text-lg font-semibold">새 숙제 검사 기록</h3>
              <p className="text-sm text-gray-600 mt-1">
                {selectedDate} 검사 기록
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
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">학생을 선택하세요</option>
                  {highSchoolStudents.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.name} ({student.grade}학년)
                    </option>
                  ))}
                </select>
              </div>

              {/* 숙제 범위 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  숙제 범위
                </label>
                <textarea
                  value={newRecord.homeworkRange || ""}
                  onChange={(e) =>
                    setNewRecord({
                      ...newRecord,
                      homeworkRange: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 resize-none"
                  rows={3}
                  placeholder="예: 수학의 바이블 p.125-145, 문제 1-25"
                />
              </div>

              {/* 성취도 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  성취도
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {achievementOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() =>
                        setNewRecord({
                          ...newRecord,
                          achievement:
                            option.value as HighSchoolHomeworkRecord["achievement"],
                        })
                      }
                      className={`p-3 rounded-lg border text-sm transition-colors ${
                        newRecord.achievement === option.value
                          ? "border-purple-500 bg-purple-50 text-purple-700"
                          : "border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      <div className="font-medium">{option.label}</div>
                      <div className="text-xs text-gray-500">
                        {option.percentage}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 완성도 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  완성도 ({newRecord.completionRate}%)
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={newRecord.completionRate}
                  onChange={(e) =>
                    setNewRecord({
                      ...newRecord,
                      completionRate: parseInt(e.target.value),
                    })
                  }
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0%</span>
                  <span>50%</span>
                  <span>100%</span>
                </div>
              </div>

              {/* 정확도 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  정확도 ({newRecord.accuracy}%)
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={newRecord.accuracy}
                  onChange={(e) =>
                    setNewRecord({
                      ...newRecord,
                      accuracy: parseInt(e.target.value),
                    })
                  }
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0%</span>
                  <span>50%</span>
                  <span>100%</span>
                </div>
              </div>

              {/* 특이사항 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  특이사항 (선택)
                </label>
                <textarea
                  value={newRecord.notes || ""}
                  onChange={(e) =>
                    setNewRecord({ ...newRecord, notes: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 resize-none"
                  rows={3}
                  placeholder="특이사항이나 추가 지도가 필요한 부분을 기록하세요..."
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
                disabled={!newRecord.studentId || !newRecord.homeworkRange}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 transition-colors"
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
              <h3 className="text-lg font-semibold">숙제 검사 기록 수정</h3>
              <p className="text-sm text-gray-600 mt-1">
                {getStudent(editingRecord.studentId)?.name} |{" "}
                {editingRecord.date}
              </p>
            </div>

            <div className="p-6 space-y-6">
              {/* 숙제 범위 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  숙제 범위
                </label>
                <textarea
                  value={editingRecord.homeworkRange}
                  onChange={(e) =>
                    setEditingRecord({
                      ...editingRecord,
                      homeworkRange: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 resize-none"
                  rows={3}
                />
              </div>

              {/* 성취도 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  성취도
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {achievementOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() =>
                        setEditingRecord({
                          ...editingRecord,
                          achievement:
                            option.value as HighSchoolHomeworkRecord["achievement"],
                        })
                      }
                      className={`p-3 rounded-lg border text-sm transition-colors ${
                        editingRecord.achievement === option.value
                          ? "border-purple-500 bg-purple-50 text-purple-700"
                          : "border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      <div className="font-medium">{option.label}</div>
                      <div className="text-xs text-gray-500">
                        {option.percentage}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 완성도 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  완성도 ({editingRecord.completionRate}%)
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={editingRecord.completionRate}
                  onChange={(e) =>
                    setEditingRecord({
                      ...editingRecord,
                      completionRate: parseInt(e.target.value),
                    })
                  }
                  className="w-full"
                />
              </div>

              {/* 정확도 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  정확도 ({editingRecord.accuracy}%)
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={editingRecord.accuracy}
                  onChange={(e) =>
                    setEditingRecord({
                      ...editingRecord,
                      accuracy: parseInt(e.target.value),
                    })
                  }
                  className="w-full"
                />
              </div>

              {/* 특이사항 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  특이사항
                </label>
                <textarea
                  value={editingRecord.notes || ""}
                  onChange={(e) =>
                    setEditingRecord({
                      ...editingRecord,
                      notes: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 resize-none"
                  rows={3}
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
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
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
