/**
 * 알림톡 클라이언트 API
 * 클라이언트에서 알림톡 API를 호출하는 함수들
 */

import {
  AlimtalkSendRequest,
  AlimtalkSendResponse,
} from '@/types/alimtalk';

/**
 * 알림톡 발송 (단일/다중)
 */
export async function sendAlimtalkMessage(
  request: AlimtalkSendRequest
): Promise<AlimtalkSendResponse> {
  const response = await fetch('/api/alimtalk/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || '알림톡 발송에 실패했습니다.');
  }

  return response.json();
}

/**
 * 단일 알림톡 발송
 */
export async function sendSingleMessage(
  templateId: string,
  to: string,
  variables: Record<string, string>,
  fallbackType: 'NONE' | 'SMS' | 'LMS' | 'MMS' = 'NONE',
  smsSender?: string
): Promise<AlimtalkSendResponse> {
  const request: AlimtalkSendRequest = {
    templateId,
    to: [{ phone: to, variables }],
    fallback: {
      fallbackType,
      from: fallbackType !== 'NONE' ? smsSender : undefined,
    },
  };

  return sendAlimtalkMessage(request);
}

/**
 * 다중 알림톡 발송
 */
export async function sendBulkMessages(
  templateId: string,
  recipients: Array<{
    to: string;
    variables: Record<string, string>;
  }>,
  fallbackType: 'NONE' | 'SMS' | 'LMS' | 'MMS' = 'NONE',
  smsSender?: string
): Promise<AlimtalkSendResponse> {
  const response = await fetch('/api/alimtalk/bulk', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      templateId,
      recipients,
      fallbackType,
      smsSender,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || '알림톡 일괄 발송에 실패했습니다.');
  }

  return response.json();
}
