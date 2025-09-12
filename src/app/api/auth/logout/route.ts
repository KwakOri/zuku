import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // 요청 본문에서 토큰 받기
    const { accessToken } = await request.json();
    
    // 로그아웃 응답
    const response = NextResponse.json({
      success: true,
      message: '로그아웃되었습니다.',
    });

    // HTTP-only 쿠키에서 refresh_token 삭제
    response.cookies.set('refresh_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0, // 즉시 만료
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('로그아웃 API 에러:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}