/**
 * 학교 메타 정보 Client API
 * @description class_school_meta 테이블 관련 클라이언트 API 함수
 */

import {
  ClassSchoolMeta,
  ClassSchoolMetaInsert,
  ClassSchoolMetaUpdate,
} from "@/types/middle-school";

/**
 * 특정 수업의 학교 메타 정보 조회
 */
export async function getClassSchoolMeta(
  classId: string
): Promise<ClassSchoolMeta | null> {
  const response = await fetch(
    `/api/class-school-meta?class_id=${classId}`
  );
  if (!response.ok) {
    throw new Error("Failed to fetch class school meta");
  }
  const { data } = await response.json();
  return data;
}

/**
 * 학교 메타 정보 생성
 */
export async function createClassSchoolMeta(
  info: ClassSchoolMetaInsert
): Promise<ClassSchoolMeta> {
  const response = await fetch("/api/class-school-meta", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(info),
  });

  if (!response.ok) {
    throw new Error("Failed to create class school meta");
  }

  const { data } = await response.json();
  return data;
}

/**
 * 학교 메타 정보 업데이트
 */
export async function updateClassSchoolMeta(
  classId: string,
  updates: ClassSchoolMetaUpdate
): Promise<ClassSchoolMeta> {
  const response = await fetch(
    `/api/class-school-meta?class_id=${classId}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to update class school meta");
  }

  const { data } = await response.json();
  return data;
}

/**
 * 학교 메타 정보 삭제
 */
export async function deleteClassSchoolMeta(
  classId: string
): Promise<boolean> {
  const response = await fetch(
    `/api/class-school-meta?class_id=${classId}`,
    {
      method: "DELETE",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to delete class school meta");
  }

  return true;
}

/**
 * 학교 메타 정보 생성 또는 업데이트 (Upsert)
 */
export async function upsertClassSchoolMeta(
  classId: string,
  info: ClassSchoolMetaInsert | ClassSchoolMetaUpdate
): Promise<ClassSchoolMeta> {
  // 기존 데이터 확인
  const existing = await getClassSchoolMeta(classId);

  if (existing) {
    // 업데이트
    return updateClassSchoolMeta(classId, info);
  } else {
    // 생성
    return createClassSchoolMeta({ ...info, class_id: classId });
  }
}
