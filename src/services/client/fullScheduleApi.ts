export interface FullScheduleResponse {
  personal: any[];
  class: any[];
  all: any[];
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
