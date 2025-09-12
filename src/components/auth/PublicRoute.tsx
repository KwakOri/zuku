"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthState } from '@/queries/useAuth';
import { Loader2 } from 'lucide-react';

interface PublicRouteProps {
  children: React.ReactNode;
  redirectTo?: string; // 로그인된 사용자가 이동할 경로
}

export default function PublicRoute({ children, redirectTo = '/' }: PublicRouteProps) {
  const { isAuthenticated, isLoading } = useAuthState();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, isLoading, router, redirectTo]);

  // 로딩 중 - 토큰 검증 및 사용자 정보 확인
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 text-lg font-medium mb-2">인증 확인 중</p>
          <p className="text-gray-500 text-sm">잠시만 기다려주세요...</p>
        </div>
      </div>
    );
  }

  // 이미 로그인됨
  if (isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600 mb-4">이미 로그인되어 있습니다.</p>
          <p className="text-sm text-gray-500">메인 페이지로 이동합니다...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}