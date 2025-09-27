import { Tables, TablesInsert, TablesUpdate } from "@/types/supabase";

export interface TeacherClassWithStudents extends Tables<"classes"> {
  subject?: {
    id: string;
    subject_name: string;
  } | null;
  students: Array<{
    id: string;
    name: string;
    grade: number;
  }>;
  student_count: number;
}

export interface ApiResponse<T> {
  data: T;
  error?: string;
}

export interface ApiError {
  error: string;
}

export class TeacherApi {
  private baseUrl = "/api/teachers";

  async getTeachers(): Promise<Tables<"teachers">[]> {
    const response = await fetch(this.baseUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(error.error || "Failed to fetch teachers");
    }

    const result: ApiResponse<Tables<"teachers">[]> = await response.json();
    return result.data;
  }

  async getTeacherById(id: string): Promise<Tables<"teachers">> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(error.error || "Failed to fetch teacher");
    }

    const result: ApiResponse<Tables<"teachers">> = await response.json();
    return result.data;
  }

  async createTeacher(teacherData: TablesInsert<"teachers">): Promise<Tables<"teachers">> {
    const response = await fetch(this.baseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(teacherData),
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(error.error || "Failed to create teacher");
    }

    const result: ApiResponse<Tables<"teachers">> = await response.json();
    return result.data;
  }

  async updateTeacher(id: string, updateData: TablesUpdate<"teachers">): Promise<Tables<"teachers">> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updateData),
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(error.error || "Failed to update teacher");
    }

    const result: ApiResponse<Tables<"teachers">> = await response.json();
    return result.data;
  }

  async deleteTeacher(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(error.error || "Failed to delete teacher");
    }
  }

  async getTeachersBySubject(subject: string): Promise<Tables<"teachers">[]> {
    const params = new URLSearchParams({ subject });
    const response = await fetch(`${this.baseUrl}?${params}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(error.error || "Failed to fetch teachers by subject");
    }

    const result: ApiResponse<Tables<"teachers">[]> = await response.json();
    return result.data;
  }

  async getTeacherClasses(teacherId: string): Promise<TeacherClassWithStudents[]> {
    const response = await fetch(`${this.baseUrl}/${teacherId}/classes`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(error.error || "Failed to fetch teacher classes");
    }

    const result: ApiResponse<TeacherClassWithStudents[]> = await response.json();
    return result.data;
  }
}

// 싱글톤 인스턴스
export const teacherApi = new TeacherApi();