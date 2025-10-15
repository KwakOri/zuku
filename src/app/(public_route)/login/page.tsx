"use client";

import { useLogin } from "@/queries/useAuth";
import {
  AlertCircle,
  Eye,
  EyeOff,
  GraduationCap,
  Loader2,
  Lock,
  LogIn,
  Mail,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface LoginForm {
  email: string;
  password: string;
}

export default function LoginPage() {
  const router = useRouter();
  const loginMutation = useLogin();

  const [formData, setFormData] = useState<LoginForm>({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // 로그인 처리
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      return;
    }

    try {
      const result = await loginMutation.mutateAsync({
        email: formData.email,
        password: formData.password,
      });

      if (result.success) {
        // 잠시 대기하여 상태 업데이트가 완료되도록 함
        setTimeout(() => {
          router.push("/");
        }, 100);
      }
    } catch (error) {
      console.error("클라이언트: 로그인 에러", error);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gray-50">
      <div className="w-full max-w-md p-8 border-0 flat-card rounded-3xl">
        {/* 헤더 */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center w-20 h-20 mx-auto mb-6 flat-card rounded-3xl bg-gradient-to-br from-primary-500 to-primary-600">
            <GraduationCap className="w-10 h-10 text-white" />
          </div>
          <h1 className="mb-3 text-3xl font-bold text-gray-800">ZUKU 로그인</h1>
          <p className="text-gray-600">학원 관리 시스템에 로그인하세요</p>
        </div>

        {/* 로그인 폼 */}
        <form onSubmit={handleLogin} className="space-y-6">
          {/* 이메일 */}
          <div>
            <label
              htmlFor="email"
              className="block mb-3 text-sm font-medium text-gray-700"
            >
              이메일 주소
            </label>
            <div className="relative">
              <Mail className="absolute w-5 h-5 text-gray-500 transform -translate-y-1/2 left-4 top-1/2" />
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, email: e.target.value }))
                }
                className="w-full py-4 pl-12 pr-4 text-gray-800 transition-all duration-200 flat-surface rounded-2xl placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="이메일을 입력해주세요"
                required
                autoComplete="email"
              />
            </div>
          </div>

          {/* 비밀번호 */}
          <div>
            <label
              htmlFor="password"
              className="block mb-3 text-sm font-medium text-gray-700"
            >
              비밀번호
            </label>
            <div className="relative">
              <Lock className="absolute w-5 h-5 text-gray-500 transform -translate-y-1/2 left-4 top-1/2" />
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, password: e.target.value }))
                }
                className="w-full py-4 pl-12 text-gray-800 transition-all duration-200 pr-14 flat-surface rounded-2xl placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="비밀번호를 입력해주세요"
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute p-1 text-gray-500 transition-all duration-200 transform -translate-y-1/2 rounded-lg right-4 top-1/2 hover:text-gray-700 flat-card-sm"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* 옵션 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 border-gray-300 rounded text-primary-600 focus:ring-primary-500"
              />
              <label
                htmlFor="remember-me"
                className="ml-3 text-sm text-gray-600"
              >
                로그인 상태 유지
              </label>
            </div>

            <Link
              href="/forgot-password"
              className="text-sm font-medium transition-colors text-primary-600 hover:text-primary-700"
            >
              비밀번호를 잊으셨나요?
            </Link>
          </div>

          {/* 오류 메시지 */}
          {loginMutation.error && (
            <div className="p-4 flat-surface bg-error-50 rounded-2xl">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-error-500" />
                <span className="text-sm font-medium text-error-700">
                  {loginMutation.error.message || "로그인에 실패했습니다."}
                </span>
              </div>
            </div>
          )}

          {/* 로그인 버튼 */}
          <button
            type="submit"
            disabled={
              loginMutation.isPending || !formData.email || !formData.password
            }
            className="flex items-center justify-center w-full gap-3 px-6 py-4 font-medium text-white transition-all duration-200 flat-card bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl hover:from-primary-600 hover:to-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loginMutation.isPending ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                로그인 중...
              </>
            ) : (
              <>
                <LogIn className="w-5 h-5" />
                로그인
              </>
            )}
          </button>
        </form>

        {/* 테스트 계정 안내 */}
        <div className="p-5 mt-8 flat-surface bg-neu-100 rounded-2xl">
          <h3 className="mb-3 text-sm font-medium text-gray-800">
            테스트 계정
          </h3>
          <div className="space-y-2 text-sm text-gray-600">
            <p>
              <span className="font-medium">이메일:</span> admin@example.com
            </p>
            <p>
              <span className="font-medium">비밀번호:</span> password
            </p>
          </div>
        </div>

        {/* 구분선 */}
        <div className="flex items-center my-8">
          <div className="flex-1 border-t border-gray-300"></div>
          <div className="px-4 text-sm font-medium text-gray-500">또는</div>
          <div className="flex-1 border-t border-gray-300"></div>
        </div>

        {/* 추가 옵션 */}
        <div className="space-y-4 text-center">
          <p className="text-sm text-gray-600">
            계정이 없으신가요? 관리자에게 초대를 요청하세요.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-3 px-6 py-3 font-medium text-gray-700 transition-all duration-200 flat-card rounded-2xl hover:flat-pressed"
          >
            <GraduationCap className="w-5 h-5" />
            홈으로 돌아가기
          </Link>
        </div>

        {/* 푸터 */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">
            © 2024 ZUKU 학원 관리 시스템. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
