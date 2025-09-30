"use client";

import { getGrade } from "@/lib/utils";
import {
  useCreateMiddleRecord,
  useDeleteMiddleRecord,
  useUpdateMiddleRecord,
  useWeeklyMiddleRecords,
} from "@/queries/useMiddleRecords";
import { useStudents } from "@/queries/useStudents";
import { useTeachers } from "@/queries/useTeachers";
import { Tables, TablesInsert, TablesUpdate } from "@/types/supabase";

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
import { useMemo, useState, useEffect } from "react";
import {
  Card,
  Button,
  FormField,
  Avatar,
  Badge,
  Chip,
  Icon,
  Modal,
  Progress
} from "@/components/design-system";

interface MiddleSchoolRecordManagerProps {
  teacherId?: string;
}

export default function MiddleSchoolRecordManager({
  teacherId: propTeacherId,
}: MiddleSchoolRecordManagerProps) {
  const [editingRecord, setEditingRecord] =
    useState<Tables<"homework_records_middle"> | null>(null);
  const [isAddingRecord, setIsAddingRecord] = useState(false);

  // 디버깅: isAddingRecord 상태 변화 로깅
  useEffect(() => {
    console.log("isAddingRecord 상태 변경:", isAddingRecord);
  }, [isAddingRecord]);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string | undefined>(propTeacherId);
  const [selectedWeek, setSelectedWeek] = useState<string>(() => {
    const today = new Date();
    const monday = new Date(today);
    monday.setDate(today.getDate() - today.getDay() + 1);
    return monday.toISOString().split("T")[0];
  });

  // Use prop teacherId if provided, otherwise use local state
  const teacherId = propTeacherId || selectedTeacherId;

  // API에서 데이터 가져오기
  const { data: students = [] } = useStudents();
  const { data: teachers = [] } = useTeachers();
  const { data: records = [], isLoading: recordsLoading } =
    useWeeklyMiddleRecords(teacherId, selectedWeek);

  // Mutations
  const createRecordMutation = useCreateMiddleRecord();
  const updateRecordMutation = useUpdateMiddleRecord();
  const deleteRecordMutation = useDeleteMiddleRecord();

  // 현재 강사가 담당하는 중등 학생들 (9학년 이하)
  const middleSchoolStudents = useMemo(() => {
    return students.filter((student) => student.grade <= 9);
  }, [students]);

  // 새 기록 템플릿
  const [newRecord, setNewRecord] = useState<
    Partial<TablesInsert<"homework_records_middle">>
  >({
    teacher_id: teacherId || "",
    week_of: selectedWeek,
    attendance: "present",
    participation: 3,
    understanding: 3,
    homework: "good",
    notes: "",
    created_date: new Date().toISOString().split("T")[0],
    last_modified: new Date().toISOString().split("T")[0],
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
    const newWeekString = newDate.toISOString().split("T")[0];
    setSelectedWeek(newWeekString);

    // newRecord도 주차에 맞게 업데이트
    setNewRecord((prev) => ({ ...prev, week_of: newWeekString }));
  };

  // 기록 추가
  const handleAddRecord = async () => {
    if (!newRecord.student_id || !teacherId) return;

    const recordData: TablesInsert<"homework_records_middle"> = {
      student_id: newRecord.student_id!,
      teacher_id: teacherId,
      week_of: selectedWeek,
      attendance: newRecord.attendance!,
      participation: newRecord.participation!,
      understanding: newRecord.understanding!,
      homework: newRecord.homework!,
      notes: newRecord.notes || "",
      created_date: new Date().toISOString().split("T")[0],
      last_modified: new Date().toISOString().split("T")[0],
    };

    try {
      await createRecordMutation.mutateAsync(recordData);
      setNewRecord({
        teacher_id: teacherId || "",
        week_of: selectedWeek,
        attendance: "present",
        participation: 3,
        understanding: 3,
        homework: "good",
        notes: "",
        created_date: new Date().toISOString().split("T")[0],
        last_modified: new Date().toISOString().split("T")[0],
      });
      setIsAddingRecord(false);
    } catch (error) {
      console.error("Error creating record:", error);
    }
  };

  // 기록 수정
  const handleUpdateRecord = async () => {
    if (!editingRecord) return;

    const updateData: TablesUpdate<"homework_records_middle"> = {
      attendance: editingRecord.attendance,
      participation: editingRecord.participation,
      understanding: editingRecord.understanding,
      homework: editingRecord.homework,
      notes: editingRecord.notes,
      last_modified: new Date().toISOString().split("T")[0],
    };

    try {
      await updateRecordMutation.mutateAsync({
        id: editingRecord.id,
        data: updateData,
      });
      setEditingRecord(null);
    } catch (error) {
      console.error("Error updating record:", error);
    }
  };

  // 기록 삭제
  const handleDeleteRecord = async (recordId: string) => {
    if (confirm("정말로 이 기록을 삭제하시겠습니까?")) {
      try {
        await deleteRecordMutation.mutateAsync(recordId);
      } catch (error) {
        console.error("Error deleting record:", error);
      }
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

  const getStudent = (studentId: string) => {
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

  // 로딩 상태
  const isLoading =
    recordsLoading ||
    createRecordMutation.isPending ||
    updateRecordMutation.isPending ||
    deleteRecordMutation.isPending;

  console.log("records", records);

  return (
    <div className="w-full space-y-6">
      {/* 헤더 */}
      <Card size="lg">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Icon name="book-open" size="lg" color="primary" />
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
            <Button
              variant="primary"
              size="md"
              onClick={() => {
                console.log("기록 추가 버튼 클릭됨");
                setIsAddingRecord(true);
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              기록 추가
            </Button>
            <Button variant="outline" size="md">
              <Download className="w-4 h-4 mr-2" />
              내보내기
            </Button>
          </div>
        </div>

        {/* 주차 선택 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => changeWeek("prev")}
            >
              ←
            </Button>
            <div className="text-center">
              <h3 className="font-semibold text-gray-900">
                {formatWeekRange(selectedWeek)}
              </h3>
              <p className="text-sm text-gray-600">주간 기록</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => changeWeek("next")}
            >
              →
            </Button>
          </div>

          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-primary-500 rounded-full"></div>
              <span>기록 완료: {records.length}명</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
              <span>
                미기록: {middleSchoolStudents.length - records.length}명
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* 강사 선택 */}
      {!propTeacherId && (
        <Card size="lg">
          <FormField
            label="담당 강사 선택"
            type="select"
            value={selectedTeacherId || ""}
            onChange={(e) => setSelectedTeacherId(e.target.value || undefined)}
            helperText={!teacherId ? "강사를 선택하면 해당 강사의 기록을 조회할 수 있습니다." : undefined}
            options={[
              { value: "", label: "강사를 선택하세요" },
              ...teachers.map((teacher) => ({ value: teacher.id, label: teacher.name }))
            ]}
          />
        </Card>
      )}

      {/* 기록 목록 */}
      <div className="grid gap-6">
        {isLoading ? (
          <Card size="lg">
            <div className="p-12 text-center">
              <Icon name="loader" size="3xl" color="primary" className="mx-auto mb-4 animate-spin" />
              <p className="text-gray-600">데이터를 불러오는 중...</p>
            </div>
          </Card>
        ) : records.length === 0 ? (
          <Card size="lg">
            <div className="p-12 text-center">
              <Icon name="calendar" size="3xl" color="neutral" className="mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                이번 주 기록이 없습니다
              </h3>
              <p className="text-gray-500 mb-4">
                새로운 학생 기록을 추가해보세요.
              </p>
              <Button
                variant="primary"
                size="md"
                onClick={() => {
                  console.log("첫 기록 추가하기 버튼 클릭됨");
                  setIsAddingRecord(true);
                }}
              >
                첫 기록 추가하기
              </Button>
            </div>
          </Card>
        ) : (
          records.map((record) => {
            const student = getStudent(record.student_id);
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
                  최종 수정: {record.last_modified}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 기록 추가 모달 */}
      {isAddingRecord && (
        <>
          {console.log("모달 렌더링 시작됨")}
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
                  value={newRecord.student_id || ""}
                  onChange={(e) =>
                    setNewRecord({
                      ...newRecord,
                      student_id: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">학생을 선택하세요</option>
                  {middleSchoolStudents.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.name} ({getGrade(student.grade, "half")})
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
                            option.value as Tables<"homework_records_middle">["attendance"],
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
                        ) as Tables<"homework_records_middle">["participation"],
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
                        ) as Tables<"homework_records_middle">["understanding"],
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
                            option.value as Tables<"homework_records_middle">["homework"],
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
                disabled={
                  !newRecord.student_id || createRecordMutation.isPending
                }
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 transition-colors"
              >
                {createRecordMutation.isPending ? "추가 중..." : "추가"}
              </button>
            </div>
          </div>
        </div>
        </>
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
                {getStudent(editingRecord.student_id)?.name} |{" "}
                {formatWeekRange(editingRecord.week_of)}
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
                            option.value as Tables<"homework_records_middle">["attendance"],
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
                        ) as Tables<"homework_records_middle">["participation"],
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
                        ) as Tables<"homework_records_middle">["understanding"],
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
                            option.value as Tables<"homework_records_middle">["homework"],
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
                disabled={updateRecordMutation.isPending}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 transition-colors"
              >
                {updateRecordMutation.isPending ? "저장 중..." : "저장"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
