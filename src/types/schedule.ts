// 학생 정보
export interface Student {
  id: number;
  name: string;
  grade: number;
  phone?: string;
  parentPhone?: string;
  email?: string;
}

// 강사 정보
export interface Teacher {
  id: string;
  name: string;
  subjects: string[];
  phone?: string;
  email?: string;
}

// 수업 정보
export interface Class {
  id: string;
  title: string;
  subject: string;
  teacherId: string;
  teacherName: string;
  startTime: string; // HH:mm 형식
  endTime: string; // HH:mm 형식
  dayOfWeek: number; // 0: 일요일, 1: 월요일, ..., 6: 토요일
  color: string; // 수업 블록 색상
  room?: string;
  maxStudents?: number;
  description?: string;
  rrule?: string; // 반복 규칙 (RRULE 형식)
}

// 수업 예외 정보 (휴강, 시간 변경 등)
export interface ClassException {
  id: string;
  classId: string;
  date: string; // YYYY-MM-DD 형식
  type: "cancel" | "reschedule" | "substitute";
  reason?: string;
  newStartTime?: string;
  newEndTime?: string;
  newRoom?: string;
  substituteTeacherId?: string;
}

// 수업-학생 관계
export interface ClassStudent {
  id: string;
  classId: string;
  studentId: string;
  enrolledDate: string; // YYYY-MM-DD 형식
  status: "active" | "paused" | "withdrawn";
}

// UI에서 사용할 수업 블록 데이터
export interface ClassBlock {
  id: string;
  classId: string;
  title: string;
  subject: string;
  teacherName: string;
  startTime: string;
  endTime: string;
  dayOfWeek: number;
  color: string;
  room?: string;
  studentCount: number;
  maxStudents?: number;
  date?: string; // 특정 날짜 (예외 처리용)
  isException?: boolean;
}

// 시간표 편집 모드
export type EditMode = "view" | "edit" | "admin";

// 드래그 앤 드롭 데이터
export interface DragData {
  type: "class-block";
  classBlock: ClassBlock;
  sourceDay: number;
  sourceTime: string;
}

// 시간표 설정
export interface ScheduleConfig {
  startHour: number; // 시작 시간 (기본: 9)
  endHour: number; // 종료 시간 (기본: 22)
  timeSlotMinutes: number; // 시간 슬롯 단위 (기본: 30분)
  showWeekend: boolean; // 주말 표시 여부
  firstDayOfWeek: number; // 주의 시작일 (0: 일요일, 1: 월요일)
}

// 학생 개인 일정
export interface StudentSchedule {
  id: string;
  studentId: number;
  title: string;
  description?: string;
  startTime: string; // HH:mm 형식
  endTime: string; // HH:mm 형식
  dayOfWeek: number; // 0: 월요일, 1: 화요일, ..., 6: 일요일
  color: string; // 일정 블록 색상
  type: "personal" | "extracurricular" | "study" | "appointment" | "other";
  location?: string;
  recurring?: boolean; // 매주 반복 여부
  rrule?: string; // 반복 규칙 (RRULE 형식)
  createdDate: string; // YYYY-MM-DD 형식
  status: "active" | "cancelled" | "completed";
}

// 시간표 필터
export interface ScheduleFilter {
  teacherIds?: string[];
  subjects?: string[];
  grades?: string[];
  rooms?: string[];
}
