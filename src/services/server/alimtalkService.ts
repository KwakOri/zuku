/**
 * 알림톡 서버 서비스
 * Zuku Proxy API를 호출하여 카카오톡 알림톡을 발송하는 서버 사이드 함수
 */

import {
  AlimtalkTemplatesResponse,
  AlimtalkSendRequest,
  AlimtalkSendResponse,
  SendProfilesResponse,
  AlimtalkTemplate,
} from '@/types/alimtalk';

const ALIMTALK_API_BASE_URL = process.env.ALIMTALK_API_BASE_URL || 'http://localhost:3000';
const ALIMTALK_API_KEY = process.env.ALIMTALK_API_KEY;

/**
 * Zuku Proxy API 호출 헬퍼 함수
 */
async function callAlimtalkApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${ALIMTALK_API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ALIMTALK_API_KEY || '',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `API 호출 실패: ${response.status}`);
  }

  return response.json();
}

/**
 * 채널 목록 조회
 */
export async function getSendProfiles(): Promise<SendProfilesResponse> {
  return callAlimtalkApi<SendProfilesResponse>('/api/alimtalk/send-profiles');
}

/**
 * 템플릿 목록 조회
 */
export async function getTemplates(): Promise<AlimtalkTemplatesResponse> {
  return callAlimtalkApi<AlimtalkTemplatesResponse>('/api/alimtalk/templates');
}

/**
 * 템플릿 상세 조회
 */
export async function getTemplateById(templateId: string): Promise<AlimtalkTemplate> {
  const response = await callAlimtalkApi<{ success: boolean; data: AlimtalkTemplate }>(
    `/api/alimtalk/templates/${templateId}`
  );
  return response.data;
}

/**
 * 알림톡 발송 (단일/다중)
 */
export async function sendAlimtalk(
  request: AlimtalkSendRequest
): Promise<AlimtalkSendResponse> {
  return callAlimtalkApi<AlimtalkSendResponse>('/api/alimtalk/send', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

/**
 * 전화번호 형식화 (하이픈 제거)
 */
function formatPhoneNumber(phone: string): string {
  return phone.replace(/-/g, '');
}

/**
 * 단일 알림톡 발송 헬퍼
 */
export async function sendSingleAlimtalk(
  templateId: string,
  to: string,
  variables: Record<string, string>,
  fallbackType: 'NONE' | 'SMS' | 'LMS' | 'MMS' = 'NONE',
  smsSender?: string
): Promise<AlimtalkSendResponse> {
  const request: AlimtalkSendRequest = {
    templateId,
    to: [
      {
        phone: formatPhoneNumber(to),
        variables,
      },
    ],
    fallback: {
      fallbackType,
      from: fallbackType !== 'NONE' ? smsSender : undefined,
    },
  };

  return sendAlimtalk(request);
}

/**
 * 다중 알림톡 발송 헬퍼
 */
export async function sendBulkAlimtalk(
  templateId: string,
  recipients: Array<{
    to: string;
    variables: Record<string, string>;
  }>,
  fallbackType: 'NONE' | 'SMS' | 'LMS' | 'MMS' = 'NONE',
  smsSender?: string
): Promise<AlimtalkSendResponse> {
  const request: AlimtalkSendRequest = {
    templateId,
    to: recipients.map((recipient) => ({
      phone: formatPhoneNumber(recipient.to),
      variables: recipient.variables,
    })),
    fallback: {
      fallbackType,
      from: fallbackType !== 'NONE' ? smsSender : undefined,
    },
  };

  return sendAlimtalk(request);
}
