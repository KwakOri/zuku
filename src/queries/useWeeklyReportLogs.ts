/**
 * 주간 보고서 발송 기록 React Query Hooks
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchWeeklyReportLogs,
  createWeeklyReportLogs,
  CreateWeeklyReportLogRequest,
} from "@/services/client/weeklyReportLogApi";

/**
 * 발송 기록 조회 Hook
 */
export function useWeeklyReportLogs(params?: {
  week_of?: string;
  student_id?: string;
}) {
  return useQuery({
    queryKey: ["weekly-report-logs", params],
    queryFn: () => fetchWeeklyReportLogs(params),
    // week_of나 student_id가 있으면 실행, 없으면 전체 조회
  });
}

/**
 * 발송 기록 생성 Hook
 */
export function useCreateWeeklyReportLog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateWeeklyReportLogRequest) =>
      createWeeklyReportLogs(request),
    onSuccess: () => {
      // 성공 시 관련 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: ["weekly-report-logs"] });
    },
  });
}
