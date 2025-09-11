import { verifyAccessToken } from './auth/jwt';
import { getUserById } from '../services/server/authService';

export interface AuthResult {
  success: boolean;
  user?: {
    id: string;
    email: string;
    name: string;
    role: string;
    isActive: boolean;
  };
  error?: string;
}

/**
 * JWT 토큰을 직접 검증하고 사용자 정보를 반환합니다.
 */
export async function authenticateToken(token: string): Promise<AuthResult> {
  try {
    if (!token) {
      return {
        success: false,
        error: '인증 토큰이 필요합니다.',
      };
    }

    // JWT 토큰 검증
    const payload = verifyAccessToken(token);
    if (!payload) {
      return {
        success: false,
        error: '유효하지 않거나 만료된 토큰입니다.',
      };
    }

    // 사용자 정보 조회
    const user = await getUserById(payload.userId);
    if (!user) {
      return {
        success: false,
        error: '사용자를 찾을 수 없습니다.',
      };
    }

    return {
      success: true,
      user,
    };
  } catch (error) {
    console.error('토큰 인증 실패:', error);
    return {
      success: false,
      error: '인증 처리 중 오류가 발생했습니다.',
    };
  }
}

/**
 * 특정 역할 권한을 확인합니다.
 */
export function hasRole(userRole: string, requiredRoles: string[]): boolean {
  return requiredRoles.includes(userRole);
}

/**
 * 관리자 권한을 확인합니다.
 */
export function isAdmin(userRole: string): boolean {
  return userRole === 'admin';
}

/**
 * 토큰 기반 사용자 검증 유틸리티
 */
export async function validateUser(token: string, requiredRoles?: string[]): Promise<{
  success: boolean;
  user?: {
    id: string;
    email: string;
    name: string;
    role: string;
    isActive: boolean;
  };
  error?: string;
}> {
  const authResult = await authenticateToken(token);

  if (!authResult.success || !authResult.user) {
    return {
      success: false,
      error: authResult.error || '인증에 실패했습니다.',
    };
  }

  // 역할 권한 체크
  if (requiredRoles && !hasRole(authResult.user.role, requiredRoles)) {
    return {
      success: false,
      error: '이 작업을 수행할 권한이 없습니다.',
    };
  }

  return {
    success: true,
    user: authResult.user,
  };
}