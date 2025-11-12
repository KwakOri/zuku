import { useMutation, useQueryClient } from '@tanstack/react-query';
import { parseStudentFile, applyStudentRenewal, applyStudentRenewalStep } from '@/services/client/studentRenewalApi';
import { RenewalPreview } from '@/types/student-renewal';

/**
 * Excel/CSV 파일 파싱 mutation
 */
export function useParseStudentFile() {
  return useMutation({
    mutationFn: (file: File) => parseStudentFile(file),
  });
}

/**
 * 학생 정보 갱신 적용 mutation (단계별)
 */
export function useApplyStudentRenewalStep() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ preview, step }: { preview: RenewalPreview; step: 'students' | 'classes' | 'compositions' | 'enrollments' }) =>
      applyStudentRenewalStep(preview, step),
    onSuccess: (_, variables) => {
      // 단계별로 적절한 캐시 무효화
      if (variables.step === 'students') {
        queryClient.invalidateQueries({ queryKey: ['students'] });
      } else if (variables.step === 'classes') {
        queryClient.invalidateQueries({ queryKey: ['classes'] });
      } else if (variables.step === 'compositions') {
        // 수업 구성이 추가되었으므로 classes 캐시 무효화
        queryClient.invalidateQueries({ queryKey: ['classes'] });
      } else if (variables.step === 'enrollments') {
        queryClient.invalidateQueries({ queryKey: ['class-students'] });
        queryClient.invalidateQueries({ queryKey: ['students'] });
        queryClient.invalidateQueries({ queryKey: ['classes'] });
      }
    },
  });
}

/**
 * [기존 함수] 학생 정보 갱신 적용 mutation (한 번에 모두)
 */
export function useApplyStudentRenewal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (preview: RenewalPreview) => applyStudentRenewal(preview),
    onSuccess: () => {
      // 학생 관련 쿼리 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ['students'] });
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      queryClient.invalidateQueries({ queryKey: ['class-students'] });
    },
  });
}
