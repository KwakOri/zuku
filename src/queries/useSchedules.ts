import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { scheduleApi } from "@/services/client/scheduleApi";
import { TablesInsert, TablesUpdate } from "@/types/supabase";
import { toast } from "react-hot-toast";

// Query Keys
export const scheduleKeys = {
  // 학생 개인 일정
  studentSchedules: ["studentSchedules"] as const,
  studentSchedulesList: () => [...scheduleKeys.studentSchedules, "list"] as const,
  studentSchedulesByStudent: (studentId: number) => 
    [...scheduleKeys.studentSchedules, "byStudent", studentId] as const,
  studentScheduleDetail: (id: string) => 
    [...scheduleKeys.studentSchedules, "detail", id] as const,
  
  // 수업-학생 관계
  classStudents: ["classStudents"] as const,
  classStudentsList: () => [...scheduleKeys.classStudents, "list"] as const,
  classStudentsByClass: (classId: string) => 
    [...scheduleKeys.classStudents, "byClass", classId] as const,
  classStudentsByStudent: (studentId: number) => 
    [...scheduleKeys.classStudents, "byStudent", studentId] as const,
  
  // 종합 스케줄
  completeSchedule: (studentId: number) => 
    ["completeSchedule", studentId] as const,
  densityData: ["densityData"] as const,
};

// 학생 개인 일정 Queries
export function useStudentSchedules(studentId?: number) {
  return useQuery({
    queryKey: studentId 
      ? scheduleKeys.studentSchedulesByStudent(studentId)
      : scheduleKeys.studentSchedulesList(),
    queryFn: () => scheduleApi.getStudentSchedules(studentId),
    staleTime: 3 * 60 * 1000, // 3분
  });
}

export function useStudentSchedule(id: string) {
  return useQuery({
    queryKey: scheduleKeys.studentScheduleDetail(id),
    queryFn: () => scheduleApi.getStudentScheduleById(id),
    enabled: !!id,
    staleTime: 3 * 60 * 1000,
  });
}

// 수업-학생 관계 Queries
export function useClassStudents(classId?: string, studentId?: number) {
  const queryKey = classId 
    ? scheduleKeys.classStudentsByClass(classId)
    : studentId 
      ? scheduleKeys.classStudentsByStudent(studentId)
      : scheduleKeys.classStudentsList();

  return useQuery({
    queryKey,
    queryFn: () => scheduleApi.getClassStudents(classId, studentId),
    staleTime: 3 * 60 * 1000,
  });
}

// 종합 스케줄 Queries
export function useStudentCompleteSchedule(studentId: number) {
  return useQuery({
    queryKey: scheduleKeys.completeSchedule(studentId),
    queryFn: () => scheduleApi.getStudentCompleteSchedule(studentId),
    enabled: !!studentId,
    staleTime: 3 * 60 * 1000,
  });
}

export function useScheduleDensityData() {
  return useQuery({
    queryKey: scheduleKeys.densityData,
    queryFn: () => scheduleApi.getScheduleDensityData(),
    staleTime: 5 * 60 * 1000,
  });
}

// 학생 개인 일정 Mutations
export function useCreateStudentSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: TablesInsert<"student_schedules">) => 
      scheduleApi.createStudentSchedule(data),
    onSuccess: (newSchedule) => {
      // 관련 쿼리들 무효화
      queryClient.invalidateQueries({ 
        queryKey: scheduleKeys.studentSchedulesList() 
      });
      
      queryClient.invalidateQueries({ 
        queryKey: scheduleKeys.studentSchedulesByStudent(newSchedule.student_id) 
      });

      queryClient.invalidateQueries({ 
        queryKey: scheduleKeys.completeSchedule(newSchedule.student_id) 
      });

      queryClient.invalidateQueries({ 
        queryKey: scheduleKeys.densityData 
      });

      toast.success("일정이 성공적으로 등록되었습니다.");
    },
    onError: (error: Error) => {
      toast.error(error.message || "일정 등록 중 오류가 발생했습니다.");
    },
  });
}

export function useUpdateStudentSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: TablesUpdate<"student_schedules"> }) =>
      scheduleApi.updateStudentSchedule(id, data),
    onSuccess: (updatedSchedule, variables) => {
      // 상세 정보 쿼리 업데이트
      queryClient.setQueryData(
        scheduleKeys.studentScheduleDetail(variables.id),
        updatedSchedule
      );

      // 관련 쿼리들 무효화
      queryClient.invalidateQueries({ 
        queryKey: scheduleKeys.studentSchedulesList() 
      });
      
      queryClient.invalidateQueries({ 
        queryKey: scheduleKeys.studentSchedulesByStudent(updatedSchedule.student_id) 
      });

      queryClient.invalidateQueries({ 
        queryKey: scheduleKeys.completeSchedule(updatedSchedule.student_id) 
      });

      queryClient.invalidateQueries({ 
        queryKey: scheduleKeys.densityData 
      });

      toast.success("일정이 성공적으로 수정되었습니다.");
    },
    onError: (error: Error) => {
      toast.error(error.message || "일정 수정 중 오류가 발생했습니다.");
    },
  });
}

export function useDeleteStudentSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => scheduleApi.deleteStudentSchedule(id),
    onSuccess: (_, deletedId) => {
      // 상세 쿼리 제거
      queryClient.removeQueries({ 
        queryKey: scheduleKeys.studentScheduleDetail(deletedId) 
      });

      // 관련 쿼리들 무효화
      queryClient.invalidateQueries({ 
        queryKey: scheduleKeys.studentSchedules 
      });

      queryClient.invalidateQueries({ 
        queryKey: scheduleKeys.densityData 
      });

      toast.success("일정이 성공적으로 삭제되었습니다.");
    },
    onError: (error: Error) => {
      toast.error(error.message || "일정 삭제 중 오류가 발생했습니다.");
    },
  });
}

// 수업-학생 관계 Mutations
export function useEnrollStudentInClass() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: TablesInsert<"class_students">) => 
      scheduleApi.enrollStudentInClass(data),
    onSuccess: (enrollment) => {
      // 관련 쿼리들 무효화
      queryClient.invalidateQueries({ 
        queryKey: scheduleKeys.classStudentsList() 
      });
      
      queryClient.invalidateQueries({ 
        queryKey: scheduleKeys.classStudentsByClass(enrollment.class_id) 
      });

      queryClient.invalidateQueries({ 
        queryKey: scheduleKeys.classStudentsByStudent(enrollment.student_id) 
      });

      queryClient.invalidateQueries({ 
        queryKey: scheduleKeys.completeSchedule(enrollment.student_id) 
      });

      toast.success("학생이 수업에 성공적으로 등록되었습니다.");
    },
    onError: (error: Error) => {
      toast.error(error.message || "수업 등록 중 오류가 발생했습니다.");
    },
  });
}

export function useUnenrollStudentFromClass() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ classId, studentId }: { classId: string; studentId: number }) =>
      scheduleApi.unenrollStudentFromClass(classId, studentId),
    onSuccess: (_, variables) => {
      // 관련 쿼리들 무효화
      queryClient.invalidateQueries({ 
        queryKey: scheduleKeys.classStudentsList() 
      });
      
      queryClient.invalidateQueries({ 
        queryKey: scheduleKeys.classStudentsByClass(variables.classId) 
      });

      queryClient.invalidateQueries({ 
        queryKey: scheduleKeys.classStudentsByStudent(variables.studentId) 
      });

      queryClient.invalidateQueries({ 
        queryKey: scheduleKeys.completeSchedule(variables.studentId) 
      });

      toast.success("학생이 수업에서 성공적으로 제외되었습니다.");
    },
    onError: (error: Error) => {
      toast.error(error.message || "수업 제외 중 오류가 발생했습니다.");
    },
  });
}

// 유틸리티 훅들
export function useStudentWeeklySchedule(studentId: number) {
  return useQuery({
    queryKey: [...scheduleKeys.completeSchedule(studentId), "weekly"],
    queryFn: async () => {
      const { classSchedules, personalSchedules } = 
        await scheduleApi.getStudentCompleteSchedule(studentId);

      // 요일별로 그룹화하여 주간 스케줄 생성
      const weeklySchedule: Record<number, {
        classSchedules: typeof classSchedules;
        personalSchedules: typeof personalSchedules;
      }> = {};

      // 0-6 (일-토) 초기화
      for (let i = 0; i <= 6; i++) {
        weeklySchedule[i] = {
          classSchedules: [],
          personalSchedules: []
        };
      }

      // 수업 일정 분류
      classSchedules.forEach((cs) => {
        if (cs.class) {
          weeklySchedule[cs.class.day_of_week].classSchedules.push(cs);
        }
      });

      // 개인 일정 분류
      personalSchedules.forEach((ps) => {
        weeklySchedule[ps.day_of_week].personalSchedules.push(ps);
      });

      // 각 요일의 일정들을 시간 순으로 정렬
      Object.values(weeklySchedule).forEach((daySchedule) => {
        daySchedule.classSchedules.sort((a, b) => 
          (a.class?.start_time || "").localeCompare(b.class?.start_time || "")
        );
        daySchedule.personalSchedules.sort((a, b) => 
          a.start_time.localeCompare(b.start_time)
        );
      });

      return weeklySchedule;
    },
    enabled: !!studentId,
    staleTime: 3 * 60 * 1000,
  });
}