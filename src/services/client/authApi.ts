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

    // 로그인 성공 시 토큰 저장
    if (result.success && result.accessToken && result.refreshToken) {
      authManager.setTokens(result.accessToken, result.refreshToken);
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

    if (!accessToken) {
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
