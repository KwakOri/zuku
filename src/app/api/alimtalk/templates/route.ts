/**
 * 알림톡 템플릿 조회 API
 * GET /api/alimtalk/templates
 */

import { NextResponse } from 'next/server';
import { getTemplates } from '@/services/server/alimtalkService';

export async function GET() {
  try {
    const templates = await getTemplates();
    return NextResponse.json(templates);
  } catch (error) {
    console.error('템플릿 조회 실패:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : '템플릿 조회에 실패했습니다.',
      },
      { status: 500 }
    );
  }
}
