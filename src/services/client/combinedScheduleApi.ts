import { Tables } from "@/types/supabase";

// Combined schedule용 확장 타입
export interface StudentWithSchedules extends Tables<"students"> {
  school: Tables<"schools"> | null;
  student_schedules: Tables<"student_schedules">[];
  class_students: Array<{
    id: string;
    class_id: string;
    enrolled_date: string;
    status: string;
    class: {
      id: string;
      title: string;
      color: string;
      split_type: string | null;
      subject: {
        id: string;
        subject_name: string | null;
      } | null;
      teacher: {
        id: string;
        name: string;
      } | null;
    } | null;
    student_compositions: Array<{
      id: string;
      composition_id: string;
      enrolled_date: string;
      status: string;
      composition: Tables<"class_composition"> | null;
    }>;
  }>;
}

export interface ApiResponse<T> {
  data: T;
  error?: string;
}

export interface ApiError {
  error: string;
}

export class CombinedScheduleApi {
  private baseUrl = "/api/combined-schedule";

  async getStudentsWithSchedules(): Promise<StudentWithSchedules[]> {
    const response = await fetch(this.baseUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(error.error || "Failed to fetch combined schedule data");
    }

    const result: ApiResponse<StudentWithSchedules[]> = await response.json();
    return result.data;
  }
}

// 싱글톤 인스턴스
export const combinedScheduleApi = new CombinedScheduleApi();
