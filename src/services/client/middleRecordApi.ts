import { Tables, TablesInsert, TablesUpdate } from "@/types/supabase";

export interface ApiResponse<T> {
  data: T;
  error?: string;
}

export interface ApiError {
  error: string;
}

interface HomeworkRecordMiddleWithDetails extends Tables<"homework_records_middle"> {
  student?: {
    id: string;
    name: string;
    grade: number;
    phone: string | null;
    parent_phone: string | null;
    email: string | null;
  } | null;
  class?: {
    id: string;
    title: string;
    subject?: {
      id: string;
      subject_name: string;
    } | null;
  } | null;
}

export class MiddleRecordApi {
  private baseUrl = "/api/middle-records";

  // 중등 기록 목록 조회
  async getMiddleRecords(params?: {
    classId?: string;
    studentId?: string;
    weekOf?: string;
  }): Promise<HomeworkRecordMiddleWithDetails[]> {
    const searchParams = new URLSearchParams();

    if (params?.classId) {
      searchParams.set("class_id", params.classId);
    }
    if (params?.studentId) {
      searchParams.set("student_id", params.studentId);
    }
    if (params?.weekOf) {
      searchParams.set("week_of", params.weekOf);
    }

    const url = searchParams.toString() ? `${this.baseUrl}?${searchParams}` : this.baseUrl;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(error.error || "Failed to fetch middle school records");
    }

    const result: ApiResponse<HomeworkRecordMiddleWithDetails[]> = await response.json();
    return result.data;
  }

  // 특정 중등 기록 조회
  async getMiddleRecordById(id: string): Promise<HomeworkRecordMiddleWithDetails> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(error.error || "Failed to fetch middle school record");
    }

    const result: ApiResponse<HomeworkRecordMiddleWithDetails> = await response.json();
    return result.data;
  }

  // 새 중등 기록 생성
  async createMiddleRecord(recordData: TablesInsert<"homework_records_middle">): Promise<HomeworkRecordMiddleWithDetails> {
    const response = await fetch(this.baseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(recordData),
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(error.error || "Failed to create middle school record");
    }

    const result: ApiResponse<HomeworkRecordMiddleWithDetails> = await response.json();
    return result.data;
  }

  // 중등 기록 수정
  async updateMiddleRecord(id: string, updateData: TablesUpdate<"homework_records_middle">): Promise<HomeworkRecordMiddleWithDetails> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updateData),
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(error.error || "Failed to update middle school record");
    }

    const result: ApiResponse<HomeworkRecordMiddleWithDetails> = await response.json();
    return result.data;
  }

  // 중등 기록 삭제
  async deleteMiddleRecord(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(error.error || "Failed to delete middle school record");
    }
  }

  // 특정 주차의 기록들 조회 (편의 메서드)
  async getWeeklyRecords(classId: string, weekOf: string): Promise<HomeworkRecordMiddleWithDetails[]> {
    return this.getMiddleRecords({ classId, weekOf });
  }

  // 특정 학생의 기록들 조회 (편의 메서드)
  async getStudentRecords(studentId: string, classId?: string): Promise<HomeworkRecordMiddleWithDetails[]> {
    return this.getMiddleRecords({ studentId, classId });
  }

  // 미입력 학생 목록 조회
  async getPendingStudents(params: {
    teacherId: string;
    weekOf?: string;
  }): Promise<{
    data: Array<{
      id: string;
      class_id: string;
      student_id: string;
      student?: {
        id: string;
        name: string;
        grade: number;
        phone: string | null;
        parent_phone: string | null;
        email: string | null;
      } | null;
      class?: {
        id: string;
        title: string;
        subject?: {
          id: string;
          subject_name: string;
        } | null;
      } | null;
    }>;
    meta: {
      weekOf: string;
      totalStudents: number;
      recordedStudents: number;
      pendingStudents: number;
    };
  }> {
    const searchParams = new URLSearchParams();
    searchParams.set("teacher_id", params.teacherId);

    if (params.weekOf) {
      searchParams.set("week_of", params.weekOf);
    }

    const url = `${this.baseUrl}/pending?${searchParams}`;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(error.error || "Failed to fetch pending students");
    }

    return response.json();
  }

}

// 싱글톤 인스턴스
export const middleRecordApi = new MiddleRecordApi();