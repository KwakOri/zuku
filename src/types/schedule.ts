import { Tables } from "./supabase";

// Supabase 타입을 사용
export type Student = Tables<"students">;
export type Teacher = Tables<"teachers">;
export type Class = Tables<"classes">;
export type ClassComposition = Tables<"class_composition">;
export type Subject = Tables<"subjects">;

// Supabase 타입 사용
export type ClassStudent = Tables<"class_students">;
export type ClassException = Tables<"class_exceptions">;

// UI에서 사용할 수업 블록 데이터
export interface ClassBlock {
  id: string;
  classId: string;
  compositionId?: string; // 연결된 시간 구성 ID
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
  splitType?: string; // single | split
  compositionType?: string; // class | clinic (앞타임/뒤타임 구분)
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
  firstDayOfWeek: number; // 주의 시작일 (0: 월요일)
}

// 학생 개인 일정
export interface StudentSchedule {
  id: string;
  studentId: Student["id"];
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
  teacherIds?: Teacher["id"][];
  subjectIds?: Subject["id"][];
  grades?: Student["grade"][];
  rooms?: Class["room"][];
}

// 사용자 역할
export type UserRole = "admin" | "teacher" | "assistant" | "student" | "parent";

// 조교 정보
export interface Assistant {
  id: string;
  name: string;
  teacherId: Teacher["id"]; // 담당 강사
  subjectIds: Subject["id"][]; // 담당 과목 ID 목록
  phone?: string;
  email?: string;
  assignedGrades: number[]; // 담당 학년
}

// 중등 주간 기록 (강사 작성)
export interface MiddleSchoolRecord {
  id: string;
  studentId: Student["id"];
  teacherId: Teacher["id"];
  classId: Class["id"];
  weekOf: string; // YYYY-MM-DD (주간 시작일)
  attendance: "present" | "absent" | "late"; // 출석 상태
  participation: 1 | 2 | 3 | 4 | 5; // 참여도 (1: 매우부족 ~ 5: 매우좋음)
  understanding: 1 | 2 | 3 | 4 | 5; // 이해도 (1: 매우부족 ~ 5: 매우좋음)
  homework: "excellent" | "good" | "fair" | "poor" | "not_submitted"; // 숙제 상태
  notes: string; // 특이사항
  createdDate: string; // YYYY-MM-DD
  lastModified: string; // YYYY-MM-DD
}

// 시간표 가용 시간 분석 결과
export interface AvailabilityAnalysis {
  studentId: string;
  dayOfWeek: number;
  availableSlots: {
    startTime: string;
    endTime: string;
    duration: number; // 분 단위
  }[];
  conflictingSchedules: StudentSchedule[];
}

// 수업 스케줄링 제안
export interface ClassSchedulingSuggestion {
  classId: Class["id"];
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  availableStudents: string[]; // 참여 가능한 학생 ID 목록
  conflictStudents: string[]; // 시간 충돌이 있는 학생 ID 목록
  score: number; // 추천 점수 (0-100)
}

// 학생 시간표 블록 (수업 + 개인 일정)
export interface StudentScheduleBlock {
  id: string;
  title: string;
  type:
    | "class"
    | "personal"
    | "extracurricular"
    | "study"
    | "appointment"
    | "other";
  startTime: string; // HH:mm 형식
  endTime: string; // HH:mm 형식
  dayOfWeek: number; // 0: 월요일, 1: 화요일, ..., 6: 일요일
  color: string;
  location?: string;
  teacherName?: string; // 수업일 경우만
  subject?: string; // 수업일 경우만
  description?: string;
  isEditable: boolean; // 편집 가능 여부 (개인 일정은 편집 가능, 수업은 불가)
}

// 학생 주간 시간표 구성 정보
export interface StudentWeeklyView {
  student: Student;
  scheduleBlocks: StudentScheduleBlock[];
  weekDays: string[]; // ["월", "화", "수", "목", "금", "토", "일"]
  timeSlots: string[]; // ["09:00", "09:30", "10:00", ...]
}
