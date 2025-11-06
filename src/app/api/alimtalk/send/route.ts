/**
 * 알림톡 단일/다중 발송 API
 * POST /api/alimtalk/send
 */

import { NextRequest, NextResponse } from 'next/server';
import { sendAlimtalk } from '@/services/server/alimtalkService';
import { AlimtalkSendRequest } from '@/types/alimtalk';

export async function POST(request: NextRequest) {
  try {
    const body: AlimtalkSendRequest = await request.json();

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

    if (!body.to || body.to.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: '수신자 정보가 필요합니다.',
        },
        { status: 400 }
      );
    }

    // 알림톡 발송
    const result = await sendAlimtalk(body);

    return NextResponse.json(result);
  } catch (error) {
    console.error('알림톡 발송 실패:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : '알림톡 발송에 실패했습니다.',
      },
      { status: 500 }
    );
  }
}
