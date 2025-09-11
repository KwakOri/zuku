import { NextRequest, NextResponse } from 'next/server';
import { loginUser } from '@/services/server/authService';
import { validatePasswordStrength } from '@/lib/auth/password';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // 입력 검증
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: '이메일과 비밀번호를 입력해주세요.' },
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

    // 기본 비밀번호 길이 검증
    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: '비밀번호는 최소 6자 이상이어야 합니다.' },
        { status: 400 }
      );
    }

    // 로그인 처리
    const result = await loginUser(email.trim(), password);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 401 }
      );
    }

    // 응답에서 쿠키 설정
    const response = NextResponse.json({
      success: true,
      user: result.user,
      accessToken: result.accessToken,
    });

    // HTTP-only 쿠키로 리프레시 토큰 설정
    response.cookies.set('refresh_token', result.refreshToken!, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60, // 30일
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('로그인 API 에러:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}