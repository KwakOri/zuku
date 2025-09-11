"use client";

import {
  getMeApi,
  getInvitationsApi,
  inviteUserApi,
  InviteUserRequest,
  loginApi,
  LoginRequest,
  logoutApi,
  signupApi,
  SignupRequest,
  validateInviteTokenApi,
} from "@/services/client/authApi";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";

// 쿼리 키 상수
export const AUTH_QUERY_KEYS = {
  me: ["auth", "me"] as const,
  invitations: ["auth", "invitations"] as const,
  validateInvite: (token: string) => ["auth", "validateInvite", token] as const,
};

// 로컬 스토리지에서 액세스 토큰 관리
const ACCESS_TOKEN_KEY = "zuku_access_token";

export function getStoredAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function setStoredAccessToken(token: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
}

export function removeStoredAccessToken(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ACCESS_TOKEN_KEY);
}

/**
 * 로그인 Mutation
 */
export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: LoginRequest) => loginApi(data),
    onSuccess: (result) => {
      if (result.success && result.accessToken) {
        setStoredAccessToken(result.accessToken);
        // 사용자 정보 캐시 설정
        queryClient.setQueryData(AUTH_QUERY_KEYS.me, result.user);
        // useMe 쿼리 다시 실행
        queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.me });
      }
    },
    onError: (error) => {
      console.error("로그인 실패:", error);
      removeStoredAccessToken();
    },
  });
}

/**
 * 로그아웃 Mutation
 */
export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => logoutApi(),
    onSuccess: () => {
      removeStoredAccessToken();
      // 인증 관련 캐시 모두 제거
      queryClient.removeQueries({ queryKey: ["auth"] });
      queryClient.clear();
    },
    onError: (error) => {
      console.error("로그아웃 실패:", error);
      // 에러가 발생해도 로컬 토큰은 제거
      removeStoredAccessToken();
      queryClient.removeQueries({ queryKey: ["auth"] });
    },
  });
}

/**
 * 회원가입 Mutation
 */
export function useSignup() {
  return useMutation({
    mutationFn: (data: SignupRequest) => signupApi(data),
  });
}

/**
 * 현재 사용자 정보 조회 Query
 */
export function useMe() {
  const [accessToken, setAccessToken] = useState<string | null>(null);

  // 클라이언트에서만 실행되도록 useEffect 사용
  useEffect(() => {
    setAccessToken(getStoredAccessToken());

    // localStorage 변화 감지
    const handleStorageChange = () => {
      setAccessToken(getStoredAccessToken());
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return useQuery({
    queryKey: AUTH_QUERY_KEYS.me,
    queryFn: async () => {
      const currentToken = getStoredAccessToken();
      if (!currentToken) {
        throw new Error("액세스 토큰이 없습니다.");
      }
      const result = await getMeApi();
      if (!result.success) {
        throw new Error(result.error || "사용자 정보 조회 실패");
      }
      return result.user!;
    },
    enabled: !!accessToken,
    staleTime: 5 * 60 * 1000, // 5분
    retry: (failureCount, error) => {
      // 401 에러 (인증 실패)의 경우 재시도하지 않음
      if (error.message.includes("401")) {
        removeStoredAccessToken();
        return false;
      }
      return failureCount < 2;
    },
  });
}

/**
 * 초대 토큰 검증 Query
 */
export function useValidateInviteToken(token: string | null) {
  return useQuery({
    queryKey: AUTH_QUERY_KEYS.validateInvite(token || ''),
    queryFn: () => validateInviteTokenApi(token!),
    enabled: !!token,
    staleTime: 0, // 항상 최신 상태 확인
    retry: false, // 초대 토큰 검증은 재시도하지 않음
  });
}

/**
 * 초대 목록 조회 Query (관리자용)
 */
export function useInvitations() {
  return useQuery({
    queryKey: AUTH_QUERY_KEYS.invitations,
    queryFn: async () => {
      const result = await getInvitationsApi();
      if (!result.success) {
        throw new Error(result.error || '초대 목록 조회 실패');
      }
      return result.invitations || [];
    },
    staleTime: 30 * 1000, // 30초
    retry: 1,
  });
}

/**
 * 사용자 초대 Mutation (관리자용)
 */
export function useInviteUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: InviteUserRequest) => inviteUserApi(data),
    onSuccess: () => {
      // 초대 성공 시 초대 목록 캐시 무효화
      queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.invitations });
    },
  });
}

/**
 * 인증 상태 관리 Hook
 */
export function useAuthState() {
  const { data: user, isLoading, error, refetch } = useMe();
  const [isClient, setIsClient] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    setIsClient(true);
    setAccessToken(getStoredAccessToken());
    
    // 토큰 상태를 주기적으로 체크하여 변화가 있으면 refetch
    const interval = setInterval(() => {
      const currentToken = getStoredAccessToken();
      if (currentToken !== accessToken) {
        setAccessToken(currentToken);
        if (currentToken) {
          refetch();
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [accessToken, refetch]);

  const isAuthenticated = !!user && isClient && !!accessToken;

  return {
    user,
    isAuthenticated,
    isLoading: isLoading || !isClient,
    error,
    accessToken,
  };
}

/**
 * 권한 체크 Hook
 */
export function usePermissions() {
  const { user } = useAuthState();

  const hasRole = (role: string | string[]) => {
    if (!user) return false;
    if (Array.isArray(role)) {
      return role.includes(user.role);
    }
    return user.role === role;
  };

  const isAdmin = hasRole("admin");
  const isManager = hasRole(["admin", "manager"]);
  const isTeacher = hasRole(["admin", "manager", "teacher"]);
  const isAssistant = hasRole(["admin", "manager", "teacher", "assistant"]);

  return {
    hasRole,
    isAdmin,
    isManager,
    isTeacher,
    isAssistant,
    role: user?.role || null,
  };
}
