/**
 * 학교 메타 정보 React Query Hooks
 * @description class_school_meta 테이블 관련 React Query hooks
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getClassSchoolMeta,
  createClassSchoolMeta,
  updateClassSchoolMeta,
  deleteClassSchoolMeta,
  upsertClassSchoolMeta,
} from "@/services/client/classSchoolMetaApi";
import {
  ClassSchoolMeta,
  ClassSchoolMetaInsert,
  ClassSchoolMetaUpdate,
} from "@/types/middle-school";

/**
 * Query Key Factory
 */
export const classSchoolMetaKeys = {
  all: ["class-school-meta"] as const,
  byClass: (classId: string) =>
    [...classSchoolMetaKeys.all, classId] as const,
};

/**
 * 특정 수업의 학교 메타 정보 조회 Hook
 */
export function useClassSchoolMeta(classId: string) {
  return useQuery({
    queryKey: classSchoolMetaKeys.byClass(classId),
    queryFn: () => getClassSchoolMeta(classId),
    enabled: !!classId,
  });
}

/**
 * 학교 메타 정보 생성 Mutation Hook
 */
export function useCreateClassSchoolMeta() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (info: ClassSchoolMetaInsert) => createClassSchoolMeta(info),
    onSuccess: (data) => {
      // 해당 수업의 학교 메타 정보 캐시 갱신
      queryClient.invalidateQueries({
        queryKey: classSchoolMetaKeys.byClass(data.class_id),
      });
    },
  });
}

/**
 * 학교 메타 정보 업데이트 Mutation Hook
 */
export function useUpdateClassSchoolMeta() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      classId,
      updates,
    }: {
      classId: string;
      updates: ClassSchoolMetaUpdate;
    }) => updateClassSchoolMeta(classId, updates),
    onSuccess: (data) => {
      // 해당 수업의 학교 메타 정보 캐시 갱신
      queryClient.invalidateQueries({
        queryKey: classSchoolMetaKeys.byClass(data.class_id),
      });
    },
  });
}

/**
 * 학교 메타 정보 삭제 Mutation Hook
 */
export function useDeleteClassSchoolMeta() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (classId: string) => deleteClassSchoolMeta(classId),
    onSuccess: (_, classId) => {
      // 해당 수업의 학교 메타 정보 캐시 무효화
      queryClient.invalidateQueries({
        queryKey: classSchoolMetaKeys.byClass(classId),
      });
    },
  });
}

/**
 * 학교 메타 정보 Upsert Mutation Hook
 * @description 기존 데이터가 있으면 업데이트, 없으면 생성
 */
export function useUpsertClassSchoolMeta() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      classId,
      info,
    }: {
      classId: string;
      info: ClassSchoolMetaInsert | ClassSchoolMetaUpdate;
    }) => upsertClassSchoolMeta(classId, info),
    onSuccess: (data) => {
      // 해당 수업의 학교 메타 정보 캐시 갱신
      queryClient.invalidateQueries({
        queryKey: classSchoolMetaKeys.byClass(data.class_id),
      });
    },
  });
}
