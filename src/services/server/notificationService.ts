import { createAdminSupabaseClient } from '@/lib/supabase-server';
import { SolapiMessageService } from 'solapi';

export async function sendKakaoNotification(studentId: string) {
  try {
    // SOLAPI 클라이언트 초기화 (공식 SDK 방식)
    const messageService = new SolapiMessageService(
      process.env.SOLAPI_API_KEY!,
      process.env.SOLAPI_API_SECRET!
    );

    const supabase = createAdminSupabaseClient();

    // 학생 정보 조회
    const { data: student, error } = await supabase
      .from('students')
      .select('id, name, parent_phone')
      .eq('id', studentId)
      .single();

    if (error || !student) {
      throw new Error('학생 정보를 찾을 수 없습니다.');
    }

    if (!student.parent_phone) {
      throw new Error('학부모 연락처가 등록되지 않았습니다.');
    }

    // 전화번호 형식 정리 (하이픈 제거)
    const phoneNumber = student.parent_phone.replace(/-/g, '');

    // 알림톡 전송 (sendOne 메서드 사용)
    const result = await messageService.sendOne({
      to: phoneNumber,
      from: process.env.SOLAPI_SENDER_NUMBER!,
      type: 'ATA', // 알림톡
      kakaoOptions: {
        pfId: process.env.KAKAO_PF_ID!,
        templateId: process.env.KAKAO_TEMPLATE_ID!,
        variables: {
          홍길동: student.name,
          url: 'www.naver.com'
        }
      }
    });

    console.log('알림톡 전송 결과:', result);

    return {
      success: true,
      message: `${student.name} 학생의 학부모에게 알림톡을 전송했습니다.`,
      messageId: result.messageId || 'unknown',
      to: phoneNumber
    };

  } catch (error) {
    console.error('알림톡 전송 오류:', error);
    throw error;
  }
}