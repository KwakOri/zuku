import { QueryClient } from "@tanstack/react-query";

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // 5분간 캐시 유지
        staleTime: 5 * 60 * 1000,
        // 30분간 garbage collection 방지
        gcTime: 30 * 60 * 1000,
        // 백그라운드에서 자동 리페치
        refetchOnWindowFocus: true,
        // 네트워크 재연결시 리페치
        refetchOnReconnect: true,
        // 컴포넌트 마운트시 리페치 (staleTime이 지난 경우만)
        refetchOnMount: true,
        // 재시도 설정
      },
    },
  });
}

// 싱글톤 QueryClient 인스턴스
let queryClient: QueryClient | undefined = undefined;

export function getQueryClient() {
  if (typeof window === "undefined") {
    // 서버사이드에서는 매번 새 인스턴스 생성
    return createQueryClient();
  } else {
    // 클라이언트사이드에서는 싱글톤 패턴 사용
    if (!queryClient) {
      queryClient = createQueryClient();
    }
    return queryClient;
  }
}
