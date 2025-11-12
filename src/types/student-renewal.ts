// 학생 정보 갱신 관련 타입 정의

export interface ExcelStudentData {
  반명: string;
  학생명: string;
  학교명: string;
  학년: number;
  학생핸드폰: string;
  생년월일: string;
  성별: string;
}

// 반명 파싱 결과
export interface ParsedClassInfo {
  subjectName: string; // 과목명 (예: 국어, 수학, 영어)
  className: string; // 반이름 (예: 고3반, 중2반)
  fullClassName: string; // 전체 반명 (예: 국어-고3반)
  schedules: ParsedSchedule[]; // 수업 시간 정보들
  splitType: 'single' | 'split'; // 단일수업 or 분반수업
  year?: string; // 년도 (예: 25, 2025) - 현재는 사용하지 않음
}

// 수업 시간 파싱 결과
export interface ParsedSchedule {
  dayOfWeek: number; // 0(월) ~ 6(일)
  startTime: string; // HH:MM 형식 (예: 18:00, 09:00)
  endTime: string; // HH:MM 형식 (예: 20:00, 11:00)
  type: 'class' | 'clinic'; // 수업 or 클리닉
}

export interface ParsedStudentData {
  className: string; // 원본 반명 (예: 국어-고3반 (금6-9) 25)
  classInfo: ParsedClassInfo; // 파싱된 반 정보
  name: string;
  schoolName: string;
  grade: number;
  phone: string;
  birthDate: string;
  gender: 'male' | 'female';
}

export interface StudentChange {
  field: string;
  oldValue: string | number | null;
  newValue: string | number;
}

export interface StudentComparison {
  id?: string;
  name: string;
  birthDate: string;
  changeType: 'new' | 'updated' | 'withdrawn';
  changes?: StudentChange[];
  newData?: ParsedStudentData;
}

// 반 정보 미리보기
export interface ClassPreview {
  subjectName: string;
  fullClassName: string;
  splitType: 'single' | 'split';
  courseType: 'regular' | 'test_prep';
  exists: boolean; // 이미 존재하는 반인지
}

// 수업 구성 정보 미리보기
export interface CompositionPreview {
  fullClassName: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  type: 'class' | 'clinic';
  exists: boolean; // 이미 존재하는 구성인지
}

// 수강 정보 미리보기
export interface EnrollmentPreview {
  studentName: string;
  fullClassName: string;
  schedules: {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    type: 'class' | 'clinic';
  }[];
  exists: boolean; // 기존 수강 정보인지 여부
}

export interface RenewalPreview {
  newStudents: StudentComparison[];
  updatedStudents: StudentComparison[];
  withdrawnStudents: StudentComparison[];
  totalChanges: number;

  // 단계별 정보
  classes: ClassPreview[]; // 생성/확인될 반 정보
  compositions: CompositionPreview[]; // 생성/확인될 수업 구성 정보
  enrollments: EnrollmentPreview[]; // 생성될 수강 정보
}

export interface RenewalResponse {
  success: boolean;
  preview?: RenewalPreview;
  backupId?: string;
  message: string;
  error?: string;
  appliedChanges?: {
    newStudents: number;
    updatedStudents: number;
    withdrawnStudents: number;
  };
}
