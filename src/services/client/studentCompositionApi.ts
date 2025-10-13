import { Tables, TablesInsert } from "@/types/supabase";

type StudentCompositionRow = Tables<"student_compositions">;

export const studentCompositionApi = {
  // 모든 student_compositions 조회
  getStudentCompositions: async (filters?: {
    class_student_id?: string;
    composition_id?: string;
    student_id?: string;
  }): Promise<StudentCompositionRow[]> => {
    const params = new URLSearchParams();
    if (filters?.class_student_id) params.append("class_student_id", filters.class_student_id);
    if (filters?.composition_id) params.append("composition_id", filters.composition_id);
    if (filters?.student_id) params.append("student_id", filters.student_id);

    const response = await fetch(`/api/student-compositions?${params.toString()}`);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to fetch student compositions");
    }
    const result = await response.json();
    return result.data;
  },

  // 특정 class_student의 compositions 조회
  getCompositionsByClassStudent: async (classStudentId: string): Promise<StudentCompositionRow[]> => {
    const response = await fetch(`/api/student-compositions?class_student_id=${classStudentId}`);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to fetch compositions by class student");
    }
    const result = await response.json();
    return result.data;
  },

  // 특정 학생의 모든 compositions 조회
  getCompositionsByStudent: async (studentId: string): Promise<StudentCompositionRow[]> => {
    const response = await fetch(`/api/student-compositions?student_id=${studentId}`);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to fetch compositions by student");
    }
    const result = await response.json();
    return result.data;
  },

  // composition에 학생 등록
  enrollComposition: async (data: TablesInsert<"student_compositions">): Promise<StudentCompositionRow> => {
    const response = await fetch("/api/student-compositions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to enroll student in composition");
    }
    const result = await response.json();
    return result.data;
  },

  // composition에서 학생 제거 (status를 inactive로 변경)
  unenrollComposition: async (id: string): Promise<StudentCompositionRow> => {
    const response = await fetch(`/api/student-compositions?id=${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to unenroll student from composition");
    }
    const result = await response.json();
    return result.data;
  },
};
