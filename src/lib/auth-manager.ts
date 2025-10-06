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

  // 토큰 저장 (refreshToken은 선택적)
  public setTokens(accessToken: string, refreshToken: string = ''): void {
    console.log('AuthManager - 토큰 저장 시작:', {
      hasAccessToken: !!accessToken,
      hasRefreshToken: !!refreshToken,
      isClient: typeof window !== 'undefined'
    });
    
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('zuku_access_token', accessToken);
        if (refreshToken) {
          localStorage.setItem('zuku_refresh_token', refreshToken);
        }
        console.log('AuthManager - localStorage 저장 완료');
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

  // API를 통한 토큰 검증
  public async isAuthenticated(): Promise<boolean> {
    if (!this.accessToken) {
      return false;
    }

    try {
      const response = await fetch('/api/auth/verify-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accessToken: this.accessToken,
        }),
      });

      const result = await response.json();
      
      if (!result.success) {
        // 토큰이 유효하지 않으면 로컬 스토리지에서 제거
        this.logout();
        return false;
      }

      return true;
    } catch (error) {
      console.warn('토큰 검증 API 호출 실패:', error);
      return false;
    }
  }

  // 즉시 토큰 존재 여부만 확인 (동기 메서드)
  public hasToken(): boolean {
    return !!this.accessToken;
  }

  // JWT 디코딩 (클라이언트에서는 페이로드 디코딩만, 검증은 서버에서)
  private decodeTokenPayload(token: string): Record<string, unknown> | null {
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

  // API를 통한 사용자 정보 가져오기 (검증된 정보)
  public async getCurrentUser(): Promise<{ userId: string; email: string; name: string; role: string } | null> {
    if (!this.accessToken) {
      return null;
    }

    try {
      const response = await fetch('/api/auth/verify-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accessToken: this.accessToken,
        }),
      });

      const result = await response.json();
      
      if (!result.success || !result.user) {
        this.logout();
        return null;
      }

      return {
        userId: result.user.userId,
        email: result.user.email,
        name: result.user.name,
        role: result.user.role,
      };
    } catch (error) {
      console.warn('사용자 정보 조회 API 호출 실패:', error);
      return null;
    }
  }

  // JWT 페이로드에서 사용자 정보 가져오기 (동기 메서드, 검증되지 않음)
  public getCurrentUserFromToken(): { userId: string; email: string; name: string; role: string } | null {
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