import { NextRequest, NextResponse } from 'next/server';
import { validateInviteToken } from '@/services/server/authService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { success: false, error: '초대 토큰이 없습니다.' },
        { status: 400 }
      );
    }

    // 초대 토큰 검증
    const result = await validateInviteToken(token);

    if (!result.isValid) {
      return NextResponse.json(
        { 
          success: false, 
          error: result.error,
          isExpired: result.error?.includes('만료'),
          isUsed: result.error?.includes('사용된'),
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      email: result.email,
      role: result.role,
    });
  } catch (error) {
    console.error('초대 토큰 검증 API 에러:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}