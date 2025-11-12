/**
 * 주간 보고서 클라이언트 API
 */

export interface WeeklyReportLog {
  id?: string;
  week_of: string;
  student_id: string;
  subject_id: string;
  sent_by: string;
  sent_at: string;
}

export interface WeeklyReportRecipient {
  studentId: string;
  studentName: string;
  phone: string;
  subjectIds: string[];
  variables: Record<string, string>;
}

export interface WeeklyReportSendRequest {
  recipients: WeeklyReportRecipient[];
  weekOf: string;
  sentBy: string;
  fallbackType?: "NONE" | "SMS" | "LMS" | "MMS";
  smsSender?: string;
}

export interface WeeklyReportSendResponse {
  success: boolean;
  data?: {
    groupId?: string;
    logs?: WeeklyReportLog[];
    totalSent: number;
    totalLogs: number;
  };
  message?: string;
  warning?: string;
}

/**
 * 주간 보고서 알림톡 발송 (발송 + 로그 저장 통합)
 */
export async function sendWeeklyReport(
  request: WeeklyReportSendRequest
): Promise<WeeklyReportSendResponse> {
  const response = await fetch("/api/weekly-report/send", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "주간 보고서 발송에 실패했습니다.");
  }

  return response.json();
}

/**
 * 단일 학생 주간 보고서 발송
 */
export async function sendSingleWeeklyReport(
  recipient: WeeklyReportRecipient,
  weekOf: string,
  sentBy: string,
  fallbackType: "NONE" | "SMS" | "LMS" | "MMS" = "NONE",
  smsSender?: string
): Promise<WeeklyReportSendResponse> {
  return sendWeeklyReport({
    recipients: [recipient],
    weekOf,
    sentBy,
    fallbackType,
    smsSender,
  });
}
