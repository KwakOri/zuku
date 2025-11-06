/**
 * 주간 보고서 발송 React Query Hooks
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  sendWeeklyReport,
  sendSingleWeeklyReport,
  WeeklyReportSendRequest,
  WeeklyReportRecipient,
} from "@/services/client/weeklyReportApi";

/**
 * 주간 보고서 알림톡 발송 Hook (다중)
 */
export function useSendWeeklyReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: WeeklyReportSendRequest) => sendWeeklyReport(request),
    onSuccess: () => {
      // 성공 시 관련 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: ["weekly-report-logs"] });
      queryClient.invalidateQueries({ queryKey: ["alimtalk"] });
    },
  });
}

/**
 * 단일 학생 주간 보고서 발송 Hook
 */
export function useSendSingleWeeklyReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      templateId,
      recipient,
      weekOf,
      sentBy,
      fallbackType = "NONE",
      smsSender,
    }: {
      templateId: string;
      recipient: WeeklyReportRecipient;
      weekOf: string;
      sentBy: string;
      fallbackType?: "NONE" | "SMS" | "LMS" | "MMS";
      smsSender?: string;
    }) =>
      sendSingleWeeklyReport(
        templateId,
        recipient,
        weekOf,
        sentBy,
        fallbackType,
        smsSender
      ),
    onSuccess: () => {
      // 성공 시 관련 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: ["weekly-report-logs"] });
      queryClient.invalidateQueries({ queryKey: ["alimtalk"] });
    },
  });
}
