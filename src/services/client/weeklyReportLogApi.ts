/**
 * 주간 보고서 발송 기록 클라이언트 API
 */

export interface WeeklyReportLog {
  id: string;
  week_of: string;
  student_id: string;
  subject_id: string;
  sent_at: string;
  sent_by: string;
  student?: {
    id: string;
    name: string;
  };
  subject?: {
    id: string;
    subject_name: string;
  };
}

export interface CreateWeeklyReportLogRequest {
  week_of: string;
  student_id: string;
  subject_ids: string[];
  sent_by: string;
}

/**
 * 발송 기록 저장
 */
export async function createWeeklyReportLogs(
  request: CreateWeeklyReportLogRequest
): Promise<WeeklyReportLog[]> {
  const response = await fetch("/api/weekly-report-logs", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "발송 기록 저장에 실패했습니다.");
  }

  const result = await response.json();
  return result.data;
}

/**
 * 발송 기록 조회
 */
export async function fetchWeeklyReportLogs(params?: {
  week_of?: string;
  student_id?: string;
}): Promise<WeeklyReportLog[]> {
  const searchParams = new URLSearchParams();

  if (params?.week_of) {
    searchParams.append("week_of", params.week_of);
  }
  if (params?.student_id) {
    searchParams.append("student_id", params.student_id);
  }

  const response = await fetch(
    `/api/weekly-report-logs?${searchParams.toString()}`
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "발송 기록 조회에 실패했습니다.");
  }

  const result = await response.json();
  return result.data;
}
