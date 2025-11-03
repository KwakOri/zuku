import { NextRequest, NextResponse } from 'next/server';
import { sendKakaoNotification, getKakaoAlimtalkTemplates } from '@/services/server/notificationService';

export async function GET() {
  try {
    const templates = await getKakaoAlimtalkTemplates();
    return NextResponse.json(templates);
  } catch (error) {
    console.error('템플릿 조회 중 오류:', error);
    return NextResponse.json(
      { error: '템플릿 목록을 가져오는데 실패했습니다.' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { studentId } = await request.json();

    if (!studentId) {
      return NextResponse.json(
        { error: '학생 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    const result = await sendKakaoNotification(studentId);

    return NextResponse.json(result);
  } catch (error) {
    console.error('알림톡 전송 중 오류:', error);
    return NextResponse.json(
      { error: '알림톡 전송에 실패했습니다.' },
      { status: 500 }
    );
  }
}