import { useMutation } from '@tanstack/react-query';
import { sendKakaoNotification } from '@/services/client/notificationApi';
import toast from 'react-hot-toast';

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