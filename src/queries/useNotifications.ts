import { useMutation, useQuery } from '@tanstack/react-query';
import { sendKakaoNotification, getKakaoTemplates } from '@/services/client/notificationApi';
import toast from 'react-hot-toast';

export function useKakaoTemplates() {
  return useQuery({
    queryKey: ['kakaoTemplates'],
    queryFn: getKakaoTemplates,
    staleTime: 1000 * 60 * 10, // 10분간 캐시
  });
}

export function useSendKakaoNotification() {
  return useMutation({
    mutationFn: sendKakaoNotification,
    onSuccess: (data) => {
      toast.success(data.message);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}