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
 * 변경사항을 DB에 적용 (단계별)
 * @param preview 미리보기 데이터
 * @param step 적용할 단계: 'students' | 'classes' | 'compositions' | 'enrollments'
 */
export async function applyStudentRenewalStep(
  preview: RenewalPreview,
  step: 'students' | 'classes' | 'compositions' | 'enrollments'
): Promise<RenewalResponse> {
  console.log(`[applyStudentRenewalStep] Step: ${step} 시작`);

  const response = await fetch('/api/students/renewal/apply', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ preview, step }),
  });

  if (!response.ok) {
    const error = await response.json();
    console.error(`[applyStudentRenewalStep] Step ${step} 실패:`, error);
    throw new Error(error.error || `${step} 단계 적용 실패`);
  }

  const result = await response.json();
  console.log(`[applyStudentRenewalStep] Step ${step} 완료:`, result);
  return result;
}

/**
 * [기존 함수] 변경사항을 DB에 한 번에 적용 (권장하지 않음)
 */
export async function applyStudentRenewal(preview: RenewalPreview): Promise<RenewalResponse> {
  // 단계별로 순차 실행
  console.log('[applyStudentRenewal] 전체 적용 시작 (단계별로 실행)');

  await applyStudentRenewalStep(preview, 'students');
  await applyStudentRenewalStep(preview, 'classes');
  await applyStudentRenewalStep(preview, 'compositions');
  const result = await applyStudentRenewalStep(preview, 'enrollments');

  console.log('[applyStudentRenewal] 전체 적용 완료');
  return result;
}
