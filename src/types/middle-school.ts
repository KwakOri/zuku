/**
 * 중등(내신) 정보 타입 정의
 * @description classes 테이블에서 분리된 내신 전용 정보
 */

import { Tables } from "./supabase";

/**
 * class_school_meta 테이블 Row 타입 (Supabase 자동 생성 타입 사용)
 */
export type ClassSchoolMeta = Tables<"class_school_meta">;

/**
 * class_school_meta 생성용 타입
 */
export interface ClassSchoolMetaInsert {
  id?: string;
  class_id: string;
  school_tags?: string[] | null;
  created_at?: string | null;
  updated_at?: string | null;
}

/**
 * class_school_meta 업데이트용 타입
 */
export interface ClassSchoolMetaUpdate {
  class_id?: string;
  school_tags?: string[] | null;
  updated_at?: string | null;
}

/**
 * 수업 정보 + 학교 메타 정보 통합 타입
 * @description classes와 class_school_meta JOIN 결과
 */
export interface ClassWithSchoolMeta {
  // classes 테이블 정보
  id: string;
  title: string;
  course_type: string;
  subject_id: string | null;
  teacher_id: string | null;
  room: string | null;
  color: string;
  description: string | null;
  rrule: string | null;
  split_type: string | null;
  created_at: string | null;
  updated_at: string | null;

  // class_school_meta 테이블 정보 (optional)
  school_meta?: ClassSchoolMeta | null;
}
