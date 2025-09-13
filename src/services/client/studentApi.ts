import { Tables, TablesInsert, TablesUpdate } from "@/types/supabase";

export interface ApiResponse<T> {
  data: T;
  error?: string;
}

export interface ApiError {
  error: string;
}

export class StudentApi {
  private baseUrl = "/api/students";

  async getStudents(): Promise<Tables<"students">[]> {
    const response = await fetch(this.baseUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(error.error || "Failed to fetch students");
    }

    const result: ApiResponse<Tables<"students">[]> = await response.json();
    return result.data;
  }

  async getStudentById(id: number): Promise<Tables<"students">> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(error.error || "Failed to fetch student");
    }

    const result: ApiResponse<Tables<"students">> = await response.json();
    return result.data;
  }

  async createStudent(studentData: TablesInsert<"students">): Promise<Tables<"students">> {
    const response = await fetch(this.baseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(studentData),
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(error.error || "Failed to create student");
    }

    const result: ApiResponse<Tables<"students">> = await response.json();
    return result.data;
  }

  async updateStudent(id: number, updateData: TablesUpdate<"students">): Promise<Tables<"students">> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updateData),
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(error.error || "Failed to update student");
    }

    const result: ApiResponse<Tables<"students">> = await response.json();
    return result.data;
  }

  async deleteStudent(id: number): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(error.error || "Failed to delete student");
    }
  }

  async searchStudents(searchTerm: string): Promise<Tables<"students">[]> {
    const params = new URLSearchParams({ search: searchTerm });
    const response = await fetch(`${this.baseUrl}/search?${params}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(error.error || "Failed to search students");
    }

    const result: ApiResponse<Tables<"students">[]> = await response.json();
    return result.data;
  }

  async getStudentsByGrade(grade: number): Promise<Tables<"students">[]> {
    const params = new URLSearchParams({ grade: grade.toString() });
    const response = await fetch(`${this.baseUrl}?${params}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(error.error || "Failed to fetch students by grade");
    }

    const result: ApiResponse<Tables<"students">[]> = await response.json();
    return result.data;
  }
}

// 싱글톤 인스턴스
export const studentApi = new StudentApi();