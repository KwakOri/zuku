import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Tables, TablesInsert } from "@/types/supabase";
import { toast } from "react-hot-toast";

type ClassStudentRow = Tables<"class_students">;

// Query Keys
export const classStudentKeys = {
  all: ["class-students"] as const,
  lists: () => [...classStudentKeys.all, "list"] as const,
  list: (filters?: Record<string, unknown>) => [...classStudentKeys.lists(), { filters }] as const,
  byClass: (classId: string) => [...classStudentKeys.all, "byClass", classId] as const,
  byStudent: (studentId: string) => [...classStudentKeys.all, "byStudent", studentId] as const,
};

// 수업-학생 관계 조회 API 함수들
const classStudentApi = {
  // 모든 수업-학생 관계 조회
  getClassStudents: async (filters?: { class_id?: string; student_id?: string }): Promise<ClassStudentRow[]> => {
    const params = new URLSearchParams();
    if (filters?.class_id) params.append('class_id', filters.class_id);
    if (filters?.student_id) params.append('student_id', filters.student_id);

    const response = await fetch(`/api/class-students?${params.toString()}`);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch class students');
    }
    const result = await response.json();
    return result.data;
  },

  // 특정 수업의 학생들 조회
  getStudentsByClass: async (classId: string): Promise<ClassStudentRow[]> => {
    const response = await fetch(`/api/class-students?class_id=${classId}`);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch students by class');
    }
    const result = await response.json();
    return result.data;
  },

  // 특정 학생의 수업들 조회
  getClassesByStudent: async (studentId: string): Promise<ClassStudentRow[]> => {
    const response = await fetch(`/api/class-students?student_id=${studentId}`);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch classes by student');
    }
    const result = await response.json();
    return result.data;
  },

  // 수업에 학생 등록
  enrollStudent: async (data: TablesInsert<"class_students">): Promise<ClassStudentRow> => {
    const response = await fetch('/api/class-students', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to enroll student');
    }
    const result = await response.json();
    return result.data;
  },

  // 수업에서 학생 제거 (상태를 inactive로 변경)
  unenrollStudent: async (id: string): Promise<ClassStudentRow> => {
    const response = await fetch(`/api/class-students/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status: 'inactive' }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to unenroll student');
    }
    const result = await response.json();
    return result.data;
  },
};

// Queries
export function useClassStudents(filters?: { class_id?: string; student_id?: string }) {
  return useQuery({
    queryKey: classStudentKeys.list(filters),
    queryFn: () => classStudentApi.getClassStudents(filters),
    staleTime: 5 * 60 * 1000, // 5분
  });
}

export function useStudentsByClass(classId: string) {
  return useQuery({
    queryKey: classStudentKeys.byClass(classId),
    queryFn: () => classStudentApi.getStudentsByClass(classId),
    enabled: !!classId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useClassesByStudent(studentId: string) {
  return useQuery({
    queryKey: classStudentKeys.byStudent(studentId),
    queryFn: () => classStudentApi.getClassesByStudent(studentId),
    enabled: !!studentId,
    staleTime: 5 * 60 * 1000,
  });
}

// Mutations
export function useEnrollStudent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: TablesInsert<"class_students">) => classStudentApi.enrollStudent(data),
    onSuccess: (newEnrollment) => {
      // 관련 쿼리들 무효화
      queryClient.invalidateQueries({ queryKey: classStudentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: classStudentKeys.byClass(newEnrollment.class_id) });
      queryClient.invalidateQueries({ queryKey: classStudentKeys.byStudent(newEnrollment.student_id) });

      toast.success("학생이 수업에 성공적으로 등록되었습니다.");
    },
    onError: (error: Error) => {
      toast.error(error.message || "학생 등록 중 오류가 발생했습니다.");
    },
  });
}

export function useUnenrollStudent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => classStudentApi.unenrollStudent(id),
    onSuccess: (updatedEnrollment) => {
      // 관련 쿼리들 무효화
      queryClient.invalidateQueries({ queryKey: classStudentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: classStudentKeys.byClass(updatedEnrollment.class_id) });
      queryClient.invalidateQueries({ queryKey: classStudentKeys.byStudent(updatedEnrollment.student_id) });

      toast.success("학생이 수업에서 성공적으로 제거되었습니다.");
    },
    onError: (error: Error) => {
      toast.error(error.message || "학생 제거 중 오류가 발생했습니다.");
    },
  });
}

export default {
  classStudentApi,
  classStudentKeys,
};