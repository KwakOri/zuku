"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthState } from '@/queries/useAuth';
import { Loader2 } from 'lucide-react';

interface PrivateRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[]; // 특정 역할이 필요한 경우
}

export default function PrivateRoute({ children, requiredRoles }: PrivateRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuthState();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

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

  // 인증되지 않음
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600 mb-4">로그인이 필요한 페이지입니다.</p>
          <p className="text-sm text-gray-500">로그인 페이지로 이동합니다...</p>
        </div>
      </div>
    );
  }

  // 특정 역할 확인
  if (requiredRoles && user && !requiredRoles.includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">접근 권한이 없습니다</h2>
          <p className="text-gray-600 mb-4">이 페이지에 접근할 권한이 없습니다.</p>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            이전 페이지로
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}