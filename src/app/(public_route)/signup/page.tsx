"use client";

import { useSignup, useValidateInviteToken } from "@/queries/useAuth";
import { SignupRequest } from "@/services/client/authApi";
import {
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
  GraduationCap,
  Loader2,
  Lock,
  Mail,
  User,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

interface TokenValidation {
  valid: boolean;
  email?: string;
  role?: string;
  inviterName?: string;
  error?: string;
  loading: boolean;
}

interface SignupForm {
  name: string;
  password: string;
  confirmPassword: string;
}

interface PasswordValidation {
  length: boolean;
  uppercase: boolean;
  lowercase: boolean;
  number: boolean;
  special: boolean;
}

export default function SignupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  // React Query 훅 사용
  const {
    data: tokenValidation,
    isLoading: tokenLoading,
    error: tokenError,
  } = useValidateInviteToken(token);
  const signupMutation = useSignup();

  const [formData, setFormData] = useState<SignupForm>({
    name: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [signupError, setSignupError] = useState<string>("");
  const [signupSuccess, setSignupSuccess] = useState(false);

  // 비밀번호 유효성 검사
  const validatePassword = (password: string): PasswordValidation => {
    return {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
    };
  };

  const passwordValidation = validatePassword(formData.password);
  const isPasswordValid = Object.values(passwordValidation).every(Boolean);
  const passwordsMatch = formData.password === formData.confirmPassword;

  // 역할 표시명 변환
  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case "admin":
        return "관리자";
      case "manager":
        return "매니저";
      case "teacher":
        return "강사";
      case "assistant":
        return "조교";
      default:
        return "사용자";
    }
  };

  // 회원가입 처리
  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isPasswordValid || !passwordsMatch || !token) {
      return;
    }

    const signupData: SignupRequest = {
      email: tokenValidation?.email || "",
      password: formData.password,
      name: formData.name,
      inviteToken: token,
    };

    signupMutation.mutate(signupData, {
      onSuccess: () => {
        setSignupSuccess(true);
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      },
      onError: (error) => {
        setSignupError(error.message || "회원가입 중 오류가 발생했습니다.");
      },
    });
  };

  // 로딩 중
  if (tokenLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flat-card rounded-3xl p-8 w-full max-w-md border-0">
          <div className="text-center">
            <Loader2 className="w-8 h-8 text-primary-600 animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              초대 확인 중
            </h2>
            <p className="text-gray-600">초대 정보를 확인하고 있습니다...</p>
          </div>
        </div>
      </div>
    );
  }

  // 토큰이 유효하지 않은 경우
  if (!tokenValidation?.success || tokenError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flat-card rounded-3xl p-8 w-full max-w-md border-0">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-error-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              초대가 유효하지 않습니다
            </h2>
            <p className="text-gray-600 mb-6">
              {tokenError?.message ||
                tokenValidation?.error ||
                "초대 링크가 만료되었거나 유효하지 않습니다."}
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 flat-card bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-2xl hover:from-primary-600 hover:to-primary-700 transition-all duration-200"
            >
              <GraduationCap className="w-5 h-5" />
              홈으로 돌아가기
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 회원가입 성공
  if (signupSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flat-card rounded-3xl p-8 w-full max-w-md border-0">
          <div className="text-center">
            <CheckCircle className="w-12 h-12 text-success-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              회원가입 완료!
            </h2>
            <p className="text-gray-600 mb-6">
              계정이 성공적으로 생성되었습니다. 이제 로그인하여 시스템을
              이용하실 수 있습니다.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-6 py-3 flat-card bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-2xl hover:from-primary-600 hover:to-primary-700 transition-all duration-200"
            >
              로그인하기
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="flat-card rounded-3xl p-8 w-full max-w-md border-0">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 flat-card rounded-3xl flex items-center justify-center mx-auto mb-6 bg-gradient-to-br from-primary-500 to-primary-600">
            <GraduationCap className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-3">
            ZUKU 회원가입
          </h1>
          <p className="text-gray-600">초대받으신 계정 정보를 완성해주세요</p>
        </div>

        {/* 초대 정보 */}
        <div className="flat-surface bg-primary-50 rounded-2xl p-5 mb-8">
          <div className="flex items-center gap-3 mb-3">
            <Mail className="w-5 h-5 text-primary-600" />
            <span className="font-medium text-gray-800">
              {tokenValidation?.email}
            </span>
          </div>
          <div className="text-sm text-gray-600">
            관리자님이 {getRoleDisplayName(tokenValidation?.role || "")}로
            초대하셨습니다.
          </div>
        </div>

        {/* 회원가입 폼 */}
        <form onSubmit={handleSignup} className="space-y-6">
          {/* 이름 */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-3"
            >
              이름
            </label>
            <div className="relative">
              <User className="w-5 h-5 text-gray-500 absolute left-4 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                className="w-full pl-12 pr-4 py-4 flat-surface rounded-2xl text-gray-800 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-200"
                placeholder="실명을 입력해주세요"
                required
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

            {/* 비밀번호 조건 */}
            {formData.password && (
              <div className="mt-2 space-y-1">
                <div
                  className={`flex items-center gap-2 text-xs ${
                    passwordValidation.length
                      ? "text-success-600"
                      : "text-gray-400"
                  }`}
                >
                  <CheckCircle className="w-3 h-3" />
                  <span>8자 이상</span>
                </div>
                <div
                  className={`flex items-center gap-2 text-xs ${
                    passwordValidation.uppercase
                      ? "text-success-600"
                      : "text-gray-400"
                  }`}
                >
                  <CheckCircle className="w-3 h-3" />
                  <span>대문자 포함</span>
                </div>
                <div
                  className={`flex items-center gap-2 text-xs ${
                    passwordValidation.lowercase
                      ? "text-success-600"
                      : "text-gray-400"
                  }`}
                >
                  <CheckCircle className="w-3 h-3" />
                  <span>소문자 포함</span>
                </div>
                <div
                  className={`flex items-center gap-2 text-xs ${
                    passwordValidation.number
                      ? "text-success-600"
                      : "text-gray-400"
                  }`}
                >
                  <CheckCircle className="w-3 h-3" />
                  <span>숫자 포함</span>
                </div>
                <div
                  className={`flex items-center gap-2 text-xs ${
                    passwordValidation.special
                      ? "text-success-600"
                      : "text-gray-400"
                  }`}
                >
                  <CheckCircle className="w-3 h-3" />
                  <span>특수문자 포함</span>
                </div>
              </div>
            )}
          </div>

          {/* 비밀번호 확인 */}
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700 mb-3"
            >
              비밀번호 확인
            </label>
            <div className="relative">
              <Lock className="w-5 h-5 text-gray-500 absolute left-4 top-1/2 transform -translate-y-1/2" />
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    confirmPassword: e.target.value,
                  }))
                }
                className={`w-full pl-12 pr-14 py-4 flat-surface rounded-2xl text-gray-800 placeholder:text-gray-500 focus:outline-none focus:ring-2 transition-all duration-200 ${
                  formData.confirmPassword && !passwordsMatch
                    ? "focus:ring-error-500"
                    : "focus:ring-primary-500"
                }`}
                placeholder="비밀번호를 다시 입력해주세요"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 flat-card-sm p-1 rounded-lg transition-all duration-200"
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            {formData.confirmPassword && !passwordsMatch && (
              <p className="mt-2 text-sm text-error-600 font-medium">
                비밀번호가 일치하지 않습니다.
              </p>
            )}
          </div>

          {/* 오류 메시지 */}
          {signupError && (
            <div className="flat-surface bg-error-50 rounded-2xl p-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-error-500" />
                <span className="text-sm text-error-700 font-medium">{signupError}</span>
              </div>
            </div>
          )}

          {/* 회원가입 버튼 */}
          <button
            type="submit"
            disabled={
              !formData.name ||
              !isPasswordValid ||
              !passwordsMatch ||
              signupMutation.isPending
            }
            className="w-full py-4 px-6 flat-card bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-2xl hover:from-primary-600 hover:to-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-3 font-medium"
          >
            {signupMutation.isPending ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                회원가입 중...
              </>
            ) : (
              "회원가입 완료"
            )}
          </button>
        </form>

        {/* 푸터 */}
        <div className="mt-8 text-center text-sm text-gray-600">
          이미 계정이 있으신가요?{" "}
          <Link
            href="/login"
            className="text-primary-600 hover:text-primary-700 font-medium transition-colors"
          >
            로그인하기
          </Link>
        </div>
      </div>
    </div>
  );
}
