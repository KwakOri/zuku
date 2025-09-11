import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // 요청 본문에서 토큰 받기
    const { accessToken } = await request.json();
    
    // 토큰 검증은 클라이언트에서 이미 처리되므로 여기서는 성공 응답만
    const response = NextResponse.json({
      success: true,
      message: '로그아웃되었습니다.',
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