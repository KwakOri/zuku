import { RenewalPreview, RenewalResponse } from '@/types/student-renewal';

/**
 * Excel/CSV 파일 업로드 및 파싱
 */
export async function parseStudentFile(file: File): Promise<RenewalResponse> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('/api/students/renewal/parse', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || '파일 처리 실패');
  }

  return response.json();
}

/**
 * 변경사항을 DB에 적용
 */
export async function applyStudentRenewal(preview: RenewalPreview): Promise<RenewalResponse> {
  const response = await fetch('/api/students/renewal/apply', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ preview }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || '변경사항 적용 실패');
  }

  return response.json();
}
