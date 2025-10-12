import { Tables, TablesInsert, TablesUpdate } from "@/types/supabase";

export interface ApiResponse<T> {
  data: T;
  error?: string;
}

export interface ApiError {
  error: string;
}

interface ClassWithTeacher extends Tables<"classes"> {
  teacher?: {
    id: string;
    name: string;
  } | null;
  subject?: Tables<"subjects"> | null;
  class_composition?: Tables<"class_composition">[];
}

// 수업 생성을 위한 새로운 인터페이스
export interface CreateClassData {
  title: string;
  subjectId: string;
  description?: string;
  dayOfWeek?: number; // 선택사항으로 변경
  startTime?: string; // 선택사항으로 변경
  endTime?: string; // 선택사항으로 변경
  teacherId: string;
  room?: string;
  maxStudents?: number;
  studentIds: string[];
  courseType?: "regular" | "school_exam"; // 수업 유형
  splitType?: "single" | "split"; // 수업 구성 타입
}

export class ClassApi {
  private baseUrl = "/api/classes";

  async getClasses(): Promise<ClassWithTeacher[]> {
    const response = await fetch(this.baseUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(error.error || "Failed to fetch classes");
    }

    const result: ApiResponse<ClassWithTeacher[]> = await response.json();
    return result.data;
  }

  async getClassById(id: string): Promise<ClassWithTeacher> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(error.error || "Failed to fetch class");
    }

    const result: ApiResponse<ClassWithTeacher> = await response.json();
    return result.data;
  }

  async createClass(classData: TablesInsert<"classes">): Promise<ClassWithTeacher> {
    const response = await fetch(this.baseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(classData),
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(error.error || "Failed to create class");
    }

    const result: ApiResponse<ClassWithTeacher> = await response.json();
    return result.data;
  }

  // 새로운 수업 생성 메서드 (학생 등록 포함)
  async createClassWithStudents(classData: CreateClassData): Promise<ClassWithTeacher> {
    const response = await fetch(this.baseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(classData),
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(error.error || "Failed to create class");
    }

    const result: ApiResponse<ClassWithTeacher> = await response.json();
    return result.data;
  }

  async updateClass(id: string, updateData: TablesUpdate<"classes">): Promise<ClassWithTeacher> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updateData),
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(error.error || "Failed to update class");
    }

    const result: ApiResponse<ClassWithTeacher> = await response.json();
    return result.data;
  }

  async deleteClass(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(error.error || "Failed to delete class");
    }
  }

  async getClassesByTeacher(teacherId: string): Promise<ClassWithTeacher[]> {
    const params = new URLSearchParams({ teacher_id: teacherId });
    const response = await fetch(`${this.baseUrl}?${params}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(error.error || "Failed to fetch classes by teacher");
    }

    const result: ApiResponse<ClassWithTeacher[]> = await response.json();
    return result.data;
  }

  async getClassesBySubject(subject: string): Promise<ClassWithTeacher[]> {
    const params = new URLSearchParams({ subject });
    const response = await fetch(`${this.baseUrl}?${params}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(error.error || "Failed to fetch classes by subject");
    }

    const result: ApiResponse<ClassWithTeacher[]> = await response.json();
    return result.data;
  }

  async getClassesByDayOfWeek(dayOfWeek: number): Promise<ClassWithTeacher[]> {
    const params = new URLSearchParams({ day_of_week: dayOfWeek.toString() });
    const response = await fetch(`${this.baseUrl}?${params}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(error.error || "Failed to fetch classes by day");
    }

    const result: ApiResponse<ClassWithTeacher[]> = await response.json();
    return result.data;
  }
}

// 싱글톤 인스턴스
export const classApi = new ClassApi();