"use client";

import { students } from "@/lib/mock/students";
import {
  analyzeStudentAvailability,
  suggestClassScheduling,
} from "@/lib/utils";
import {
  AlertTriangle,
  BarChart3,
  Calendar,
  CheckCircle,
  Clock,
  RefreshCw,
  Search,
  TrendingUp,
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
  SearchInput
} from "@/components/design-system";

interface ClassSchedulingSuggesterProps {
  classId?: string;
}

export default function ClassSchedulingSuggester({
  classId = "class-1",
}: ClassSchedulingSuggesterProps) {
  const [selectedStudents, setSelectedStudents] = useState<number[]>([
    1, 2, 3, 4, 5,
  ]);
  const [selectedDay, setSelectedDay] = useState<number>(0); // 월요일
  const [proposedStartTime, setProposedStartTime] = useState("14:00");
  const [proposedEndTime, setProposedEndTime] = useState("15:30");
  const [showConflictDetails, setShowConflictDetails] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState<number | "all">("all");
  const [searchTerm, setSearchTerm] = useState("");

  const daysOfWeek = ["월", "화", "수", "목", "금", "토", "일"];

  // 학년별 필터링된 학생 목록
  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const matchesSearch = student.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesGrade =
        selectedGrade === "all" || student.grade === selectedGrade;
      return matchesSearch && matchesGrade;
    });
  }, [searchTerm, selectedGrade]);

  // 스케줄링 제안
  const schedulingSuggestion = useMemo(() => {
    if (selectedStudents.length === 0) return null;

    return suggestClassScheduling(
      classId,
      selectedDay,
      proposedStartTime,
      proposedEndTime,
      selectedStudents
    );
  }, [
    classId,
    selectedDay,
    proposedStartTime,
    proposedEndTime,
    selectedStudents,
  ]);

  // 선택된 학생들의 가용 시간 분석
  const availabilityAnalyses = useMemo(() => {
    return selectedStudents.map((studentId) =>
      analyzeStudentAvailability(studentId, selectedDay)
    );
  }, [selectedStudents, selectedDay]);

  // 가용 시간 통계
  const availabilityStats = useMemo(() => {
    if (availabilityAnalyses.length === 0)
      return { totalSlots: 0, commonSlots: [] };

    // 모든 학생들의 공통 가용 시간 찾기
    const timeSlotMap = new Map<string, number>();

    availabilityAnalyses.forEach((analysis) => {
      analysis.availableSlots.forEach((slot) => {
        // 30분 단위로 시간 슬롯을 나누어 계산
        const startMinutes =
          parseInt(slot.startTime.split(":")[0]) * 60 +
          parseInt(slot.startTime.split(":")[1]);
        const endMinutes =
          parseInt(slot.endTime.split(":")[0]) * 60 +
          parseInt(slot.endTime.split(":")[1]);

        for (let minutes = startMinutes; minutes < endMinutes; minutes += 30) {
          const timeKey = `${Math.floor(minutes / 60)
            .toString()
            .padStart(2, "0")}:${(minutes % 60).toString().padStart(2, "0")}`;
          timeSlotMap.set(timeKey, (timeSlotMap.get(timeKey) || 0) + 1);
        }
      });
    });

    const totalStudents = selectedStudents.length;
    const commonSlots = Array.from(timeSlotMap.entries())
      .filter(([_, count]) => count === totalStudents)
      .map(([time, count]) => ({ time, count }))
      .sort((a, b) => a.time.localeCompare(b.time));

    return {
      totalSlots: timeSlotMap.size,
      commonSlots,
    };
  }, [availabilityAnalyses, selectedStudents]);

  // 자동 시간 추천
  const suggestOptimalTime = () => {
    if (availabilityStats.commonSlots.length === 0) return;

    // 공통 가용 시간 중에서 연속된 시간대 찾기
    const continuousSlots: { start: string; end: string; duration: number }[] =
      [];
    let currentStart: string | null = null;
    let currentEnd: string | null = null;

    for (let i = 0; i < availabilityStats.commonSlots.length; i++) {
      const slot = availabilityStats.commonSlots[i];

      if (!currentStart) {
        currentStart = slot.time;
        currentEnd = slot.time;
      } else {
        // 연속된 시간인지 확인
        const currentMinutes =
          parseInt(currentEnd!.split(":")[0]) * 60 +
          parseInt(currentEnd!.split(":")[1]);
        const slotMinutes =
          parseInt(slot.time.split(":")[0]) * 60 +
          parseInt(slot.time.split(":")[1]);

        if (slotMinutes === currentMinutes + 30) {
          currentEnd = slot.time;
        } else {
          // 연속이 끊어졌으므로 현재 구간을 저장
          if (currentStart && currentEnd) {
            const endMinutes =
              parseInt(currentEnd.split(":")[0]) * 60 +
              parseInt(currentEnd.split(":")[1]) +
              30;
            const endTime = `${Math.floor(endMinutes / 60)
              .toString()
              .padStart(2, "0")}:${(endMinutes % 60)
              .toString()
              .padStart(2, "0")}`;
            continuousSlots.push({
              start: currentStart,
              end: endTime,
              duration:
                endMinutes -
                (parseInt(currentStart.split(":")[0]) * 60 +
                  parseInt(currentStart.split(":")[1])),
            });
          }
          currentStart = slot.time;
          currentEnd = slot.time;
        }
      }
    }

    // 마지막 구간 처리
    if (currentStart && currentEnd) {
      const endMinutes =
        parseInt(currentEnd.split(":")[0]) * 60 +
        parseInt(currentEnd.split(":")[1]) +
        30;
      const endTime = `${Math.floor(endMinutes / 60)
        .toString()
        .padStart(2, "0")}:${(endMinutes % 60).toString().padStart(2, "0")}`;
      continuousSlots.push({
        start: currentStart,
        end: endTime,
        duration:
          endMinutes -
          (parseInt(currentStart.split(":")[0]) * 60 +
            parseInt(currentStart.split(":")[1])),
      });
    }

    // 90분 이상의 연속 시간대 중 첫 번째를 추천
    const suitableSlot = continuousSlots.find((slot) => slot.duration >= 90);
    if (suitableSlot) {
      setProposedStartTime(suitableSlot.start);
      const startMinutes =
        parseInt(suitableSlot.start.split(":")[0]) * 60 +
        parseInt(suitableSlot.start.split(":")[1]);
      const endMinutes = startMinutes + 90; // 90분 수업
      const endTime = `${Math.floor(endMinutes / 60)
        .toString()
        .padStart(2, "0")}:${(endMinutes % 60).toString().padStart(2, "0")}`;
      setProposedEndTime(endTime);
    }
  };

  const toggleStudentSelection = (studentId: number) => {
    setSelectedStudents((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId]
    );
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 bg-green-50";
    if (score >= 60) return "text-yellow-600 bg-yellow-50";
    if (score >= 40) return "text-orange-600 bg-orange-50";
    return "text-red-600 bg-red-50";
  };

  const getStudent = (studentId: number) => {
    return students.find((s) => s.id === studentId);
  };

  const formatTime = (time: string) => {
    return time.substring(0, 5);
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}분`;
    if (mins === 0) return `${hours}시간`;
    return `${hours}시간 ${mins}분`;
  };

  // 전체 학년 목록
  const availableGrades = useMemo(() => {
    const grades = [...new Set(students.map((s) => s.grade))].sort(
      (a, b) => a - b
    );
    return grades;
  }, []);

  return (
    <div className="w-full space-y-6">
      {/* 헤더 */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Clock className="w-6 h-6 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                수업 시간 스케줄링 도우미
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                학생들의 개인 일정을 고려하여 최적의 수업 시간을 찾아보세요
              </p>
            </div>
          </div>
          <button
            onClick={suggestOptimalTime}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            자동 추천
          </button>
        </div>

        {/* 제안 결과 요약 */}
        {schedulingSuggestion && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div
              className={`p-4 rounded-lg ${getScoreColor(
                schedulingSuggestion.score
              )}`}
            >
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm font-medium">적합도</span>
              </div>
              <div className="text-2xl font-bold">
                {schedulingSuggestion.score}점
              </div>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">
                  참여 가능
                </span>
              </div>
              <div className="text-2xl font-bold text-green-900">
                {schedulingSuggestion.availableStudents.length}명
              </div>
            </div>
            <div className="p-4 bg-red-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <span className="text-sm font-medium text-red-800">
                  시간 충돌
                </span>
              </div>
              <div className="text-2xl font-bold text-red-900">
                {schedulingSuggestion.conflictStudents.length}명
              </div>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">
                  공통 시간대
                </span>
              </div>
              <div className="text-2xl font-bold text-blue-900">
                {availabilityStats.commonSlots.length}개
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* 왼쪽: 수업 설정 */}
        <div className="space-y-6">
          {/* 수업 시간 설정 */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              수업 시간 설정
            </h3>

            <div className="space-y-4">
              {/* 요일 선택 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  요일
                </label>
                <div className="grid grid-cols-7 gap-2">
                  {daysOfWeek.map((day, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedDay(index)}
                      className={`p-3 rounded-lg border text-sm transition-colors ${
                        selectedDay === index
                          ? "border-blue-500 bg-blue-50 text-blue-700"
                          : "border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>

              {/* 시간 설정 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    시작 시간
                  </label>
                  <input
                    type="time"
                    value={proposedStartTime}
                    onChange={(e) => setProposedStartTime(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    종료 시간
                  </label>
                  <input
                    type="time"
                    value={proposedEndTime}
                    onChange={(e) => setProposedEndTime(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {schedulingSuggestion && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">
                      {daysOfWeek[selectedDay]}요일{" "}
                      {formatTime(proposedStartTime)} ~{" "}
                      {formatTime(proposedEndTime)}
                    </span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getScoreColor(
                        schedulingSuggestion.score
                      )}`}
                    >
                      {schedulingSuggestion.score}점
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 학생 선택 */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                대상 학생 선택
              </h3>
              <span className="text-sm text-gray-600">
                {selectedStudents.length}명 선택됨
              </span>
            </div>

            {/* 검색 및 필터 */}
            <div className="space-y-3 mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="학생 이름으로 검색..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <select
                value={selectedGrade === "all" ? "all" : selectedGrade}
                onChange={(e) =>
                  setSelectedGrade(
                    e.target.value === "all" ? "all" : parseInt(e.target.value)
                  )
                }
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">전체 학년</option>
                {availableGrades.map((grade) => (
                  <option key={grade} value={grade}>
                    {grade}학년
                  </option>
                ))}
              </select>
            </div>

            {/* 학생 목록 */}
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {filteredStudents.map((student) => {
                const isSelected = selectedStudents.includes(student.id);
                const isAvailable =
                  schedulingSuggestion?.availableStudents.includes(student.id);
                const hasConflict =
                  schedulingSuggestion?.conflictStudents.includes(student.id);

                return (
                  <div
                    key={student.id}
                    onClick={() => toggleStudentSelection(student.id)}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      isSelected
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900">
                              {student.name}
                            </span>
                            <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full">
                              {student.grade}학년
                            </span>
                          </div>
                          <div className="text-xs text-gray-600">
                            {student.phone}
                          </div>
                        </div>
                      </div>

                      {isSelected && schedulingSuggestion && (
                        <div className="flex items-center gap-1">
                          {isAvailable && (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          )}
                          {hasConflict && (
                            <AlertTriangle className="w-4 h-4 text-red-600" />
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 오른쪽: 분석 결과 */}
        <div className="space-y-6">
          {/* 충돌 상세 정보 */}
          {schedulingSuggestion &&
            schedulingSuggestion.conflictStudents.length > 0 && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    시간 충돌 상세
                  </h3>
                  <button
                    onClick={() => setShowConflictDetails(!showConflictDetails)}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    {showConflictDetails ? "숨기기" : "자세히 보기"}
                  </button>
                </div>

                <div className="space-y-3">
                  {schedulingSuggestion.conflictStudents.map((studentId) => {
                    const student = getStudent(studentId);
                    if (!student) return null;

                    const analysis = analyzeStudentAvailability(
                      studentId,
                      selectedDay
                    );

                    return (
                      <div
                        key={studentId}
                        className="p-3 bg-red-50 border border-red-200 rounded-lg"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <AlertTriangle className="w-4 h-4 text-red-600" />
                          <span className="font-medium text-red-900">
                            {student.name}
                          </span>
                        </div>

                        {showConflictDetails && (
                          <div className="space-y-2">
                            <div className="text-sm text-red-800">
                              충돌하는 일정:
                            </div>
                            {analysis.conflictingSchedules
                              .filter((schedule) => {
                                const scheduleStartMinutes =
                                  parseInt(schedule.startTime.split(":")[0]) *
                                    60 +
                                  parseInt(schedule.startTime.split(":")[1]);
                                const scheduleEndMinutes =
                                  parseInt(schedule.endTime.split(":")[0]) *
                                    60 +
                                  parseInt(schedule.endTime.split(":")[1]);
                                const proposedStartMinutes =
                                  parseInt(proposedStartTime.split(":")[0]) *
                                    60 +
                                  parseInt(proposedStartTime.split(":")[1]);
                                const proposedEndMinutes =
                                  parseInt(proposedEndTime.split(":")[0]) * 60 +
                                  parseInt(proposedEndTime.split(":")[1]);

                                return (
                                  proposedStartMinutes < scheduleEndMinutes &&
                                  proposedEndMinutes > scheduleStartMinutes
                                );
                              })
                              .map((schedule) => (
                                <div
                                  key={schedule.id}
                                  className="text-xs text-red-700 ml-4"
                                >
                                  • {schedule.title} (
                                  {formatTime(schedule.startTime)} ~{" "}
                                  {formatTime(schedule.endTime)})
                                  {schedule.location &&
                                    ` - ${schedule.location}`}
                                </div>
                              ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

          {/* 공통 가용 시간 */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {daysOfWeek[selectedDay]}요일 공통 가용 시간
            </h3>

            {availabilityStats.commonSlots.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">
                  공통 가용 시간이 없습니다
                </h4>
                <p className="text-gray-600">
                  다른 요일을 선택하거나 학생 선택을 조정해보세요.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {availabilityStats.commonSlots.map((slot, index) => {
                  const nextSlot = availabilityStats.commonSlots[index + 1];
                  const currentMinutes =
                    parseInt(slot.time.split(":")[0]) * 60 +
                    parseInt(slot.time.split(":")[1]);
                  const endTime = `${Math.floor((currentMinutes + 30) / 60)
                    .toString()
                    .padStart(2, "0")}:${((currentMinutes + 30) % 60)
                    .toString()
                    .padStart(2, "0")}`;

                  // 연속된 시간인지 확인
                  const isStartOfBlock =
                    index === 0 ||
                    parseInt(
                      availabilityStats.commonSlots[index - 1].time.split(
                        ":"
                      )[0]
                    ) *
                      60 +
                      parseInt(
                        availabilityStats.commonSlots[index - 1].time.split(
                          ":"
                        )[1]
                      ) !==
                      currentMinutes - 30;

                  if (!isStartOfBlock) return null;

                  // 연속된 시간 블록의 길이 계산
                  let blockEnd = currentMinutes + 30;
                  for (
                    let i = index + 1;
                    i < availabilityStats.commonSlots.length;
                    i++
                  ) {
                    const nextMinutes =
                      parseInt(
                        availabilityStats.commonSlots[i].time.split(":")[0]
                      ) *
                        60 +
                      parseInt(
                        availabilityStats.commonSlots[i].time.split(":")[1]
                      );
                    if (nextMinutes === blockEnd) {
                      blockEnd += 30;
                    } else {
                      break;
                    }
                  }

                  const blockEndTime = `${Math.floor(blockEnd / 60)
                    .toString()
                    .padStart(2, "0")}:${(blockEnd % 60)
                    .toString()
                    .padStart(2, "0")}`;
                  const duration = blockEnd - currentMinutes;

                  return (
                    <div
                      key={slot.time}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        duration >= 90
                          ? "bg-green-50 border-green-200 hover:bg-green-100"
                          : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                      }`}
                      onClick={() => {
                        setProposedStartTime(slot.time);
                        if (duration >= 90) {
                          const endMinutes = currentMinutes + 90;
                          setProposedEndTime(
                            `${Math.floor(endMinutes / 60)
                              .toString()
                              .padStart(2, "0")}:${(endMinutes % 60)
                              .toString()
                              .padStart(2, "0")}`
                          );
                        } else {
                          setProposedEndTime(blockEndTime);
                        }
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-gray-900">
                            {formatTime(slot.time)} ~ {formatTime(blockEndTime)}
                          </div>
                          <div className="text-sm text-gray-600">
                            {formatDuration(duration)} 가능
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {duration >= 90 && (
                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                              수업 가능
                            </span>
                          )}
                          <span className="text-xs text-gray-500">
                            {selectedStudents.length}명 모두
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 개별 학생 분석 */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              개별 학생 가용 시간 분석
            </h3>

            <div className="space-y-3 max-h-64 overflow-y-auto">
              {selectedStudents.map((studentId) => {
                const student = getStudent(studentId);
                if (!student) return null;

                const analysis = analyzeStudentAvailability(
                  studentId,
                  selectedDay
                );
                const isAvailable =
                  schedulingSuggestion?.availableStudents.includes(studentId);

                return (
                  <div
                    key={studentId}
                    className="p-3 border border-gray-200 rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">
                          {student.name}
                        </span>
                        <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full">
                          {student.grade}학년
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        {isAvailable ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-red-600" />
                        )}
                      </div>
                    </div>

                    <div className="text-sm text-gray-600">
                      가용 시간: {analysis.availableSlots.length}개 블록
                      {analysis.availableSlots.length > 0 && (
                        <span className="ml-2">
                          (총{" "}
                          {formatDuration(
                            analysis.availableSlots.reduce(
                              (sum, slot) => sum + slot.duration,
                              0
                            )
                          )}
                          )
                        </span>
                      )}
                    </div>

                    {analysis.conflictingSchedules.length > 0 && (
                      <div className="text-xs text-gray-500 mt-1">
                        기존 일정: {analysis.conflictingSchedules.length}개
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
