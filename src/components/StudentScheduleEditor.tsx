"use client";

import { studentSchedules } from "@/lib/mock/studentSchedules";
import { Student, StudentSchedule } from "@/types/schedule";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Edit,
  MapPin,
  Plus,
  Trash2,
  User,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";

interface StudentScheduleEditorProps {
  student: Student;
  onBack: () => void;
}

export default function StudentScheduleEditor({
  student,
  onBack,
}: StudentScheduleEditorProps) {
  // 해당 학생의 일정 필터링
  const [studentScheduleList, setStudentScheduleList] = useState<
    StudentSchedule[]
  >(studentSchedules.filter((schedule) => schedule.studentId === student.id));

  const [isAddingSchedule, setIsAddingSchedule] = useState(false);
  const [editingSchedule, setEditingSchedule] =
    useState<StudentSchedule | null>(null);
  const [selectedDay, setSelectedDay] = useState<number>(0); // 0: 월요일

  // 새 일정 폼 데이터
  const [newSchedule, setNewSchedule] = useState<Partial<StudentSchedule>>({
    title: "",
    description: "",
    startTime: "09:00",
    endTime: "10:00",
    dayOfWeek: 0,
    type: "personal",
    location: "",
    color: "#3B82F6",
    recurring: true,
    status: "active",
  });

  const daysOfWeek = ["월", "화", "수", "목", "금", "토", "일"];
  const scheduleTypes = [
    { value: "personal", label: "개인", color: "#3B82F6" },
    { value: "extracurricular", label: "외부학원", color: "#F59E0B" },
    { value: "study", label: "자율학습", color: "#10B981" },
    { value: "appointment", label: "약속", color: "#8B5CF6" },
    { value: "other", label: "기타", color: "#6B7280" },
  ];

  // 선택된 요일의 일정들
  const schedulesForSelectedDay = useMemo(() => {
    return studentScheduleList
      .filter(
        (schedule) =>
          schedule.dayOfWeek === selectedDay && schedule.status === "active"
      )
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [studentScheduleList, selectedDay]);

  // 일정 추가
  const handleAddSchedule = () => {
    if (!newSchedule.title || !newSchedule.startTime || !newSchedule.endTime)
      return;

    const schedule: StudentSchedule = {
      id: `ss-${Date.now()}`,
      studentId: student.id,
      title: newSchedule.title!,
      description: newSchedule.description || "",
      startTime: newSchedule.startTime!,
      endTime: newSchedule.endTime!,
      dayOfWeek: newSchedule.dayOfWeek!,
      color: newSchedule.color!,
      type: newSchedule.type as StudentSchedule["type"],
      location: newSchedule.location,
      recurring: newSchedule.recurring!,
      rrule: newSchedule.recurring ? "FREQ=WEEKLY" : undefined,
      createdDate: new Date().toISOString().split("T")[0],
      status: "active",
    };

    setStudentScheduleList([...studentScheduleList, schedule]);
    setNewSchedule({
      title: "",
      description: "",
      startTime: "09:00",
      endTime: "10:00",
      dayOfWeek: selectedDay,
      type: "personal",
      location: "",
      color: "#3B82F6",
      recurring: true,
      status: "active",
    });
    setIsAddingSchedule(false);
  };

  // 일정 수정
  const handleUpdateSchedule = () => {
    if (!editingSchedule) return;

    setStudentScheduleList(
      studentScheduleList.map((schedule) =>
        schedule.id === editingSchedule.id ? editingSchedule : schedule
      )
    );
    setEditingSchedule(null);
  };

  // 일정 삭제
  const handleDeleteSchedule = (scheduleId: string) => {
    setStudentScheduleList(
      studentScheduleList.map((schedule) =>
        schedule.id === scheduleId
          ? { ...schedule, status: "cancelled" as const }
          : schedule
      )
    );
  };

  // 시간 충돌 검사
  const checkTimeConflict = (
    startTime: string,
    endTime: string,
    dayOfWeek: number,
    excludeId?: string
  ) => {
    const startMinutes =
      parseInt(startTime.split(":")[0]) * 60 +
      parseInt(startTime.split(":")[1]);
    const endMinutes =
      parseInt(endTime.split(":")[0]) * 60 + parseInt(endTime.split(":")[1]);

    return studentScheduleList
      .filter(
        (s) =>
          s.dayOfWeek === dayOfWeek &&
          s.status === "active" &&
          s.id !== excludeId
      )
      .some((schedule) => {
        const scheduleStartMinutes =
          parseInt(schedule.startTime.split(":")[0]) * 60 +
          parseInt(schedule.startTime.split(":")[1]);
        const scheduleEndMinutes =
          parseInt(schedule.endTime.split(":")[0]) * 60 +
          parseInt(schedule.endTime.split(":")[1]);

        return (
          startMinutes < scheduleEndMinutes && endMinutes > scheduleStartMinutes
        );
      });
  };

  const formatTime = (time: string) => {
    return time.substring(0, 5);
  };

  const getTypeInfo = (type: string) => {
    return scheduleTypes.find((t) => t.value === type) || scheduleTypes[0];
  };

  return (
    <div className="w-full space-y-6">
      {/* 헤더 */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  {student.name} 개인 일정 관리
                </h1>
                <p className="text-sm text-gray-600">
                  {student.grade}학년 | {student.phone}
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={() => setIsAddingSchedule(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            일정 추가
          </button>
        </div>

        {/* 요일 선택 */}
        <div className="flex gap-2 overflow-x-auto">
          {daysOfWeek.map((day, index) => {
            const dayScheduleCount = studentScheduleList.filter(
              (s) => s.dayOfWeek === index && s.status === "active"
            ).length;

            return (
              <button
                key={index}
                onClick={() => setSelectedDay(index)}
                className={`flex flex-col items-center px-4 py-3 rounded-lg border transition-colors min-w-[80px] ${
                  selectedDay === index
                    ? "bg-blue-50 border-blue-200 text-blue-700"
                    : "bg-white border-gray-200 hover:bg-gray-50"
                }`}
              >
                <span className="font-medium">{day}</span>
                <span className="text-xs text-gray-500">
                  {dayScheduleCount}개
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 일정 목록 */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">
            {daysOfWeek[selectedDay]}요일 일정 ({schedulesForSelectedDay.length}
            개)
          </h3>
        </div>

        <div className="divide-y divide-gray-200">
          {schedulesForSelectedDay.length === 0 ? (
            <div className="p-12 text-center">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                등록된 일정이 없습니다
              </h3>
              <p className="text-gray-500">새 일정을 추가해보세요.</p>
            </div>
          ) : (
            schedulesForSelectedDay.map((schedule) => (
              <div key={schedule.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    {/* 시간과 색상 표시 */}
                    <div className="flex flex-col items-center gap-2">
                      <div
                        className="w-4 h-16 rounded-full"
                        style={{ backgroundColor: schedule.color }}
                      />
                      <div className="text-xs text-gray-500 text-center">
                        <div>{formatTime(schedule.startTime)}</div>
                        <div>~</div>
                        <div>{formatTime(schedule.endTime)}</div>
                      </div>
                    </div>

                    {/* 일정 정보 */}
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-gray-900">
                          {schedule.title}
                        </h4>
                        <span
                          className="px-2 py-1 text-xs rounded-full text-white"
                          style={{
                            backgroundColor: getTypeInfo(schedule.type).color,
                          }}
                        >
                          {getTypeInfo(schedule.type).label}
                        </span>
                        {schedule.recurring && (
                          <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full">
                            매주 반복
                          </span>
                        )}
                      </div>

                      {schedule.description && (
                        <p className="text-sm text-gray-600">
                          {schedule.description}
                        </p>
                      )}

                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>
                            {formatTime(schedule.startTime)} -{" "}
                            {formatTime(schedule.endTime)}
                          </span>
                        </div>
                        {schedule.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            <span>{schedule.location}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 액션 버튼 */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setEditingSchedule(schedule)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteSchedule(schedule.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 일정 추가 모달 */}
      {isAddingSchedule && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">새 일정 추가</h3>
                <button
                  onClick={() => setIsAddingSchedule(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {/* 일정 제목 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  일정 제목
                </label>
                <input
                  type="text"
                  value={newSchedule.title || ""}
                  onChange={(e) =>
                    setNewSchedule({ ...newSchedule, title: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="일정 제목을 입력하세요"
                />
              </div>

              {/* 일정 종류 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  일정 종류
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {scheduleTypes.map((type) => (
                    <button
                      key={type.value}
                      onClick={() =>
                        setNewSchedule({
                          ...newSchedule,
                          type: type.value as StudentSchedule["type"],
                          color: type.color,
                        })
                      }
                      className={`p-2 rounded-lg border text-sm transition-colors ${
                        newSchedule.type === type.value
                          ? "border-blue-500 bg-blue-50 text-blue-700"
                          : "border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 요일 선택 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  요일
                </label>
                <select
                  value={newSchedule.dayOfWeek}
                  onChange={(e) =>
                    setNewSchedule({
                      ...newSchedule,
                      dayOfWeek: parseInt(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {daysOfWeek.map((day, index) => (
                    <option key={index} value={index}>
                      {day}요일
                    </option>
                  ))}
                </select>
              </div>

              {/* 시간 설정 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    시작 시간
                  </label>
                  <input
                    type="time"
                    value={newSchedule.startTime}
                    onChange={(e) =>
                      setNewSchedule({
                        ...newSchedule,
                        startTime: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    종료 시간
                  </label>
                  <input
                    type="time"
                    value={newSchedule.endTime}
                    onChange={(e) =>
                      setNewSchedule({
                        ...newSchedule,
                        endTime: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* 장소 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  장소 (선택)
                </label>
                <input
                  type="text"
                  value={newSchedule.location || ""}
                  onChange={(e) =>
                    setNewSchedule({ ...newSchedule, location: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="장소를 입력하세요"
                />
              </div>

              {/* 설명 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  설명 (선택)
                </label>
                <textarea
                  value={newSchedule.description || ""}
                  onChange={(e) =>
                    setNewSchedule({
                      ...newSchedule,
                      description: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={3}
                  placeholder="일정에 대한 설명을 입력하세요"
                />
              </div>

              {/* 반복 설정 */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="recurring"
                  checked={newSchedule.recurring}
                  onChange={(e) =>
                    setNewSchedule({
                      ...newSchedule,
                      recurring: e.target.checked,
                    })
                  }
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <label htmlFor="recurring" className="text-sm text-gray-700">
                  매주 반복
                </label>
              </div>

              {/* 시간 충돌 경고 */}
              {newSchedule.startTime &&
                newSchedule.endTime &&
                checkTimeConflict(
                  newSchedule.startTime,
                  newSchedule.endTime,
                  newSchedule.dayOfWeek || 0
                ) && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      ⚠️ 다른 일정과 시간이 겹칩니다.
                    </p>
                  </div>
                )}
            </div>

            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => setIsAddingSchedule(false)}
                className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleAddSchedule}
                disabled={
                  !newSchedule.title ||
                  !newSchedule.startTime ||
                  !newSchedule.endTime
                }
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 transition-colors"
              >
                추가
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 일정 수정 모달 */}
      {editingSchedule && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">일정 수정</h3>
                <button
                  onClick={() => setEditingSchedule(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {/* 일정 제목 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  일정 제목
                </label>
                <input
                  type="text"
                  value={editingSchedule.title}
                  onChange={(e) =>
                    setEditingSchedule({
                      ...editingSchedule,
                      title: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* 시간 설정 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    시작 시간
                  </label>
                  <input
                    type="time"
                    value={editingSchedule.startTime}
                    onChange={(e) =>
                      setEditingSchedule({
                        ...editingSchedule,
                        startTime: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    종료 시간
                  </label>
                  <input
                    type="time"
                    value={editingSchedule.endTime}
                    onChange={(e) =>
                      setEditingSchedule({
                        ...editingSchedule,
                        endTime: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* 장소 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  장소
                </label>
                <input
                  type="text"
                  value={editingSchedule.location || ""}
                  onChange={(e) =>
                    setEditingSchedule({
                      ...editingSchedule,
                      location: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* 설명 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  설명
                </label>
                <textarea
                  value={editingSchedule.description || ""}
                  onChange={(e) =>
                    setEditingSchedule({
                      ...editingSchedule,
                      description: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={3}
                />
              </div>

              {/* 시간 충돌 경고 */}
              {checkTimeConflict(
                editingSchedule.startTime,
                editingSchedule.endTime,
                editingSchedule.dayOfWeek,
                editingSchedule.id
              ) && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    ⚠️ 다른 일정과 시간이 겹칩니다.
                  </p>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => setEditingSchedule(null)}
                className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleUpdateSchedule}
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
