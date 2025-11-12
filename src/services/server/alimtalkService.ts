/**
 * 알림톡 서버 서비스
 * SOLAPI SDK를 사용하여 카카오톡 알림톡을 발송하는 서버 사이드 함수
 */

import { SolapiMessageService } from 'solapi';
import {
  AlimtalkSendRequest,
  AlimtalkSendResponse,
} from '@/types/alimtalk';

// SOLAPI 환경 변수
const SOLAPI_API_KEY = process.env.SOLAPI_API_KEY;
const SOLAPI_API_SECRET = process.env.SOLAPI_API_SECRET;
const SOLAPI_KAKAO_PFID = process.env.SOLAPI_KAKAO_PFID;

/**
 * SOLAPI 메시지 서비스 인스턴스 생성
 */
function getSolapiClient(): SolapiMessageService {
  if (!SOLAPI_API_KEY || !SOLAPI_API_SECRET) {
    throw new Error('SOLAPI API 인증 정보가 설정되지 않았습니다.');
  }

  return new SolapiMessageService(SOLAPI_API_KEY, SOLAPI_API_SECRET);
}

/**
 * 전화번호 형식화 (하이픈 제거, +82 국가코드 처리)
 */
function formatPhoneNumber(phone: string): string {
  let formatted = phone.replace(/-/g, '').trim();

  // +82로 시작하면 0으로 변경
  if (formatted.startsWith('+82')) {
    formatted = '0' + formatted.substring(3);
  }

  // 82로 시작하면 0으로 변경
  if (formatted.startsWith('82') && formatted.length > 10) {
    formatted = '0' + formatted.substring(2);
  }

  return formatted;
}

/**
 * 알림톡 발송 (단일/다중)
 */
export async function sendAlimtalk(
  request: AlimtalkSendRequest
): Promise<AlimtalkSendResponse> {
  try {
    const client = getSolapiClient();

    if (!SOLAPI_KAKAO_PFID) {
      throw new Error('SOLAPI 카카오 플러스친구 ID가 설정되지 않았습니다.');
    }

    // SOLAPI 메시지 발송 요청 생성
    const messages = request.to.map((recipient) => {
      const message: {
        to: string;
        from?: string;
        kakaoOptions: {
          pfId: string;
          templateId: string;
          variables: Record<string, string>;
          disableSms: boolean;
        };
      } = {
        to: formatPhoneNumber(recipient.phone),
        kakaoOptions: {
          pfId: SOLAPI_KAKAO_PFID,
          templateId: request.templateId,
          variables: recipient.variables,
          // 대체 발송 설정
          disableSms: request.fallback?.fallbackType === 'NONE',
        },
      };

      // from 필드는 대체 발송이 있을 때만 추가
      if (request.fallback?.from) {
        message.from = request.fallback.from;
      }

      return message;
    });

    // SOLAPI API 호출
    const response = await client.send(messages);

    return {
      success: true,
      data: {
        groupId: response.groupInfo.groupId || '',
      },
    };
  } catch (error) {
    console.error('SOLAPI 알림톡 발송 실패:', error);

    // failedMessageList가 있으면 상세 에러 출력
    if (error && typeof error === 'object' && 'failedMessageList' in error) {
      console.error('실패한 메시지 상세:', JSON.stringify(error.failedMessageList, null, 2));
    }

    return {
      success: false,
      message: error instanceof Error ? error.message : '알림톡 발송에 실패했습니다.',
    };
  }
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
