import { Tables } from "@/types/supabase";

export type StudentScheduleRow = Tables<"student_schedules">;

export interface CreateStudentScheduleRequest {
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  day_of_week: number;
  type: string;
  color: string;
  location?: string;
  recurring?: boolean;
}

export interface UpdateStudentScheduleRequest extends Partial<CreateStudentScheduleRequest> {
  title: string;
  start_time: string;
  end_time: string;
  day_of_week: number;
}

// 특정 학생의 개인 일정 목록 조회
export async function getStudentSchedules(studentId: number): Promise<StudentScheduleRow[]> {
  const response = await fetch(`/api/students/${studentId}/schedules`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to fetch student schedules");
  }

  const result = await response.json();
  return result.data;
}

// 새로운 개인 일정 추가
export async function createStudentSchedule(
  studentId: number,
  scheduleData: CreateStudentScheduleRequest
): Promise<StudentScheduleRow> {
  const response = await fetch(`/api/students/${studentId}/schedules`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(scheduleData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to create student schedule");
  }

  const result = await response.json();
  return result.data;
}

// 개인 일정 수정
export async function updateStudentSchedule(
  studentId: number,
  scheduleId: string,
  scheduleData: UpdateStudentScheduleRequest
): Promise<StudentScheduleRow> {
  const response = await fetch(`/api/students/${studentId}/schedules/${scheduleId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(scheduleData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to update student schedule");
  }

  const result = await response.json();
  return result.data;
}

// 개인 일정 삭제
export async function deleteStudentSchedule(
  studentId: number,
  scheduleId: string
): Promise<StudentScheduleRow> {
  const response = await fetch(`/api/students/${studentId}/schedules/${scheduleId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to delete student schedule");
  }

  const result = await response.json();
  return result.data;
}