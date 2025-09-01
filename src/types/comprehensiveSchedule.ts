import { Student, StudentSchedule, Class } from "./schedule";

// 시간 슬롯 정의
export interface TimeSlot {
  hour: number;
  label: string;
}

// 요일별 시간표 데이터
export interface DaySchedule {
  dayIndex: number;
  dayName: string;
  timeSlots: TimeSlot[];
  schedules: ScheduleItem[];
}

// 시간표 항목 (수업 또는 개인 일정)
export interface ScheduleItem {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  type: "class" | "personal";
  color: string;
  subject?: string;
  location?: string;
}

// 학생별 종합 시간표
export interface StudentComprehensiveSchedule {
  student: Student;
  school: string; // 학교명 (임시로 고정값 사용)
  weeklySchedule: DaySchedule[];
  classSchedules: Class[];
  personalSchedules: StudentSchedule[];
}

// 시간표 설정
export interface ComprehensiveScheduleConfig {
  weekdayStartHour: number; // 평일 시작 시간 (16시)
  weekdayEndHour: number;   // 평일 종료 시간 (22시)
  weekendStartHour: number; // 주말 시작 시간 (10시)  
  weekendEndHour: number;   // 주말 종료 시간 (22시)
  dayNames: string[];       // 요일명
}

// 기본 설정
export const DEFAULT_SCHEDULE_CONFIG: ComprehensiveScheduleConfig = {
  weekdayStartHour: 16, // 4PM
  weekdayEndHour: 22,   // 10PM
  weekendStartHour: 10, // 10AM
  weekendEndHour: 22,   // 10PM
  dayNames: ['월', '화', '수', '목', '금', '토', '일']
};