import { NextRequest, NextResponse } from 'next/server';
import { signupUser, validateInviteToken } from '@/services/server/authService';
import { validatePasswordStrength } from '@/lib/auth/password';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name, inviteToken } = body;

    // 입력 검증
    if (!email || !password || !name || !inviteToken) {
      return NextResponse.json(
        { success: false, error: '모든 필드를 입력해주세요.' },
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

    // 이름 검증
    if (name.trim().length < 2) {
      return NextResponse.json(
        { success: false, error: '이름은 최소 2자 이상이어야 합니다.' },
        { status: 400 }
      );
    }

    // 비밀번호 강도 검증
    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        { 
          success: false, 
          error: '비밀번호가 보안 요구사항을 만족하지 않습니다.',
          details: passwordValidation.errors
        },
        { status: 400 }
      );
    }

    // 초대 토큰 검증
    const tokenValidation = await validateInviteToken(inviteToken);
    if (!tokenValidation.isValid) {
      return NextResponse.json(
        { success: false, error: tokenValidation.error },
        { status: 400 }
      );
    }

    // 초대된 이메일과 입력한 이메일이 일치하는지 확인
    if (tokenValidation.email && tokenValidation.email.toLowerCase() !== email.toLowerCase()) {
      return NextResponse.json(
        { success: false, error: '초대된 이메일과 일치하지 않습니다.' },
        { status: 400 }
      );
    }

    // 회원가입 처리
    const result = await signupUser(email.trim(), password, name.trim(), inviteToken);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      user: result.user,
      message: '회원가입이 완료되었습니다.',
    });
  } catch (error) {
    console.error('회원가입 API 에러:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}