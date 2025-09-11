"use client";

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
      this.accessToken = localStorage.getItem('zuku_access_token');
      this.refreshToken = localStorage.getItem('zuku_refresh_token');
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
        localStorage.setItem('zuku_access_token', accessToken);
        localStorage.setItem('zuku_refresh_token', refreshToken);
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

  // 토큰 존재 여부만 확인 (클라이언트에서는 JWT 검증 불가)
  public isAuthenticated(): boolean {
    return !!this.accessToken;
  }

  // JWT 디코딩 (클라이언트에서는 페이로드 디코딩만, 검증은 서버에서)
  private decodeTokenPayload(token: string): any | null {
    try {
      const payload = token.split('.')[1];
      if (!payload) return null;
      
      const decoded = atob(payload);
      return JSON.parse(decoded);
    } catch (error) {
      console.warn('토큰 디코딩 실패:', error);
      return null;
    }
  }

  // 현재 사용자 정보 가져오기 (JWT 페이로드에서)
  public getCurrentUser(): { userId: string; email: string; name: string; role: string } | null {
    if (!this.accessToken) {
      return null;
    }

    const payload = this.decodeTokenPayload(this.accessToken);
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
        localStorage.removeItem('zuku_access_token');
        localStorage.removeItem('zuku_refresh_token');
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