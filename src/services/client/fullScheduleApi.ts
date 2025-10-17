import { Tables } from "@/types/supabase";

// Personal schedule from student_schedules table
type PersonalSchedule = Tables<"student_schedules">;

// Class schedule formatted for display
interface ClassSchedule {
  id: string;
  student_id: string;
  title: string;
  description: string | null;
  start_time: string;
  end_time: string;
  day_of_week: number;
  type: string; // "class" for class schedules
  color: string;
  location: string | null;
  recurring: boolean;
  status: string;
  created_date: string;
  // Additional info
  class_id: string;
  composition_id?: string;
  composition_type?: string | null; // "class" or "clinic"
  composition_order?: number | null; // 0: front time, 1+: back time
  subject_name: string | null;
  teacher_name: string | null;
}

// Combined schedule type (union of personal and class schedules)
type CombinedSchedule = PersonalSchedule | ClassSchedule;

export interface FullScheduleResponse {
  personal: PersonalSchedule[];
  class: ClassSchedule[];
  all: CombinedSchedule[];
}

export const fullScheduleApi = {
  // 학생의 전체 시간표 조회 (개인 일정 + 수업 일정)
  getFullSchedule: async (studentId: string): Promise<FullScheduleResponse> => {
    const response = await fetch(`/api/students/${studentId}/full-schedule`);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to fetch full schedule");
    }
    const result = await response.json();
    return result.data;
  },
};
