/**
 * 알림톡 React Query Hooks
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchTemplates,
  sendSingleMessage,
  sendBulkMessages,
} from '@/services/client/alimtalkApi';
import {
  AlimtalkSendRequest,
} from '@/types/alimtalk';

/**
 * 템플릿 목록 조회 Hook
 */
export function useAlimtalkTemplates() {
  return useQuery({
    queryKey: ['alimtalk', 'templates'],
    queryFn: fetchTemplates,
    staleTime: 1000 * 60 * 5, // 5분
  });
}

/**
 * 단일 알림톡 발송 Hook
 */
export function useSendSingleAlimtalk() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      templateId,
      to,
      variables,
      fallbackType = 'NONE',
      smsSender,
    }: {
      templateId: string;
      to: string;
      variables: Record<string, string>;
      fallbackType?: 'NONE' | 'SMS' | 'LMS' | 'MMS';
      smsSender?: string;
    }) => {
      return sendSingleMessage(templateId, to, variables, fallbackType, smsSender);
    },
    onSuccess: () => {
      // 성공 시 필요한 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: ['alimtalk'] });
    },
  });
}

/**
 * 다중 알림톡 발송 Hook
 */
export function useSendBulkAlimtalk() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      templateId,
      recipients,
      fallbackType = 'NONE',
      smsSender,
    }: {
      templateId: string;
      recipients: Array<{
        to: string;
        variables: Record<string, string>;
      }>;
      fallbackType?: 'NONE' | 'SMS' | 'LMS' | 'MMS';
      smsSender?: string;
    }) => {
      return sendBulkMessages(templateId, recipients, fallbackType, smsSender);
    },
    onSuccess: () => {
      // 성공 시 필요한 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: ['alimtalk'] });
    },
  });
}
