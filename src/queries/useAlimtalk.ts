/**
 * 알림톡 React Query Hooks
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  sendSingleMessage,
  sendBulkMessages,
} from '@/services/client/alimtalkApi';

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
