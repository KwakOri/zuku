"use client";

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
import { useLogin } from "@/queries/useAuth";

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

    console.log("클라이언트: 로그인 시도", {
      email: formData.email,
      passwordLength: formData.password.length,
    });

    try {
      const result = await loginMutation.mutateAsync({
        email: formData.email,
        password: formData.password,
      });

      console.log("클라이언트: 로그인 결과", result);

      if (result.success) {
        console.log("클라이언트: 로그인 성공, 잠시 대기 후 홈으로 리디렉트");
        // 잠시 대기하여 상태 업데이트가 완료되도록 함
        setTimeout(() => {
          console.log("클라이언트: 리다이렉트 실행");
          router.push("/");
        }, 100);
      }
    } catch (error) {
      console.error("클라이언트: 로그인 에러", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="flat-card rounded-3xl p-8 w-full max-w-md border-0">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 flat-card rounded-3xl flex items-center justify-center mx-auto mb-6 bg-gradient-to-br from-primary-500 to-primary-600">
            <GraduationCap className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-3">ZUKU 로그인</h1>
          <p className="text-gray-600">학원 관리 시스템에 로그인하세요</p>
        </div>

        {/* 로그인 폼 */}
        <form onSubmit={handleLogin} className="space-y-6">
          {/* 이메일 */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-3"
            >
              이메일 주소
            </label>
            <div className="relative">
              <Mail className="w-5 h-5 text-gray-500 absolute left-4 top-1/2 transform -translate-y-1/2" />
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, email: e.target.value }))
                }
                className="w-full pl-12 pr-4 py-4 flat-surface rounded-2xl text-gray-800 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-200"
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
              className="block text-sm font-medium text-gray-700 mb-3"
            >
              비밀번호
            </label>
            <div className="relative">
              <Lock className="w-5 h-5 text-gray-500 absolute left-4 top-1/2 transform -translate-y-1/2" />
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, password: e.target.value }))
                }
                className="w-full pl-12 pr-14 py-4 flat-surface rounded-2xl text-gray-800 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-200"
                placeholder="비밀번호를 입력해주세요"
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 flat-card-sm p-1 rounded-lg transition-all duration-200"
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
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
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
              className="text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors"
            >
              비밀번호를 잊으셨나요?
            </Link>
          </div>

          {/* 오류 메시지 */}
          {loginMutation.error && (
            <div className="flat-surface bg-error-50 rounded-2xl p-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-error-500" />
                <span className="text-sm text-error-700 font-medium">
                  {loginMutation.error.message || "로그인에 실패했습니다."}
                </span>
              </div>
            </div>
          )}

          {/* 로그인 버튼 */}
          <button
            type="submit"
            disabled={loginMutation.isPending || !formData.email || !formData.password}
            className="w-full py-4 px-6 flat-card bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-2xl hover:from-primary-600 hover:to-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-3 font-medium"
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
        <div className="mt-8 flat-surface bg-neu-100 rounded-2xl p-5">
          <h3 className="text-sm font-medium text-gray-800 mb-3">
            테스트 계정
          </h3>
          <div className="text-sm text-gray-600 space-y-2">
            <p><span className="font-medium">이메일:</span> admin@example.com</p>
            <p><span className="font-medium">비밀번호:</span> password</p>
          </div>
        </div>

        {/* 구분선 */}
        <div className="my-8 flex items-center">
          <div className="flex-1 border-t border-gray-300"></div>
          <div className="px-4 text-sm text-gray-500 font-medium">또는</div>
          <div className="flex-1 border-t border-gray-300"></div>
        </div>

        {/* 추가 옵션 */}
        <div className="text-center space-y-4">
          <p className="text-sm text-gray-600">
            계정이 없으신가요? 관리자에게 초대를 요청하세요.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-3 px-6 py-3 flat-card text-gray-700 rounded-2xl hover:flat-pressed transition-all duration-200 font-medium"
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
