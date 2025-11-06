/**
 * 알림톡 일괄 발송 API
 * POST /api/alimtalk/bulk
 */

import { NextRequest, NextResponse } from 'next/server';
import { sendBulkAlimtalk } from '@/services/server/alimtalkService';

interface BulkSendRequest {
  templateId: string;
  recipients: Array<{
    to: string;
    variables: Record<string, string>;
  }>;
  fallbackType?: 'NONE' | 'SMS' | 'LMS' | 'MMS';
  smsSender?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: BulkSendRequest = await request.json();

    // 유효성 검사
    if (!body.templateId) {
      return NextResponse.json(
        {
          success: false,
          message: '템플릿 ID가 필요합니다.',
        },
        { status: 400 }
      );
    }

    if (!body.recipients || body.recipients.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: '수신자 정보가 필요합니다.',
        },
        { status: 400 }
      );
    }

    // 일괄 발송
    const result = await sendBulkAlimtalk(
      body.templateId,
      body.recipients,
      body.fallbackType || 'NONE',
      body.smsSender
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error('알림톡 일괄 발송 실패:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : '알림톡 일괄 발송에 실패했습니다.',
      },
      { status: 500 }
    );
  }
}
