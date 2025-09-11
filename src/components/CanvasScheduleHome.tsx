"use client";

import { students } from "@/lib/mock/students";
import { ClassBlock, EditMode, ScheduleConfig, Student } from "@/types/schedule";
import { Check, Clock, Plus, Users, X } from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";

// Mock class data for demonstration based on screenshots
const mockClassData = [
  // Student 1 (정우진) - 중2
  { id: "1", studentId: 1, title: "무슨 수업", type: "class", dayOfWeek: 1, startTime: "16:00", endTime: "18:00", color: "#3B82F6" },
  { id: "2", studentId: 1, title: "무슨 수업", type: "class", dayOfWeek: 3, startTime: "16:00", endTime: "18:00", color: "#3B82F6" },
  { id: "3", studentId: 1, title: "무슨 수업", type: "class", dayOfWeek: 5, startTime: "16:00", endTime: "18:00", color: "#3B82F6" },
  
  // Student 2 (김서윤) - 중2
  { id: "4", studentId: 2, title: "일정", type: "personal", dayOfWeek: 1, startTime: "17:00", endTime: "18:30", color: "#EF4444" },
  { id: "5", studentId: 2, title: "일정", type: "personal", dayOfWeek: 3, startTime: "17:00", endTime: "18:30", color: "#EF4444" },
  { id: "6", studentId: 2, title: "일정", type: "personal", dayOfWeek: 5, startTime: "17:00", endTime: "18:30", color: "#EF4444" },
  
  // Student 3 (이민서) - 중3  
  { id: "7", studentId: 3, title: "무슨 수업", type: "class", dayOfWeek: 1, startTime: "18:00", endTime: "20:00", color: "#3B82F6" },
  { id: "8", studentId: 3, title: "무슨 수업", type: "class", dayOfWeek: 3, startTime: "18:00", endTime: "20:00", color: "#3B82F6" },
  { id: "9", studentId: 3, title: "무슨 수업", type: "class", dayOfWeek: 5, startTime: "18:00", endTime: "20:00", color: "#3B82F6" },
  
  // Student 4 (박하은) - 중2
  { id: "10", studentId: 4, title: "일정", type: "personal", dayOfWeek: 2, startTime: "16:00", endTime: "17:00", color: "#EF4444" },
  { id: "11", studentId: 4, title: "무슨 수업", type: "class", dayOfWeek: 2, startTime: "17:00", endTime: "19:00", color: "#3B82F6" },
  { id: "12", studentId: 4, title: "일정", type: "personal", dayOfWeek: 4, startTime: "16:00", endTime: "17:00", color: "#EF4444" },
  { id: "13", studentId: 4, title: "무슨 수업", type: "class", dayOfWeek: 4, startTime: "17:00", endTime: "19:00", color: "#3B82F6" },
  
  // Student 5 (최도윤) - 중2
  { id: "14", studentId: 5, title: "무슨 수업", type: "class", dayOfWeek: 1, startTime: "19:00", endTime: "21:00", color: "#3B82F6" },
  { id: "15", studentId: 5, title: "무슨 수업", type: "class", dayOfWeek: 3, startTime: "19:00", endTime: "21:00", color: "#3B82F6" },
  { id: "16", studentId: 5, title: "무슨 수업", type: "class", dayOfWeek: 5, startTime: "19:00", endTime: "21:00", color: "#3B82F6" },
  
  // Student 6 (강민규) - 중2
  { id: "17", studentId: 6, title: "무슨 수업", type: "class", dayOfWeek: 2, startTime: "18:00", endTime: "20:00", color: "#3B82F6" },
  { id: "18", studentId: 6, title: "무슨 수업", type: "class", dayOfWeek: 4, startTime: "18:00", endTime: "20:00", color: "#3B82F6" },
  
  // Student 7 (조서현) - 중3
  { id: "19", studentId: 7, title: "무슨 수업", type: "class", dayOfWeek: 1, startTime: "17:00", endTime: "18:00", color: "#3B82F6" },
  { id: "20", studentId: 7, title: "무슨 수업", type: "class", dayOfWeek: 3, startTime: "17:00", endTime: "18:00", color: "#3B82F6" },
  { id: "21", studentId: 7, title: "무슨 수업", type: "class", dayOfWeek: 5, startTime: "17:00", endTime: "18:00", color: "#3B82F6" },
  
  // Student 8 (윤지훈) - 중3
  { id: "22", studentId: 8, title: "무슨 수업", type: "class", dayOfWeek: 2, startTime: "19:00", endTime: "21:00", color: "#3B82F6" },
  { id: "23", studentId: 8, title: "무슨 수업", type: "class", dayOfWeek: 4, startTime: "19:00", endTime: "21:00", color: "#3B82F6" },
  
  // Student 9 (송은서) - 중2
  { id: "24", studentId: 9, title: "일정", type: "personal", dayOfWeek: 1, startTime: "16:00", endTime: "17:00", color: "#EF4444" },
  { id: "25", studentId: 9, title: "무슨 수업", type: "class", dayOfWeek: 1, startTime: "17:00", endTime: "19:00", color: "#3B82F6" },
  { id: "26", studentId: 9, title: "일정", type: "personal", dayOfWeek: 3, startTime: "16:00", endTime: "17:00", color: "#EF4444" },
  { id: "27", studentId: 9, title: "무슨 수업", type: "class", dayOfWeek: 3, startTime: "17:00", endTime: "19:00", color: "#3B82F6" },
  { id: "28", studentId: 9, title: "일정", type: "personal", dayOfWeek: 5, startTime: "16:00", endTime: "17:00", color: "#EF4444" },
  { id: "29", studentId: 9, title: "무슨 수업", type: "class", dayOfWeek: 5, startTime: "17:00", endTime: "19:00", color: "#3B82F6" },
  
  // Student 10 (한준서) - 중2
  { id: "30", studentId: 10, title: "무슨 수업", type: "class", dayOfWeek: 2, startTime: "16:00", endTime: "18:00", color: "#3B82F6" },
  { id: "31", studentId: 10, title: "무슨 수업", type: "class", dayOfWeek: 4, startTime: "16:00", endTime: "18:00", color: "#3B82F6" },
];

const timeSlots = Array.from({ length: 7 }, (_, i) => {
  const hour = i + 16; // Starting from 4 PM (16:00)
  return `${hour}:00`;
});

interface CanvasScheduleProps {
  editMode?: EditMode;
}

interface StudentScheduleRow extends Student {
  schedules: Array<{
    id: string;
    title: string;
    type: string;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    color: string;
  }>;
}

interface ClassModalProps {
  block: ClassBlock | null;
  editMode: EditMode;
  isOpen: boolean;
  onClose: () => void;
  onSave: (blockId: string, updatedData: Partial<ClassBlock>) => void;
}

function ClassModal({
  block,
  editMode,
  isOpen,
  onClose,
  onSave,
}: ClassModalProps) {
  const [editData, setEditData] = useState({
    title: block?.title || "",
    teacherName: block?.teacherName || "",
    room: block?.room || "",
    subject: block?.subject || "",
    startTime: block?.startTime || "",
    endTime: block?.endTime || "",
  });

  React.useEffect(() => {
    if (block) {
      setEditData({
        title: block.title,
        teacherName: block.teacherName,
        room: block.room || "",
        subject: block.subject,
        startTime: block.startTime,
        endTime: block.endTime,
      });
    }
  }, [block]);

  if (!isOpen || !block) return null;

  const canEdit = editMode === "admin" || editMode === "edit";

  const handleSave = () => {
    onSave(block.id, editData);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 text-[#2d2d2d]"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">수업 정보</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          {canEdit ? (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  수업명
                </label>
                <input
                  type="text"
                  value={editData.title}
                  onChange={(e) =>
                    setEditData({ ...editData, title: e.target.value })
                  }
                  className="w-full border rounded-md px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  과목
                </label>
                <input
                  type="text"
                  value={editData.subject}
                  onChange={(e) =>
                    setEditData({ ...editData, subject: e.target.value })
                  }
                  className="w-full border rounded-md px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  강사명
                </label>
                <input
                  type="text"
                  value={editData.teacherName}
                  onChange={(e) =>
                    setEditData({ ...editData, teacherName: e.target.value })
                  }
                  className="w-full border rounded-md px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  강의실
                </label>
                <input
                  type="text"
                  value={editData.room}
                  onChange={(e) =>
                    setEditData({ ...editData, room: e.target.value })
                  }
                  className="w-full border rounded-md px-3 py-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    시작 시간
                  </label>
                  <input
                    type="time"
                    value={editData.startTime}
                    onChange={(e) =>
                      setEditData({ ...editData, startTime: e.target.value })
                    }
                    className="w-full border rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    종료 시간
                  </label>
                  <input
                    type="time"
                    value={editData.endTime}
                    onChange={(e) =>
                      setEditData({ ...editData, endTime: e.target.value })
                    }
                    className="w-full border rounded-md px-3 py-2"
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              <div>
                <span className="block text-sm font-medium text-gray-700">
                  수업명
                </span>
                <p className="mt-1">{block.title}</p>
              </div>

              <div>
                <span className="block text-sm font-medium text-gray-700">
                  과목
                </span>
                <p className="mt-1">{block.subject}</p>
              </div>

              <div>
                <span className="block text-sm font-medium text-gray-700">
                  강사명
                </span>
                <p className="mt-1">{block.teacherName}</p>
              </div>

              <div>
                <span className="block text-sm font-medium text-gray-700">
                  강의실
                </span>
                <p className="mt-1">{block.room || "미정"}</p>
              </div>
            </>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="block text-sm font-medium text-gray-700">
                시간
              </span>
              <div className="flex items-center mt-1">
                <Clock className="w-4 h-4 mr-2 text-gray-400" />
                <span>
                  {block.startTime} ~ {block.endTime}
                </span>
              </div>
            </div>

            <div>
              <span className="block text-sm font-medium text-gray-700">
                학생 수
              </span>
              <div className="flex items-center mt-1">
                <Users className="w-4 h-4 mr-2 text-gray-400" />
                <span>
                  {block.studentCount}
                  {block.maxStudents && `/${block.maxStudents}`}
                </span>
              </div>
            </div>
          </div>

          {canEdit && (
            <div className="flex gap-3 pt-4 border-t">
              <button
                onClick={handleSave}
                className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                저장
              </button>
              <button
                onClick={onClose}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 flex items-center justify-center gap-2"
              >
                <X className="w-4 h-4" />
                취소
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CanvasScheduleHome({
  editMode = "view",
}: CanvasScheduleProps) {
  const [studentSchedules, setStudentSchedules] = useState<StudentScheduleRow[]>([]);

  // Create student rows with their schedules
  useEffect(() => {
    const studentRows = students.slice(0, 15).map(student => ({
      ...student,
      schedules: mockClassData.filter(schedule => schedule.studentId === student.id)
    }));
    setStudentSchedules(studentRows);
  }, []);

  // Get schedule for specific student and time slot
  const getScheduleAtTime = (studentId: number, dayOfWeek: number, hour: number) => {
    const student = studentSchedules.find(s => s.id === studentId);
    if (!student) return null;

    return student.schedules.find(schedule => {
      const startHour = parseInt(schedule.startTime.split(':')[0]);
      const endHour = parseInt(schedule.endTime.split(':')[0]);
      return schedule.dayOfWeek === dayOfWeek && hour >= startHour && hour < endHour;
    });
  };

  // Days of the week - 월(1), 화(2), 수(3), 목(4), 금(5)
  const days = [
    { name: "월", value: 1 },
    { name: "화", value: 2 }, 
    { name: "수", value: 3 },
    { name: "목", value: 4 },
    { name: "금", value: 5 }
  ];

  // Time slots from 4 PM to 10 PM
  const hours = [4, 5, 6, 7, 8, 9, 10];

  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">학생 시간표</h2>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-blue-500"></div>
            <span>무슨 수업</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-red-500"></div>
            <span>일정</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-[80px_100px_100px_80px_repeat(35,_1fr)] bg-gray-50 border-b border-gray-200">
          <div className="p-3 font-semibold text-gray-700 border-r border-gray-200">id</div>
          <div className="p-3 font-semibold text-gray-700 border-r border-gray-200">이름</div>
          <div className="p-3 font-semibold text-gray-700 border-r border-gray-200">학교</div>
          <div className="p-3 font-semibold text-gray-700 border-r border-gray-200">학년</div>
          
          {/* Days and Hours Headers */}
          {days.map((day, dayIndex) => (
            <React.Fragment key={day.value}>
              {hours.map((hour, hourIndex) => (
                <div 
                  key={`${day.value}-${hour}`}
                  className={`p-2 text-center text-sm font-medium text-gray-600 border-r border-gray-200 ${
                    hourIndex === 0 ? 'bg-gray-100' : ''
                  }`}
                >
                  {hourIndex === 0 && <div className="font-bold">{day.name}</div>}
                  <div className="text-xs">{hour}</div>
                </div>
              ))}
            </React.Fragment>
          ))}
        </div>

        {/* Table Body */}
        <div className="max-h-[600px] overflow-y-auto">
          {studentSchedules.map((student, index) => (
            <div 
              key={student.id} 
              className={`grid grid-cols-[80px_100px_100px_80px_repeat(35,_1fr)] border-b border-gray-100 ${
                index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
              }`}
            >
              <div className="p-3 border-r border-gray-200">{student.id}</div>
              <div className="p-3 border-r border-gray-200 font-medium">{student.name}</div>
              <div className="p-3 border-r border-gray-200 text-sm text-gray-600">무슨학교</div>
              <div className="p-3 border-r border-gray-200 text-center">
                {student.grade === 8 ? '중2' : student.grade === 9 ? '중3' : `고${student.grade - 9}`}
              </div>
              
              {/* Schedule Blocks */}
              {days.map(day => (
                <React.Fragment key={`${student.id}-${day.value}`}>
                  {hours.map(hour => {
                    const schedule = getScheduleAtTime(student.id, day.value, hour);
                    return (
                      <div 
                        key={`${student.id}-${day.value}-${hour}`}
                        className="p-1 border-r border-gray-200 relative h-12"
                      >
                        {schedule && (
                          <div 
                            className={`absolute inset-1 rounded text-white text-xs flex items-center justify-center font-medium`}
                            style={{ backgroundColor: schedule.color }}
                          >
                            {schedule.title}
                          </div>
                        )}
                        {/* Show gray background for certain time slots like in the screenshot */}
                        {!schedule && (
                          (student.id <= 3 && hour === 10) || // Some students have blocked 10 PM slot
                          (student.id >= 4 && student.id <= 6 && (hour === 4 || hour === 10)) || // Some blocked early/late
                          (student.id >= 7 && student.id <= 10 && hour === 10) // Some have 10 PM blocked
                        ) && (
                          <div className="absolute inset-1 bg-gray-400 rounded"></div>
                        )}
                      </div>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
