import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";

// JWT 시크릿 키 - 환경 변수에서 가져오기
const JWT_SECRET =
  process.env.JWT_SECRET || "your-secret-key-change-in-production";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || "30d";

export interface JWTPayload {
  userId: string;
  email: string;
  name: string;
  role: string;
  iat?: number;
  exp?: number;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

/**
 * JWT 액세스 토큰을 생성합니다.
 * @param payload 토큰에 포함할 사용자 정보
 * @returns JWT 토큰 문자열
 */
export function generateAccessToken(
  payload: Omit<JWTPayload, "iat" | "exp">
): string {
  try {
    const token = jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
      issuer: "zuku-academy",
      audience: "zuku-users",
    } as jwt.SignOptions);
    return token;
  } catch (error) {
    console.error("액세스 토큰 생성 실패:", error);
    throw new Error("토큰 생성에 실패했습니다.");
  }
}

/**
 * JWT 리프레시 토큰을 생성합니다.
 * @param userId 사용자 ID
 * @returns JWT 리프레시 토큰 문자열
 */
export function generateRefreshToken(userId: string): string {
  try {
    const payload = {
      userId,
      type: "refresh",
      jti: uuidv4(), // JWT ID for token uniqueness
    };

    const token = jwt.sign(payload, JWT_SECRET, {
      expiresIn: REFRESH_TOKEN_EXPIRES_IN,
      issuer: "zuku-academy",
      audience: "zuku-users",
    } as jwt.SignOptions);
    return token;
  } catch (error) {
    console.error("리프레시 토큰 생성 실패:", error);
    throw new Error("리프레시 토큰 생성에 실패했습니다.");
  }
}

/**
 * 액세스 토큰과 리프레시 토큰을 함께 생성합니다.
 * @param payload 사용자 정보
 * @returns 토큰 쌍
 */
export function generateTokenPair(
  payload: Omit<JWTPayload, "iat" | "exp">
): TokenPair {
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload.userId);

  return {
    accessToken,
    refreshToken,
  };
}

/**
 * JWT 토큰을 검증하고 디코딩합니다.
 * @param token 검증할 JWT 토큰
 * @returns 디코딩된 페이로드 또는 null
 */
export function verifyAccessToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: "zuku-academy",
      audience: "zuku-users",
    }) as JWTPayload;

    return decoded;
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      console.warn("유효하지 않은 JWT 토큰:", error.message);
    } else if (error instanceof jwt.TokenExpiredError) {
      console.warn("만료된 JWT 토큰:", error.message);
    } else {
      console.error("JWT 토큰 검증 실패:", error);
    }
    return null;
  }
}

/**
 * 리프레시 토큰을 검증합니다.
 * @param token 검증할 리프레시 토큰
 * @returns 사용자 ID 또는 null
 */
export function verifyRefreshToken(
  token: string
): { userId: string; jti: string } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: "zuku-academy",
      audience: "zuku-users",
    }) as jwt.JwtPayload;

    if (decoded.type !== "refresh") {
      return null;
    }

    return {
      userId: decoded.userId,
      jti: decoded.jti as string,
    };
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      console.warn("유효하지 않은 리프레시 토큰:", error.message);
    } else if (error instanceof jwt.TokenExpiredError) {
      console.warn("만료된 리프레시 토큰:", error.message);
    } else {
      console.error("리프레시 토큰 검증 실패:", error);
    }
    return null;
  }
}

/**
 * 토큰에서 Bearer 프리픽스를 제거합니다.
 * @param authHeader Authorization 헤더 값
 * @returns 순수 토큰 문자열 또는 null
 */
export function extractTokenFromHeader(
  authHeader: string | null
): string | null {
  if (!authHeader) return null;

  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return null;
  }

  return parts[1];
}

/**
 * 초대 토큰을 생성합니다. (회원가입용)
 * @param email 초대받을 이메일
 * @param role 역할
 * @returns 초대 토큰
 */
export function generateInviteToken(email: string, role: string): string {
  try {
    const payload = {
      email,
      role,
      type: "invite",
      jti: uuidv4(),
    };

    const token = jwt.sign(payload, JWT_SECRET, {
      expiresIn: "7d", // 초대 토큰은 7일간 유효
      issuer: "zuku-academy",
      audience: "zuku-signup",
    });
    return token;
  } catch (error) {
    console.error("초대 토큰 생성 실패:", error);
    throw new Error("초대 토큰 생성에 실패했습니다.");
  }
}

/**
 * 초대 토큰을 검증합니다.
 * @param token 초대 토큰
 * @returns 초대 정보 또는 null
 */
export function verifyInviteToken(
  token: string
): { email: string; role: string; jti: string } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: "zuku-academy",
      audience: "zuku-signup",
    }) as jwt.JwtPayload;

    if (decoded.type !== "invite") {
      return null;
    }

    return {
      email: decoded.email,
      role: decoded.role,
      jti: decoded.jti as string,
    };
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      console.warn("유효하지 않은 초대 토큰:", error.message);
    } else if (error instanceof jwt.TokenExpiredError) {
      console.warn("만료된 초대 토큰:", error.message);
    } else {
      console.error("초대 토큰 검증 실패:", error);
    }
    return null;
  }
}
