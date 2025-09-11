"use client";

import { verifyAccessToken } from "./auth/jwt";

// 클라이언트 사이드 JWT 토큰 관리
export class AuthManager {
  private static instance: AuthManager;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  private constructor() {
    // 브라우저에서만 실행
    if (typeof window !== 'undefined') {
      this.loadTokensFromStorage();
    }
  }

  public static getInstance(): AuthManager {
    if (!AuthManager.instance) {
      AuthManager.instance = new AuthManager();
    }
    return AuthManager.instance;
  }

  // localStorage에서 토큰 로드
  private loadTokensFromStorage(): void {
    try {
      this.accessToken = localStorage.getItem('access-token');
      this.refreshToken = localStorage.getItem('refresh-token');
    } catch (error) {
      console.warn('토큰 로드 실패:', error);
    }
  }

  // 토큰 저장
  public setTokens(accessToken: string, refreshToken: string): void {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('access-token', accessToken);
        localStorage.setItem('refresh-token', refreshToken);
      } catch (error) {
        console.warn('토큰 저장 실패:', error);
      }
    }
  }

  // 액세스 토큰 가져오기
  public getAccessToken(): string | null {
    return this.accessToken;
  }

  // 리프레시 토큰 가져오기
  public getRefreshToken(): string | null {
    return this.refreshToken;
  }

  // 토큰 유효성 검사
  public isAuthenticated(): boolean {
    if (!this.accessToken) {
      return false;
    }

    const payload = verifyAccessToken(this.accessToken);
    return payload !== null;
  }

  // 현재 사용자 정보 가져오기
  public getCurrentUser(): { userId: string; email: string; name: string; role: string } | null {
    if (!this.accessToken) {
      return null;
    }

    const payload = verifyAccessToken(this.accessToken);
    if (!payload) {
      return null;
    }

    return {
      userId: payload.userId,
      email: payload.email,
      name: payload.name,
      role: payload.role,
    };
  }

  // 로그아웃
  public logout(): void {
    this.accessToken = null;
    this.refreshToken = null;

    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('access-token');
        localStorage.removeItem('refresh-token');
      } catch (error) {
        console.warn('토큰 삭제 실패:', error);
      }
    }
  }

  // Authorization 헤더용 토큰 반환
  public getAuthHeader(): { Authorization: string } | Record<string, never> {
    if (!this.accessToken) {
      return {};
    }
    return {
      Authorization: `Bearer ${this.accessToken}`,
    };
  }
}

// 싱글톤 인스턴스 export
export const authManager = AuthManager.getInstance();