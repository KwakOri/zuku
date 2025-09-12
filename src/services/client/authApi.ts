import { authManager } from "@/lib/auth-manager";
import { AuthUser } from "@/services/server/authService";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  user?: AuthUser;
  accessToken?: string;
  refreshToken?: string;
  error?: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  name: string;
  inviteToken: string;
}

export interface SignupResponse {
  success: boolean;
  user?: AuthUser;
  message?: string;
  error?: string;
  details?: string[];
}

export interface ValidateInviteResponse {
  success: boolean;
  email?: string;
  role?: string;
  error?: string;
  isExpired?: boolean;
  isUsed?: boolean;
}

export interface InviteUserRequest {
  email: string;
  role: string;
  name?: string;
}

export interface InviteUserResponse {
  success: boolean;
  message?: string;
  inviteToken?: string;
  error?: string;
}

export interface InvitationsResponse {
  success: boolean;
  invitations?: Array<{
    id: string;
    email: string;
    role: string;
    invitedBy: string;
    invitedAt: string;
    expiresAt: string;
    status: 'pending' | 'accepted' | 'expired';
    acceptedAt?: string;
  }>;
  error?: string;
}

export interface MeResponse {
  success: boolean;
  user?: AuthUser;
  error?: string;
}

export interface VerifyTokenResponse {
  success: boolean;
  user?: {
    userId: string;
    email: string;
    name: string;
    role: string;
  };
  isValid?: boolean;
  isExpired?: boolean;
  expiresAt?: string;
  error?: string;
}

/**
 * 사용자 로그인
 */
export async function loginApi(data: LoginRequest): Promise<LoginResponse> {
  try {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    console.log('로그인 API - 서버 응답 상세:', {
      success: result.success,
      hasAccessToken: !!result.accessToken,
      hasRefreshToken: !!result.refreshToken,
      hasUser: !!result.user
    });

    // 로그인 성공 시 토큰 저장 (refreshToken은 HTTP-only 쿠키로 관리됨)
    if (result.success && result.accessToken) {
      console.log('로그인 API - 토큰 저장 시작:', {
        hasAccessToken: !!result.accessToken
      });
      // refreshToken은 서버에서 HTTP-only 쿠키로 설정되므로 빈 문자열로 처리
      authManager.setTokens(result.accessToken, '');
      console.log('로그인 API - 토큰 저장 완료, AuthManager 확인:', {
        storedToken: !!authManager.getAccessToken()
      });
    }

    return result;
  } catch (error) {
    console.error("로그인 API 호출 실패:", error);
    return {
      success: false,
      error: "네트워크 오류가 발생했습니다.",
    };
  }
}

/**
 * 사용자 회원가입
 */
export async function signupApi(data: SignupRequest): Promise<SignupResponse> {
  try {
    const response = await fetch("/api/auth/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("회원가입 API 호출 실패:", error);
    return {
      success: false,
      error: "네트워크 오류가 발생했습니다.",
    };
  }
}

/**
 * 초대 토큰 검증
 */
export async function validateInviteTokenApi(
  token: string
): Promise<ValidateInviteResponse> {
  try {
    const response = await fetch(
      `/api/auth/validate-invite?token=${encodeURIComponent(token)}`,
      {
        method: "GET",
      }
    );

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("초대 토큰 검증 API 호출 실패:", error);
    return {
      success: false,
      error: "네트워크 오류가 발생했습니다.",
    };
  }
}

/**
 * 사용자 로그아웃
 */
export async function logoutApi(): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const accessToken = authManager.getAccessToken();

    const response = await fetch("/api/auth/logout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        accessToken: accessToken,
      }),
    });

    const result = await response.json();

    // 로그아웃 성공/실패와 관계없이 클라이언트 토큰 삭제
    authManager.logout();

    return result;
  } catch (error) {
    console.error("로그아웃 API 호출 실패:", error);

    // 네트워크 오류여도 클라이언트 토큰은 삭제
    authManager.logout();

    return {
      success: false,
      error: "네트워크 오류가 발생했습니다.",
    };
  }
}

/**
 * 현재 사용자 정보 조회
 */
export async function getMeApi(): Promise<MeResponse> {
  try {
    const accessToken = authManager.getAccessToken();

    if (!accessToken) {
      return {
        success: false,
        error: "인증 토큰이 없습니다.",
      };
    }

    const response = await fetch("/api/auth/me", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        accessToken: accessToken,
      }),
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("사용자 정보 조회 API 호출 실패:", error);
    return {
      success: false,
      error: "네트워크 오류가 발생했습니다.",
    };
  }
}

/**
 * 사용자 초대 (관리자용)
 */
export async function inviteUserApi(
  data: InviteUserRequest
): Promise<InviteUserResponse> {
  try {
    const accessToken = authManager.getAccessToken();

    if (!accessToken) {
      return {
        success: false,
        error: "인증 토큰이 없습니다.",
      };
    }

    const response = await fetch("/api/admin/invite-user", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...data,
        accessToken: accessToken,
      }),
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("사용자 초대 API 호출 실패:", error);
    return {
      success: false,
      error: "네트워크 오류가 발생했습니다.",
    };
  }
}

/**
 * 초대 목록 조회 (관리자용)
 */
export async function getInvitationsApi(): Promise<InvitationsResponse> {
  try {
    const accessToken = authManager.getAccessToken();
    console.log('초대 목록 API 호출 - 토큰 상태:', !!accessToken);

    if (!accessToken) {
      console.error('초대 목록 API - 토큰이 없습니다');
      return {
        success: false,
        error: '인증 토큰이 없습니다.',
      };
    }

    const response = await fetch('/api/admin/invites', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        accessToken: accessToken,
      }),
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('초대 목록 조회 API 호출 실패:', error);
    return {
      success: false,
      error: '네트워크 오류가 발생했습니다.',
    };
  }
}

/**
 * JWT 토큰 검증 (클라이언트에서 안전하게)
 */
export async function verifyTokenApi(accessToken: string): Promise<VerifyTokenResponse> {
  try {
    const response = await fetch('/api/auth/verify-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        accessToken: accessToken,
      }),
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('토큰 검증 API 호출 실패:', error);
    return {
      success: false,
      error: '네트워크 오류가 발생했습니다.',
    };
  }
}
