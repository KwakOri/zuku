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

// 수업별 통합 스케줄 타입
export interface ClassWithSchedules extends Tables<"classes"> {
  subject: Tables<"subjects"> | null;
  teacher: {
    id: string;
    name: string;
  } | null;
  class_composition: Tables<"class_composition">[];
}

// 선생님별 통합 스케줄 타입
export interface TeacherWithSchedules extends Tables<"teachers"> {
  classes: Array<{
    id: string;
    title: string;
    color: string;
    subject: {
      id: string;
      subject_name: string | null;
    } | null;
    class_composition: Tables<"class_composition">[];
  }>;
}

// 강의실별 통합 스케줄 타입
export interface ClassroomScheduleClass extends Tables<"classes"> {
  subject: Tables<"subjects"> | null;
  teacher: {
    id: string;
    name: string;
  } | null;
  class_composition: Tables<"class_composition">[];
  class_students: Array<{
    id: string;
    student: {
      id: string;
      name: string;
      grade: number | null;
    } | null;
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

  async getClassesWithSchedules(): Promise<ClassWithSchedules[]> {
    const response = await fetch(`${this.baseUrl}/classes`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(error.error || "Failed to fetch class schedule data");
    }

    const result: ApiResponse<ClassWithSchedules[]> = await response.json();
    return result.data;
  }

  async getTeachersWithSchedules(): Promise<TeacherWithSchedules[]> {
    const response = await fetch(`${this.baseUrl}/teachers`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(error.error || "Failed to fetch teacher schedule data");
    }

    const result: ApiResponse<TeacherWithSchedules[]> = await response.json();
    return result.data;
  }

  async getClassroomSchedule(): Promise<ClassroomScheduleClass[]> {
    const response = await fetch("/api/classroom-schedule", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(
        error.error || "Failed to fetch classroom schedule data"
      );
    }

    const result: ApiResponse<ClassroomScheduleClass[]> =
      await response.json();
    return result.data;
  }
}

// 싱글톤 인스턴스
export const combinedScheduleApi = new CombinedScheduleApi();
