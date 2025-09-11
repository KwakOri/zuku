import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/auth/jwt';
import { createInvitation } from '@/services/server/authService';
import { sendInviteEmail } from '@/services/server/emailService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, role, name, accessToken } = body;

    if (!accessToken) {
      return NextResponse.json(
        { success: false, error: '인증 토큰이 필요합니다.' },
        { status: 401 }
      );
    }

    const decoded = verifyAccessToken(accessToken);
    if (!decoded) {
      return NextResponse.json(
        { success: false, error: '유효하지 않은 토큰입니다.' },
        { status: 401 }
      );
    }

    // 관리자 권한 확인
    if (decoded.role !== 'admin' && decoded.role !== 'manager') {
      return NextResponse.json(
        { success: false, error: '관리자 권한이 필요합니다.' },
        { status: 403 }
      );
    }

    // 입력 검증
    if (!email || !role) {
      return NextResponse.json(
        { success: false, error: '이메일과 역할을 입력해주세요.' },
        { status: 400 }
      );
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: '올바른 이메일 형식을 입력해주세요.' },
        { status: 400 }
      );
    }

    // 유효한 역할인지 확인
    const validRoles = ['admin', 'manager', 'teacher', 'assistant'];
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { success: false, error: '유효하지 않은 역할입니다.' },
        { status: 400 }
      );
    }

    // 초대 생성
    const inviteResult = await createInvitation(email, role, decoded.userId);

    if (!inviteResult.success) {
      return NextResponse.json(
        { success: false, error: inviteResult.error },
        { status: 400 }
      );
    }

    // 초대 이메일 발송
    const emailResult = await sendInviteEmail({
      to: email,
      name: name || email,
      role: role,
      inviteToken: inviteResult.inviteToken!,
      inviterName: decoded.name,
    });

    if (!emailResult.success) {
      console.warn('초대 이메일 발송 실패:', emailResult.error);
      // 이메일 발송 실패해도 초대는 생성되었으므로 성공으로 처리
      return NextResponse.json({
        success: true,
        message: '초대가 생성되었지만 이메일 발송에 실패했습니다. 초대 링크를 직접 전달해 주세요.',
        inviteToken: inviteResult.inviteToken,
      });
    }

    return NextResponse.json({
      success: true,
      message: '초대 이메일이 발송되었습니다.',
    });
  } catch (error) {
    console.error('사용자 초대 API 에러:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}