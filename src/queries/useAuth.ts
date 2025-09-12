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
  verifyTokenApi,
} from "@/services/client/authApi";
import { authManager } from "@/lib/auth-manager";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";

// 쿼리 키 상수
export const AUTH_QUERY_KEYS = {
  me: ["auth", "me"] as const,
  invitations: ["auth", "invitations"] as const,
  validateInvite: (token: string) => ["auth", "validateInvite", token] as const,
  verifyToken: (token: string) => ["auth", "verifyToken", token] as const,
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
        console.log('useLogin - 로그인 성공, 캐시 업데이트 시작');
        // 사용자 정보 캐시 설정 (즉시 사용 가능하도록)
        queryClient.setQueryData(AUTH_QUERY_KEYS.me, result.user);
        // useMe 쿼리 다시 실행하여 최신 상태 확보
        queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.me });
        console.log('useLogin - 캐시 업데이트 완료');
      }
    },
    onError: (error) => {
      console.error("로그인 실패:", error);
      authManager.logout();
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
      // AuthManager에서 이미 토큰을 제거했으므로 중복 제거 방지
      // 인증 관련 캐시 모두 제거
      queryClient.removeQueries({ queryKey: ["auth"] });
      queryClient.clear();
    },
    onError: (error) => {
      console.error("로그아웃 실패:", error);
      // 에러가 발생해도 로컬 토큰은 제거 (AuthManager에서 처리됨)
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
    setAccessToken(authManager.getAccessToken());

    // AuthManager 토큰 변화 감지
    const interval = setInterval(() => {
      const currentToken = authManager.getAccessToken();
      if (currentToken !== accessToken) {
        setAccessToken(currentToken);
      }
    }, 500);

    return () => clearInterval(interval);
  }, [accessToken]);

  return useQuery({
    queryKey: AUTH_QUERY_KEYS.me,
    queryFn: async () => {
      const currentToken = authManager.getAccessToken();
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
        authManager.logout();
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
  const { data: user, isLoading: userIsLoading, error, refetch } = useMe();
  const [isClient, setIsClient] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [initialTokenCheck, setInitialTokenCheck] = useState(false);

  // 초기 설정 및 토큰 체크
  useEffect(() => {
    setIsClient(true);
    const storedToken = authManager.getAccessToken();
    console.log('useAuthState - 초기 토큰 체크:', !!storedToken);
    setAccessToken(storedToken);
    setInitialTokenCheck(true);
    
    // 토큰이 있으면 즉시 사용자 정보 로드
    if (storedToken && !user) {
      console.log('useAuthState - 토큰 있음, 사용자 정보 로드 시작');
      refetch();
    }
  }, [user, refetch]); // user를 의존성에 추가하여 사용자 정보 변화 감지

  // 토큰 변화 감지 - 더 자주 체크하고 로그 추가
  useEffect(() => {
    const interval = setInterval(() => {
      const currentToken = authManager.getAccessToken();
      if (currentToken !== accessToken) {
        console.log('useAuthState - 토큰 변화 감지:', {
          이전: !!accessToken,
          현재: !!currentToken
        });
        setAccessToken(currentToken);
        if (currentToken && !user) {
          console.log('useAuthState - 새 토큰으로 사용자 정보 재로드');
          refetch();
        }
      }
    }, 200); // 더 빠른 반응을 위해 200ms로 단축

    return () => clearInterval(interval);
  }, [accessToken, user, refetch]);

  const isAuthenticated = !!user && isClient && !!accessToken;
  
  // 로딩 상태: 클라이언트가 준비되지 않았거나, 토큰이 있는데 사용자 정보 로딩 중일 때
  const isLoading = !isClient || !initialTokenCheck || (!!accessToken && userIsLoading);

  // 디버깅 로그
  console.log('useAuthState 상태:', {
    isClient,
    initialTokenCheck,
    hasAccessToken: !!accessToken,
    hasUser: !!user,
    userIsLoading,
    isLoading,
    isAuthenticated
  });

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    accessToken,
  };
}

/**
 * 토큰 검증 Query
 */
export function useVerifyToken() {
  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    setAccessToken(authManager.getAccessToken());
  }, []);

  return useQuery({
    queryKey: AUTH_QUERY_KEYS.verifyToken(accessToken || ''),
    queryFn: async () => {
      const currentToken = authManager.getAccessToken();
      if (!currentToken) {
        throw new Error("토큰이 없습니다.");
      }
      
      const result = await verifyTokenApi(currentToken);
      if (!result.success) {
        // 토큰이 유효하지 않으면 AuthManager에서 제거
        authManager.logout();
        throw new Error(result.error || "토큰 검증 실패");
      }
      
      return result;
    },
    enabled: !!accessToken,
    staleTime: 3 * 60 * 1000, // 3분
    retry: (failureCount, error) => {
      // 토큰 관련 에러는 재시도하지 않음
      if (error.message.includes("토큰") || error.message.includes("401")) {
        return false;
      }
      return failureCount < 1;
    },
  });
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
