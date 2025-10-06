import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { classApi, CreateClassData } from "@/services/client/classApi";
import { TablesInsert, TablesUpdate } from "@/types/supabase";
import { toast } from "react-hot-toast";

// Query Keys
export const classKeys = {
  all: ["classes"] as const,
  lists: () => [...classKeys.all, "list"] as const,
  list: (filters?: Record<string, unknown>) => [...classKeys.lists(), { filters }] as const,
  details: () => [...classKeys.all, "detail"] as const,
  detail: (id: string) => [...classKeys.details(), id] as const,
  byTeacher: (teacherId: string) => [...classKeys.all, "byTeacher", teacherId] as const,
  bySubject: (subject: string) => [...classKeys.all, "bySubject", subject] as const,
  byDay: (dayOfWeek: number) => [...classKeys.all, "byDay", dayOfWeek] as const,
};

// Queries
export function useClasses() {
  return useQuery({
    queryKey: classKeys.lists(),
    queryFn: () => classApi.getClasses(),
    staleTime: 5 * 60 * 1000, // 5분
  });
}

export function useClass(id: string) {
  return useQuery({
    queryKey: classKeys.detail(id),
    queryFn: () => classApi.getClassById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

export function useClassesByTeacher(teacherId: string) {
  return useQuery({
    queryKey: classKeys.byTeacher(teacherId),
    queryFn: () => classApi.getClassesByTeacher(teacherId),
    enabled: !!teacherId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useClassesBySubject(subject: string) {
  return useQuery({
    queryKey: classKeys.bySubject(subject),
    queryFn: () => classApi.getClassesBySubject(subject),
    enabled: !!subject,
    staleTime: 5 * 60 * 1000,
  });
}

export function useClassesByDayOfWeek(dayOfWeek: number) {
  return useQuery({
    queryKey: classKeys.byDay(dayOfWeek),
    queryFn: () => classApi.getClassesByDayOfWeek(dayOfWeek),
    enabled: dayOfWeek >= 0 && dayOfWeek <= 6,
    staleTime: 5 * 60 * 1000,
  });
}

// Mutations
export function useCreateClass() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateClassData) => classApi.createClassWithStudents(data),
    onSuccess: (newClass) => {
      // 수업 목록 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: classKeys.lists() });

      // 강사별 쿼리 무효화
      if (newClass.teacher_id) {
        queryClient.invalidateQueries({
          queryKey: classKeys.byTeacher(newClass.teacher_id)
        });
      }

      // 모든 관련 쿼리 무효화 (시간 정보가 class_composition에 있으므로)
      queryClient.invalidateQueries({
        queryKey: classKeys.all
      });

      // 강사 수업 목록도 무효화 (TeacherClassManager에서 사용)
      queryClient.invalidateQueries({
        queryKey: ["teacher-classes"]
      });

      toast.success("수업이 성공적으로 등록되었습니다.");
    },
    onError: (error: Error) => {
      toast.error(error.message || "수업 등록 중 오류가 발생했습니다.");
    },
  });
}

// 기존 방식의 수업 생성 (하위 호환성)
export function useCreateClassLegacy() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: TablesInsert<"classes">) => classApi.createClass(data),
    onSuccess: () => {
      // 모든 수업 관련 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: classKeys.all });

      toast.success("수업이 성공적으로 등록되었습니다.");
    },
    onError: (error: Error) => {
      toast.error(error.message || "수업 등록 중 오류가 발생했습니다.");
    },
  });
}

export function useUpdateClass() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: TablesUpdate<"classes"> }) =>
      classApi.updateClass(id, data),
    onSuccess: (updatedClass, variables) => {
      // 해당 수업의 상세 정보 쿼리 업데이트
      queryClient.setQueryData(
        classKeys.detail(variables.id),
        updatedClass
      );

      // 관련 쿼리들 무효화
      queryClient.invalidateQueries({ queryKey: classKeys.lists() });
      
      // 강사, 과목, 요일별 쿼리 무효화 (변경될 수 있음)
      queryClient.invalidateQueries({ 
        queryKey: classKeys.all,
        predicate: (query) => 
          query.queryKey.includes("byTeacher") ||
          query.queryKey.includes("bySubject") ||
          query.queryKey.includes("byDay")
      });

      toast.success("수업 정보가 성공적으로 수정되었습니다.");
    },
    onError: (error: Error) => {
      toast.error(error.message || "수업 정보 수정 중 오류가 발생했습니다.");
    },
  });
}

export function useDeleteClass() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => classApi.deleteClass(id),
    onSuccess: (_, deletedId) => {
      // 해당 수업의 모든 쿼리 제거
      queryClient.removeQueries({ queryKey: classKeys.detail(deletedId) });

      // 수업 목록 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: classKeys.lists() });
      
      // 분류별 쿼리들 무효화
      queryClient.invalidateQueries({ 
        queryKey: classKeys.all,
        predicate: (query) => 
          query.queryKey.includes("byTeacher") ||
          query.queryKey.includes("bySubject") ||
          query.queryKey.includes("byDay")
      });

      toast.success("수업이 성공적으로 삭제되었습니다.");
    },
    onError: (error: Error) => {
      toast.error(error.message || "수업 삭제 중 오류가 발생했습니다.");
    },
  });
}

// 수업 시간표 관련 유틸리티 훅
// 참고: 시간 정보는 class_composition 테이블에서 관리되므로
// 주간 시간표를 조회하려면 class_composition을 함께 조회해야 합니다
export function useWeeklyClasses() {
  return useQuery({
    queryKey: [...classKeys.all, "weekly"],
    queryFn: async () => {
      const classes = await classApi.getClasses();

      // class_composition 정보를 포함하여 요일별로 그룹화
      const weeklySchedule: Record<number, typeof classes> = {};

      classes.forEach((classItem) => {
        // class_composition 배열이 있으면 각 composition의 요일별로 그룹화
        if (classItem.class_composition && Array.isArray(classItem.class_composition)) {
          classItem.class_composition.forEach((comp: { day_of_week: number; start_time: string }) => {
            const day = comp.day_of_week;
            if (!weeklySchedule[day]) {
              weeklySchedule[day] = [];
            }
            weeklySchedule[day].push(classItem);
          });
        }
      });

      // 각 요일의 수업을 시간 순으로 정렬 (class_composition의 start_time 기준)
      Object.keys(weeklySchedule).forEach((day) => {
        weeklySchedule[parseInt(day)].sort((a, b) => {
          const aTime = a.class_composition?.[0]?.start_time || '';
          const bTime = b.class_composition?.[0]?.start_time || '';
          return aTime.localeCompare(bTime);
        });
      });

      return weeklySchedule;
    },
    staleTime: 5 * 60 * 1000,
  });
}