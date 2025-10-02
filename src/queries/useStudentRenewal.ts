import { useMutation, useQueryClient } from '@tanstack/react-query';
import { parseStudentFile, applyStudentRenewal } from '@/services/client/studentRenewalApi';
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
 * 학생 정보 갱신 적용 mutation
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
