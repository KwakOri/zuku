import { ClassBlock } from "@/types/schedule";
import { Tables } from "@/types/supabase";

type StudentScheduleRow = Tables<"student_schedules">;

// 학생 개인 일정을 ClassBlock 형태로 변환
export function convertStudentSchedulesToBlocks(
  schedules: StudentScheduleRow[]
): ClassBlock[] {
  return schedules.map((schedule) => ({
    id: schedule.id,
    classId: schedule.id,
    title: schedule.title,
    subject: schedule.type,
    teacherName: "개인 일정",
    startTime: schedule.start_time,
    endTime: schedule.end_time,
    dayOfWeek: schedule.day_of_week,
    color: schedule.color,
    room: schedule.location || undefined,
    studentCount: 1,
    maxStudents: 1,
    isException: false,
  }));
}

// ClassBlock을 학생 개인 일정 형태로 변환
export function convertBlockToStudentSchedule(
  block: ClassBlock,
  studentId: number
): Omit<StudentScheduleRow, "id" | "created_date"> {
  return {
    student_id: studentId,
    title: block.title,
    description: null,
    start_time: block.startTime,
    end_time: block.endTime,
    day_of_week: block.dayOfWeek,
    type: block.subject || "personal",
    color: block.color,
    location: block.room || null,
    recurring: false,
    rrule: null,
    status: "active",
  };
}

// 기본 색상 팔레트
export const defaultColors = [
  "#3b82f6", // blue
  "#ef4444", // red
  "#10b981", // emerald
  "#f59e0b", // amber
  "#8b5cf6", // violet
  "#ec4899", // pink
  "#06b6d4", // cyan
  "#84cc16", // lime
];

// 랜덤 색상 선택
export function getRandomColor(): string {
  return defaultColors[Math.floor(Math.random() * defaultColors.length)];
}