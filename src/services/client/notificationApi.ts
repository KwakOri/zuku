export interface SendNotificationRequest {
  studentId: string;
}

export interface SendNotificationResponse {
  success: boolean;
  message: string;
  messageId?: string;
  to?: string;
}

export async function getKakaoTemplates(): Promise<unknown[]> {
  const response = await fetch('/api/notifications', {
    method: 'GET',
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || '템플릿 목록을 가져오는데 실패했습니다.');
  }

  return response.json();
}

export async function sendKakaoNotification(studentId: string): Promise<SendNotificationResponse> {
  const response = await fetch('/api/notifications', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ studentId }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || '알림톡 전송에 실패했습니다.');
  }

  return response.json();
}