import { verifyAccessToken } from "@/lib/auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { accessToken } = body;

    if (!accessToken) {
      return NextResponse.json(
        {
          success: false,
          error: "토큰이 제공되지 않았습니다.",
        },
        { status: 400 }
      );
    }

    // JWT 토큰 검증
    const payload = verifyAccessToken(accessToken);

    if (!payload) {
      return NextResponse.json(
        {
          success: false,
          error: "유효하지 않은 토큰입니다.",
          isExpired: true,
        },
        { status: 401 }
      );
    }

    // 토큰이 유효한 경우 사용자 정보 반환
    return NextResponse.json({
      success: true,
      user: {
        userId: payload.userId,
        email: payload.email,
        name: payload.name,
        role: payload.role,
      },
      isValid: true,
      expiresAt: payload.exp ? new Date(payload.exp * 1000).toISOString() : null,
    });
  } catch (error) {
    console.error("토큰 검증 API 오류:", error);
    return NextResponse.json(
      {
        success: false,
        error: "토큰 검증 중 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}