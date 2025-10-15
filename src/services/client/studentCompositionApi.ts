import { Tables, TablesInsert } from "@/types/supabase";

type CompositionStudentRow = Tables<"compositions_students">;

export const studentCompositionApi = {
  // 모든 compositions_students 조회
  getStudentCompositions: async (filters?: {
    class_id?: string;
    composition_id?: string;
    student_id?: string;
  }): Promise<CompositionStudentRow[]> => {
    const params = new URLSearchParams();
    if (filters?.class_id) params.append("class_id", filters.class_id);
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

  // 특정 수업의 compositions 조회
  getCompositionsByClass: async (classId: string): Promise<CompositionStudentRow[]> => {
    const response = await fetch(`/api/student-compositions?class_id=${classId}`);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to fetch compositions by class");
    }
    const result = await response.json();
    return result.data;
  },

  // 특정 학생의 모든 compositions 조회
  getCompositionsByStudent: async (studentId: string): Promise<CompositionStudentRow[]> => {
    const response = await fetch(`/api/student-compositions?student_id=${studentId}`);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to fetch compositions by student");
    }
    const result = await response.json();
    return result.data;
  },

  // composition에 학생 등록
  enrollComposition: async (data: TablesInsert<"compositions_students">): Promise<CompositionStudentRow> => {
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
  unenrollComposition: async (id: string): Promise<CompositionStudentRow> => {
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
