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

export interface ParsedStudentData {
  className: string;
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

export interface RenewalPreview {
  newStudents: StudentComparison[];
  updatedStudents: StudentComparison[];
  withdrawnStudents: StudentComparison[];
  totalChanges: number;
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
