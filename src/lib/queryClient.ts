import { QueryClient } from "@tanstack/react-query";

const isDevelopment = process.env.NODE_ENV === "development";

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // 개발 환경에서는 캐시 비활성화, 프로덕션에서는 5분간 캐시 유지
        staleTime: isDevelopment ? 0 : 5 * 60 * 1000,
        // 개발 환경에서는 즉시 GC, 프로덕션에서는 30분간 유지
        gcTime: isDevelopment ? 0 : 30 * 60 * 1000,
        // 개발 환경에서는 항상 리페치
        refetchOnWindowFocus: isDevelopment ? true : true,
        // 네트워크 재연결시 리페치
        refetchOnReconnect: true,
        // 개발 환경에서는 항상 마운트시 리페치
        refetchOnMount: isDevelopment ? true : true,
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
