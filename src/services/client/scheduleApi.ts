import { Tables, TablesInsert, TablesUpdate } from "@/types/supabase";

export interface ApiResponse<T> {
  data: T;
  error?: string;
}

export interface ApiError {
  error: string;
}

interface StudentScheduleWithStudent extends Tables<"student_schedules"> {
  student?: {
    id: number;
    name: string;
    grade: number;
  } | null;
}

interface ClassStudentWithDetails extends Tables<"class_students"> {
  student?: {
    id: number;
    name: string;
    grade: number;
    phone: string | null;
    parent_phone: string | null;
    email: string | null;
  } | null;
  class?: {
    id: string;
    title: string;
    subject: string;
    teacher_name: string;
    start_time: string;
    end_time: string;
    day_of_week: number;
  } | null;
}

export class ScheduleApi {
  private studentSchedulesUrl = "/api/student-schedules";
  private classStudentsUrl = "/api/class-students";

  // 학생 개인 일정 API
  async getStudentSchedules(studentId?: number): Promise<StudentScheduleWithStudent[]> {
    const params = new URLSearchParams();
    if (studentId) {
      params.set("student_id", studentId.toString());
    }

    const url = params.toString() ? `${this.studentSchedulesUrl}?${params}` : this.studentSchedulesUrl;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(error.error || "Failed to fetch student schedules");
    }

    const result: ApiResponse<StudentScheduleWithStudent[]> = await response.json();
    return result.data;
  }

  async getStudentScheduleById(id: string): Promise<StudentScheduleWithStudent> {
    const response = await fetch(`${this.studentSchedulesUrl}/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(error.error || "Failed to fetch student schedule");
    }

    const result: ApiResponse<StudentScheduleWithStudent> = await response.json();
    return result.data;
  }

  async createStudentSchedule(scheduleData: TablesInsert<"student_schedules">): Promise<StudentScheduleWithStudent> {
    const response = await fetch(this.studentSchedulesUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(scheduleData),
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(error.error || "Failed to create student schedule");
    }

    const result: ApiResponse<StudentScheduleWithStudent> = await response.json();
    return result.data;
  }

  async updateStudentSchedule(id: string, updateData: TablesUpdate<"student_schedules">): Promise<StudentScheduleWithStudent> {
    const response = await fetch(`${this.studentSchedulesUrl}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updateData),
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(error.error || "Failed to update student schedule");
    }

    const result: ApiResponse<StudentScheduleWithStudent> = await response.json();
    return result.data;
  }

  async deleteStudentSchedule(id: string): Promise<void> {
    const response = await fetch(`${this.studentSchedulesUrl}/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(error.error || "Failed to delete student schedule");
    }
  }

  // 수업-학생 관계 API
  async getClassStudents(classId?: string, studentId?: number): Promise<ClassStudentWithDetails[]> {
    const params = new URLSearchParams();
    if (classId) {
      params.set("class_id", classId);
    }
    if (studentId) {
      params.set("student_id", studentId.toString());
    }

    const url = params.toString() ? `${this.classStudentsUrl}?${params}` : this.classStudentsUrl;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(error.error || "Failed to fetch class students");
    }

    const result: ApiResponse<ClassStudentWithDetails[]> = await response.json();
    return result.data;
  }

  async enrollStudentInClass(enrollmentData: TablesInsert<"class_students">): Promise<ClassStudentWithDetails> {
    const response = await fetch(this.classStudentsUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(enrollmentData),
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(error.error || "Failed to enroll student in class");
    }

    const result: ApiResponse<ClassStudentWithDetails> = await response.json();
    return result.data;
  }

  async unenrollStudentFromClass(classId: string, studentId: number): Promise<void> {
    const response = await fetch(`${this.classStudentsUrl}/${classId}/${studentId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(error.error || "Failed to unenroll student from class");
    }
  }

  // 종합 스케줄 조회
  async getStudentCompleteSchedule(studentId: number) {
    const [classSchedules, personalSchedules] = await Promise.all([
      this.getClassStudents(undefined, studentId),
      this.getStudentSchedules(studentId),
    ]);

    return {
      classSchedules,
      personalSchedules,
    };
  }

  // 시간표 밀집도 분석을 위한 데이터 조회
  async getScheduleDensityData() {
    const [studentSchedules, classStudents] = await Promise.all([
      this.getStudentSchedules(),
      this.getClassStudents(),
    ]);

    return {
      studentSchedules,
      classStudents,
    };
  }
}

// 싱글톤 인스턴스
export const scheduleApi = new ScheduleApi();