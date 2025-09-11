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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
          <div className="text-center">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              초대가 유효하지 않습니다
            </h2>
            <p className="text-gray-600 mb-6">
              {tokenError?.message ||
                tokenValidation?.error ||
                "초대 링크가 만료되었거나 유효하지 않습니다."}
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <GraduationCap className="w-4 h-4" />
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
          <div className="text-center">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              회원가입 완료!
            </h2>
            <p className="text-gray-600 mb-6">
              계정이 성공적으로 생성되었습니다. 이제 로그인하여 시스템을
              이용하실 수 있습니다.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              로그인하기
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            ZUKU 회원가입
          </h1>
          <p className="text-gray-600">초대받으신 계정 정보를 완성해주세요</p>
        </div>

        {/* 초대 정보 */}
        <div className="bg-blue-50 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Mail className="w-5 h-5 text-blue-600" />
            <span className="font-medium text-gray-900">
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
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              이름
            </label>
            <div className="relative">
              <User className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="실명을 입력해주세요"
                required
              />
            </div>
          </div>

          {/* 비밀번호 */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              비밀번호
            </label>
            <div className="relative">
              <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, password: e.target.value }))
                }
                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="비밀번호를 입력해주세요"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>

            {/* 비밀번호 조건 */}
            {formData.password && (
              <div className="mt-2 space-y-1">
                <div
                  className={`flex items-center gap-2 text-xs ${
                    passwordValidation.length
                      ? "text-green-600"
                      : "text-gray-400"
                  }`}
                >
                  <CheckCircle className="w-3 h-3" />
                  <span>8자 이상</span>
                </div>
                <div
                  className={`flex items-center gap-2 text-xs ${
                    passwordValidation.uppercase
                      ? "text-green-600"
                      : "text-gray-400"
                  }`}
                >
                  <CheckCircle className="w-3 h-3" />
                  <span>대문자 포함</span>
                </div>
                <div
                  className={`flex items-center gap-2 text-xs ${
                    passwordValidation.lowercase
                      ? "text-green-600"
                      : "text-gray-400"
                  }`}
                >
                  <CheckCircle className="w-3 h-3" />
                  <span>소문자 포함</span>
                </div>
                <div
                  className={`flex items-center gap-2 text-xs ${
                    passwordValidation.number
                      ? "text-green-600"
                      : "text-gray-400"
                  }`}
                >
                  <CheckCircle className="w-3 h-3" />
                  <span>숫자 포함</span>
                </div>
                <div
                  className={`flex items-center gap-2 text-xs ${
                    passwordValidation.special
                      ? "text-green-600"
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
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              비밀번호 확인
            </label>
            <div className="relative">
              <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
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
                className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  formData.confirmPassword && !passwordsMatch
                    ? "border-red-300"
                    : "border-gray-300"
                }`}
                placeholder="비밀번호를 다시 입력해주세요"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            {formData.confirmPassword && !passwordsMatch && (
              <p className="mt-1 text-sm text-red-600">
                비밀번호가 일치하지 않습니다.
              </p>
            )}
          </div>

          {/* 오류 메시지 */}
          {signupError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500" />
                <span className="text-sm text-red-700">{signupError}</span>
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
            className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {signupMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                회원가입 중...
              </>
            ) : (
              "회원가입 완료"
            )}
          </button>
        </form>

        {/* 푸터 */}
        <div className="mt-6 text-center text-sm text-gray-600">
          이미 계정이 있으신가요?{" "}
          <Link
            href="/login"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            로그인하기
          </Link>
        </div>
      </div>
    </div>
  );
}
