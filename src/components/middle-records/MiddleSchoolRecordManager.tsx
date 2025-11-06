"use client";

import { convertJsDayToMondayBased, formatDateToYYYYMMDD, getGrade, getWeekStartDate } from "@/lib/utils";
import {
  useCreateMiddleRecord,
  useDeleteMiddleRecord,
  useUpdateMiddleRecord,
  useWeeklyMiddleRecords,
  useMiddleRecords,
  usePendingStudents,
} from "@/queries/useMiddleRecords";
import { useStudents } from "@/queries/useStudents";
import { useClassesByStudent, useClassStudents } from "@/queries/useClassStudents";
import { useAuthState } from "@/queries/useAuth";
import { Tables, TablesInsert, TablesUpdate } from "@/types/supabase";
import CascadingStudentSelector from "./CascadingStudentSelector";
import Link from "next/link";

// Type definition for class_students with nested relations from API
interface ClassStudentWithRelations extends Tables<"relations_classes_students"> {
  student?: Pick<Tables<"students">, "id" | "name" | "grade" | "phone" | "parent_phone" | "email"> & {
    school?: Pick<Tables<"schools">, "id" | "name" | "level"> | null;
  } | null;
  class?: Pick<Tables<"classes">, "id" | "title"> & {
    subject?: Pick<Tables<"subjects">, "id" | "subject_name"> | null;
  } | null;
  student_compositions?: Array<Tables<"relations_compositions_students"> & {
    composition?: Pick<Tables<"class_compositions">, "id" | "class_id" | "day_of_week" | "start_time" | "end_time" | "type"> | null;
  }>;
  composition_id?: string | null;
}

import { Button, Card } from "@/components/design-system";
import {
  AlertCircle,
  BookOpen,
  Calendar,
  CheckCircle,
  Clock,
  Download,
  Edit3,
  Loader2,
  Plus,
  Send,
  Star,
  TrendingUp,
  X,
  XCircle,
} from "lucide-react";
import { useMemo, useState } from "react";

interface MiddleSchoolRecordManagerProps {
  studentId?: string;
  classId?: string;
}

export default function MiddleSchoolRecordManager({
  studentId: propStudentId,
  classId: propClassId,
}: MiddleSchoolRecordManagerProps) {
  const [editingRecord, setEditingRecord] =
    useState<Tables<"homework_records_middle"> | null>(null);
  const [isAddingRecord, setIsAddingRecord] = useState(false);

  const [selectedStudentId, setSelectedStudentId] = useState<
    string | undefined
  >(propStudentId);
  const [selectedClassId, setSelectedClassId] = useState<
    string | undefined
  >(propClassId);
  const [selectedWeek, setSelectedWeek] = useState<string>(() => {
    return formatDateToYYYYMMDD(getWeekStartDate());
  });

  // Use prop values if provided, otherwise use local state
  const studentId = propStudentId || selectedStudentId;
  const classId = propClassId || selectedClassId;

  // 현재 로그인한 사용자 정보
  const { user } = useAuthState();

  // API에서 데이터 가져오기
  const { data: students = [] } = useStudents();
  const { data: studentClasses = [] } = useClassesByStudent(studentId || "");
  const { data: allStudentClasses = [] } = useClassStudents();

  // propStudentId가 있으면 해당 학생의 기록만, 없으면 선택한 주차의 모든 기록 가져오기
  const shouldUseWeekly = Boolean(propStudentId);
  const weeklyRecords = useWeeklyMiddleRecords(
    shouldUseWeekly ? classId : undefined,
    selectedWeek
  );
  const allRecords = useMiddleRecords({ weekOf: selectedWeek });

  const { data: records = [], isLoading: recordsLoading } = shouldUseWeekly
    ? weeklyRecords
    : allRecords;

  // 미입력 학생 목록 조회
  const { data: pendingData, isLoading: pendingLoading } = usePendingStudents(
    user?.id,
    selectedWeek
  );

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
    student_id: studentId || "",
    class_id: classId || "",
    week_of: selectedWeek,
    attendance: "present",
    participation: 3,
    understanding: 3,
    homework: "good",
    notes: "",
    created_date: formatDateToYYYYMMDD(new Date()),
    last_modified: formatDateToYYYYMMDD(new Date()),
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
    { value: "excellent", label: "우수", color: "text-primary-700 bg-primary-100", borderColor: "border-primary-600" },
    { value: "good", label: "양호", color: "text-primary-600 bg-primary-50", borderColor: "border-primary-500" },
    { value: "fair", label: "보통", color: "text-yellow-600 bg-yellow-50", borderColor: "border-yellow-500" },
    { value: "poor", label: "미흡", color: "text-orange-600 bg-orange-50", borderColor: "border-orange-500" },
    {
      value: "not_submitted",
      label: "미제출",
      color: "text-red-600 bg-red-50",
      borderColor: "border-red-500",
    },
  ];

  // 참여도/이해도 5단계 옵션
  const scoreOptions = [
    { value: 1, label: "매우 부족", color: "text-red-600 bg-red-50", borderColor: "border-red-500" },
    { value: 2, label: "부족", color: "text-orange-600 bg-orange-50", borderColor: "border-orange-500" },
    { value: 3, label: "보통", color: "text-yellow-600 bg-yellow-50", borderColor: "border-yellow-500" },
    { value: 4, label: "좋음", color: "text-primary-600 bg-primary-50", borderColor: "border-primary-500" },
    { value: 5, label: "매우 좋음", color: "text-primary-700 bg-primary-100", borderColor: "border-primary-600" },
  ];

  // 주차 변경
  const changeWeek = (direction: "prev" | "next") => {
    const currentDate = new Date(selectedWeek);
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + (direction === "next" ? 7 : -7));
    // 새로운 주의 월요일을 명시적으로 계산
    const newWeekStart = getWeekStartDate(newDate);
    const newWeekString = formatDateToYYYYMMDD(newWeekStart);
    setSelectedWeek(newWeekString);

    // newRecord도 주차에 맞게 업데이트
    setNewRecord((prev) => ({ ...prev, week_of: newWeekString }));
  };

  // 기록 추가
  const handleAddRecord = async () => {
    if (!newRecord.student_id || !newRecord.class_id) return;

    const recordData: TablesInsert<"homework_records_middle"> = {
      student_id: newRecord.student_id!,
      class_id: newRecord.class_id!,
      week_of: selectedWeek,
      attendance: newRecord.attendance!,
      participation: newRecord.participation!,
      understanding: newRecord.understanding!,
      homework: newRecord.homework!,
      notes: newRecord.notes || "",
      created_date: formatDateToYYYYMMDD(new Date()),
      last_modified: formatDateToYYYYMMDD(new Date()),
    };

    try {
      await createRecordMutation.mutateAsync(recordData);
      setNewRecord({
        student_id: studentId || "",
        class_id: classId || "",
        week_of: selectedWeek,
        attendance: "present",
        participation: 3,
        understanding: 3,
        homework: "good",
        notes: "",
        created_date: formatDateToYYYYMMDD(new Date()),
        last_modified: formatDateToYYYYMMDD(new Date()),
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
      last_modified: formatDateToYYYYMMDD(new Date()),
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

  // 기록 목록 컬럼 렌더링
  const recordsColumn = (
    <>
      <div className="sticky top-0 z-10 px-4 py-3 bg-gradient-to-r from-purple-50 to-purple-100 border-b border-purple-200 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-purple-600" />
            <h3 className="text-sm font-semibold text-purple-900">기록 목록</h3>
          </div>
          <span className="text-xs font-medium text-purple-600">{records.length}개</span>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-6 text-center">
            <Loader2 className="w-8 h-8 mx-auto mb-2 text-purple-600 animate-spin" />
            <p className="text-xs text-gray-600">불러오는 중...</p>
          </div>
        ) : records.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-6 text-center">
            <Calendar className="w-12 h-12 mb-3 text-gray-300" />
            <p className="text-sm font-medium text-gray-500">기록이 없습니다</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {records.map((record) => {
              const student = getStudent(record.student_id);
              if (!student) return null;

              const attendanceOpt = getAttendanceOption(record.attendance);
              const homeworkOpt = getHomeworkOption(record.homework);

              return (
                <Link
                  key={record.id}
                  href={`/homework/${record.id}`}
                  className="block p-4 transition-colors hover:bg-purple-50 cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex-shrink-0">
                        <span className="text-xs font-semibold text-white">
                          {student.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-medium text-sm text-gray-900">
                          {student.name}
                        </h4>
                        <p className="text-xs text-gray-500">
                          {getGrade(student.grade, "half")}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        setEditingRecord(record);
                      }}
                      className="p-1.5 text-gray-400 transition-colors rounded-lg hover:text-purple-600 hover:bg-purple-50"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="space-y-2">
                    {attendanceOpt && (
                      <div className="flex items-center gap-2">
                        <attendanceOpt.icon
                          className={`w-3.5 h-3.5 ${
                            attendanceOpt.color.split(" ")[0]
                          }`}
                        />
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${attendanceOpt.color}`}
                        >
                          {attendanceOpt.label}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-xs">
                      <TrendingUp className="w-3.5 h-3.5 text-gray-500" />
                      <span className="text-gray-600">참여:</span>
                      <span
                        className={`px-1.5 py-0.5 rounded text-xs font-medium ${getScoreColor(
                          record.participation
                        )}`}
                      >
                        {record.participation}/5
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                      <BookOpen className="w-3.5 h-3.5 text-gray-500" />
                      <span className="text-gray-600">이해:</span>
                      <span
                        className={`px-1.5 py-0.5 rounded text-xs font-medium ${getScoreColor(
                          record.understanding
                        )}`}
                      >
                        {record.understanding}/5
                      </span>
                    </div>

                    {homeworkOpt && (
                      <div className="flex items-center gap-2 text-xs">
                        <CheckCircle className="w-3.5 h-3.5 text-gray-500" />
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${homeworkOpt.color}`}
                        >
                          {homeworkOpt.label}
                        </span>
                      </div>
                    )}

                    {record.notes && (
                      <div className="mt-2 p-2 rounded bg-gray-50">
                        <p className="text-xs text-gray-600 line-clamp-2">
                          {record.notes}
                        </p>
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </>
  );

  return (
    <div className="w-full h-full flex flex-col gap-6">
      {/* 헤더 */}
      <Card size="lg" className="flex-shrink-0">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-primary-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                중등 주간 기록 관리
              </h1>
              <p className="mt-1 text-sm text-gray-600">
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
              <div className="w-3 h-3 rounded-full bg-primary-500"></div>
              <span>기록 완료: {pendingData?.meta?.recordedStudents || 0}명</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
              <span>
                미기록: {pendingData?.meta?.pendingStudents || 0}명
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* 미입력 학생 목록 */}
      {!propStudentId && pendingData && pendingData.data.length > 0 && (
        <Card size="lg" className="flex-shrink-0">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="w-5 h-5 text-orange-600" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                이번 주 미입력 학생 ({pendingData.data.length}명)
              </h3>
              <p className="text-sm text-gray-600">
                기록을 작성하지 않은 학생들입니다
              </p>
            </div>
          </div>

          {pendingLoading ? (
            <div className="p-6 text-center">
              <Loader2 className="w-8 h-8 mx-auto mb-2 text-orange-600 animate-spin" />
              <p className="text-xs text-gray-600">불러오는 중...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {pendingData.data.map((item) => {
                const student = item.student;
                const classInfo = item.class;

                if (!student || !classInfo) return null;

                return (
                  <div
                    key={`${item.student_id}-${item.class_id}`}
                    className="p-4 border border-orange-200 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex-shrink-0">
                          <span className="text-xs font-semibold text-white">
                            {student.name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-medium text-sm text-gray-900">
                            {student.name}
                          </h4>
                          <p className="text-xs text-gray-600">
                            {getGrade(student.grade, "half")}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setNewRecord({
                            student_id: student.id,
                            class_id: classInfo.id,
                            week_of: selectedWeek,
                            attendance: "present",
                            participation: 3,
                            understanding: 3,
                            homework: "good",
                            notes: "",
                            created_date: formatDateToYYYYMMDD(new Date()),
                            last_modified: formatDateToYYYYMMDD(new Date()),
                          });
                          setIsAddingRecord(true);
                        }}
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        작성
                      </Button>
                    </div>
                    <div className="text-xs text-gray-600">
                      <p className="truncate">
                        {classInfo.subject?.subject_name} - {classInfo.title}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      )}

      {/* 내가 작성한 기록 목록 */}
      <div className="flex-1 min-h-0">
        <div className="grid gap-6 pb-6">
        {recordsLoading ? (
          <Card size="lg">
            <div className="p-12 text-center">
              <Loader2 className="w-12 h-12 mx-auto mb-4 text-primary-600 animate-spin" />
              <p className="text-gray-600">데이터를 불러오는 중...</p>
            </div>
          </Card>
        ) : records.length === 0 ? (
          <Card size="lg">
            <div className="p-12 text-center">
              <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <h3 className="mb-2 text-lg font-medium text-gray-900">
                이번 주 기록이 없습니다
              </h3>
              <p className="mb-4 text-gray-500">
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
              <Link
                key={record.id}
                href={`/homework/${record.id}`}
                className="block p-6 bg-white border border-gray-200 rounded-lg hover:shadow-lg transition-shadow cursor-pointer"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-12 h-12 bg-primary-100 rounded-full">
                      <span className="font-semibold text-primary-600">
                        {student.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {student.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {getGrade(student.grade, "half")}
                      </p>
                      {record.class && (
                        <p className="text-xs text-gray-500">
                          {record.class.subject?.subject_name} - {record.class.title}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        setEditingRecord(record);
                      }}
                      className="p-2 text-gray-400 transition-colors rounded-lg hover:text-primary-600 hover:bg-primary-50"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        // TODO: Implement send notification
                      }}
                      className="p-2 text-gray-400 transition-colors rounded-lg hover:text-primary-600 hover:bg-primary-50"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* 상태 요약 */}
                <div className="grid grid-cols-2 gap-4 mb-4 md:grid-cols-4">
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
                    <span className="text-sm text-gray-600">참여도:</span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getScoreColor(
                        record.participation
                      )}`}
                    >
                      {record.participation}/5
                    </span>
                  </div>

                  {/* 이해도 */}
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-gray-600" />
                    <span className="text-sm text-gray-600">이해도:</span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getScoreColor(
                        record.understanding
                      )}`}
                    >
                      {record.understanding}/5
                    </span>
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

                {/* 특이사항 */}
                {record.notes && (
                  <div className="p-4 rounded-lg bg-gray-50">
                    <h4 className="mb-2 text-sm font-medium text-gray-700">
                      특이사항
                    </h4>
                    <p className="text-sm text-gray-600">{record.notes}</p>
                  </div>
                )}

                <div className="pt-4 mt-4 text-xs text-gray-500 border-t border-gray-200">
                  최종 수정: {record.last_modified}
                </div>
              </Link>
            );
          })
          )}
          </div>
        </div>

      {/* 기록 추가 모달 */}
      {isAddingRecord && (
        <>
          {console.log("모달 렌더링 시작됨")}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">새 주간 기록 추가</h3>
                  <button
                    onClick={() => setIsAddingRecord(false)}
                    className="p-2 rounded-lg hover:bg-gray-100"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <p className="mt-1 text-sm text-gray-600">
                  {formatWeekRange(selectedWeek)} 주간 기록
                </p>
              </div>

              <div className="p-6 space-y-6">
                {/* 학생 및 수업 정보 표시 (student_id와 class_id가 이미 선택되어 있을 때) */}
                {(propStudentId && propClassId) || (newRecord.student_id && newRecord.class_id) ? (
                  <div className="p-4 bg-primary-50 border border-primary-200 rounded-lg">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex-shrink-0">
                          <span className="text-xs font-semibold text-white">
                            {students.find(s => s.id === (propStudentId || newRecord.student_id))?.name.charAt(0) || '?'}
                          </span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-gray-600">학생</span>
                          </div>
                          <span className="text-sm font-semibold text-gray-900">
                            {students.find(s => s.id === (propStudentId || newRecord.student_id))?.name || '-'}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-primary-600 flex-shrink-0" />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-gray-600">수업</span>
                          </div>
                          <span className="text-sm font-semibold text-gray-900">
                            {(() => {
                              const classId = propClassId || newRecord.class_id;
                              const classInfo = (allStudentClasses as ClassStudentWithRelations[]).find(sc => sc.class_id === classId)?.class;
                              return classInfo ? `${classInfo.subject?.subject_name || ''} - ${classInfo.title}` : '-';
                            })()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* 학생 및 수업 선택 - Cascading List (아직 선택되지 않았을 때) */
                  <div>
                    <label className="block mb-3 text-sm font-medium text-gray-700">
                      학생 및 수업 선택
                    </label>
                    <CascadingStudentSelector
                      students={middleSchoolStudents}
                      allStudentClasses={allStudentClasses as ClassStudentWithRelations[]}
                      selectedStudentId={newRecord.student_id || ""}
                      selectedClassId={newRecord.class_id || ""}
                      onSelect={(studentId, classId) => {
                        setNewRecord({
                          ...newRecord,
                          student_id: studentId,
                          class_id: classId,
                        });
                      }}
                    />
                  </div>
                )}

                {/* 출석 상태 */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
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
                            ? "border-primary-500 bg-primary-50 text-primary-700 font-semibold"
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
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    참여도
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {scoreOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() =>
                          setNewRecord({
                            ...newRecord,
                            participation: option.value as Tables<"homework_records_middle">["participation"],
                          })
                        }
                        className={`p-3 rounded-lg border text-sm transition-colors ${
                          newRecord.participation === option.value
                            ? `${option.borderColor} ${option.color} font-semibold`
                            : "border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        <div className="text-center">
                          <div className="text-lg font-bold mb-1">{option.value}</div>
                          <div className="text-xs">{option.label}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 이해도 */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    이해도
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {scoreOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() =>
                          setNewRecord({
                            ...newRecord,
                            understanding: option.value as Tables<"homework_records_middle">["understanding"],
                          })
                        }
                        className={`p-3 rounded-lg border text-sm transition-colors ${
                          newRecord.understanding === option.value
                            ? `${option.borderColor} ${option.color} font-semibold`
                            : "border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        <div className="text-center">
                          <div className="text-lg font-bold mb-1">{option.value}</div>
                          <div className="text-xs">{option.label}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 숙제 상태 */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    숙제 상태
                  </label>
                  <div className="grid grid-cols-5 gap-2">
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
                        className={`p-3 rounded-lg border text-sm transition-colors ${
                          newRecord.homework === option.value
                            ? `${option.borderColor} ${option.color} font-semibold`
                            : "border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        <div className="text-center text-xs">{option.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 특이사항 */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    특이사항
                  </label>
                  <textarea
                    value={newRecord.notes || ""}
                    onChange={(e) =>
                      setNewRecord({ ...newRecord, notes: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-blue-500"
                    rows={4}
                    placeholder="학생의 특이사항이나 개선점을 기록하세요..."
                  />
                </div>
              </div>

              <div className="flex gap-3 p-6 border-t border-gray-200">
                <button
                  onClick={() => setIsAddingRecord(false)}
                  className="flex-1 px-4 py-2 text-gray-700 transition-colors border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  취소
                </button>
                <button
                  onClick={handleAddRecord}
                  disabled={
                    !newRecord.student_id || !newRecord.class_id || createRecordMutation.isPending
                  }
                  className="flex-1 px-4 py-2 text-white transition-colors bg-primary-600 rounded-lg hover:bg-primary-700 disabled:bg-gray-300"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">주간 기록 수정</h3>
                <button
                  onClick={() => setEditingRecord(null)}
                  className="p-2 rounded-lg hover:bg-gray-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="mt-1 text-sm text-gray-600">
                {getStudent(editingRecord.student_id)?.name} |{" "}
                {formatWeekRange(editingRecord.week_of)}
              </p>
            </div>

            <div className="p-6 space-y-6">
              {/* 출석 상태 */}
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
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
                          ? "border-primary-500 bg-primary-50 text-primary-700 font-semibold"
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
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  참여도
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {scoreOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() =>
                        setEditingRecord({
                          ...editingRecord,
                          participation: option.value as Tables<"homework_records_middle">["participation"],
                        })
                      }
                      className={`p-3 rounded-lg border text-sm transition-colors ${
                        editingRecord.participation === option.value
                          ? `${option.borderColor} ${option.color} font-semibold`
                          : "border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      <div className="text-center">
                        <div className="text-lg font-bold mb-1">{option.value}</div>
                        <div className="text-xs">{option.label}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 이해도 */}
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  이해도
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {scoreOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() =>
                        setEditingRecord({
                          ...editingRecord,
                          understanding: option.value as Tables<"homework_records_middle">["understanding"],
                        })
                      }
                      className={`p-3 rounded-lg border text-sm transition-colors ${
                        editingRecord.understanding === option.value
                          ? `${option.borderColor} ${option.color} font-semibold`
                          : "border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      <div className="text-center">
                        <div className="text-lg font-bold mb-1">{option.value}</div>
                        <div className="text-xs">{option.label}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 숙제 상태 */}
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  숙제 상태
                </label>
                <div className="grid grid-cols-5 gap-2">
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
                      className={`p-3 rounded-lg border text-sm transition-colors ${
                        editingRecord.homework === option.value
                          ? `${option.borderColor} ${option.color} font-semibold`
                          : "border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      <div className="text-center text-xs">{option.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 특이사항 */}
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
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
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                  placeholder="학생의 특이사항이나 개선점을 기록하세요..."
                />
              </div>
            </div>

            <div className="flex gap-3 p-6 border-t border-gray-200">
              <button
                onClick={() => handleDeleteRecord(editingRecord.id)}
                className="px-4 py-2 text-red-600 transition-colors border border-red-200 rounded-lg hover:bg-red-50"
              >
                삭제
              </button>
              <button
                onClick={() => setEditingRecord(null)}
                className="flex-1 px-4 py-2 text-gray-700 transition-colors border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                취소
              </button>
              <button
                onClick={handleUpdateRecord}
                disabled={updateRecordMutation.isPending}
                className="flex-1 px-4 py-2 text-white transition-colors bg-primary-600 rounded-lg hover:bg-primary-700 disabled:bg-gray-300"
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
