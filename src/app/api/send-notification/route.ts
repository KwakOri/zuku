import { NextRequest, NextResponse } from 'next/server';

// SOLAPI 라이브러리 import
// import { SolapiMessageService } from 'solapi';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { to, studentName, recordId, subject, teacherName, weekOf } = body;

    // 환경 변수에서 SOLAPI 설정 가져오기
    const apiKey = process.env.SOLAPI_API_KEY;
    const apiSecret = process.env.SOLAPI_API_SECRET;
    const senderNumber = process.env.SOLAPI_SENDER_NUMBER || '010-0000-0000';

    if (!apiKey || !apiSecret) {
      console.log('SOLAPI 설정이 없어서 테스트 모드로 실행합니다.');
      
      // 테스트 모드 - 실제 발송하지 않고 로그만 출력
      console.log('테스트 알림톡 발송:', {
        to,
        studentName,
        recordId,
        subject,
        teacherName,
        weekOf
      });

      // 0.5초 대기 (실제 API 호출 시뮬레이션)
      await new Promise(resolve => setTimeout(resolve, 500));

      return NextResponse.json({
        success: true,
        messageId: `test_${Date.now()}`,
        message: '테스트 모드에서 알림톡이 발송되었습니다.',
      });
    }

    // 실제 SOLAPI 사용 시 (환경 변수가 설정된 경우)
    /*
    const messageService = new SolapiMessageService(apiKey, apiSecret);

    const message = {
      to: to.replace(/-/g, ''), // 하이픈 제거
      from: senderNumber.replace(/-/g, ''), // 하이픈 제거
      type: 'AT', // 알림톡
      kakaoOptions: {
        pfId: process.env.KAKAO_PF_ID, // 카카오톡 채널 ID
        templateId: process.env.KAKAO_TEMPLATE_ID, // 알림톡 템플릿 ID
        variables: {
          '#{학생명}': studentName,
          '#{과목명}': subject,
          '#{선생님}': teacherName,
          '#{주간}': weekOf,
          '#{링크}': `${process.env.NEXT_PUBLIC_BASE_URL}/homework/${recordId}`
        }
      },
      text: `안녕하세요! ${studentName} 학생의 ${weekOf} 주간 ${subject} 수업 기록이 등록되었습니다.\n\n담당선생님: ${teacherName}\n\n자세한 내용은 아래 링크에서 확인하실 수 있습니다.\n${process.env.NEXT_PUBLIC_BASE_URL}/homework/${recordId}`
    };

    const result = await messageService.send(message);

    return NextResponse.json({
      success: true,
      messageId: result.messageId,
      message: '알림톡이 성공적으로 발송되었습니다.',
    });
    */

    // 현재는 테스트 응답 반환
    return NextResponse.json({
      success: true,
      messageId: `prod_test_${Date.now()}`,
      message: '알림톡 발송 준비가 완료되었습니다. (SOLAPI 설정 필요)',
    });

  } catch (error) {
    console.error('알림톡 발송 오류:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: '알림톡 발송에 실패했습니다.',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}