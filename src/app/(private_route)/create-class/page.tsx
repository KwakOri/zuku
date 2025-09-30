"use client";

import CreateClassForm from "@/components/create-class/CreateClassForm";
import { useAuthState } from "@/queries/useAuth";
import { Home, Calendar, Plus } from "lucide-react";
import Link from "next/link";
import { Card, Button, Icon, Badge, Avatar } from "@/components/design-system";

export default function CreateClassPage() {
  const { user, isAuthenticated } = useAuthState();

  // 권한 체크 - admin, manager, teacher만 접근 가능
  const hasPermission =
    isAuthenticated &&
    user &&
    ["admin", "manager", "teacher"].includes(user.role);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="flat-card rounded-2xl border-0 p-8 max-w-md w-full">
          <div className="text-center">
            <div className="p-3 bg-gradient-to-br from-warning-500 to-warning-600 rounded-xl mx-auto mb-4 w-fit shadow-md">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">
              로그인이 필요합니다
            </h3>
            <p className="text-gray-600 text-sm mb-6">
              수업 개설 기능을 사용하려면 로그인해주세요.
            </p>
            <Link href="/login">
              <button className="px-6 py-2 flat-card bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-2xl hover:from-primary-600 hover:to-primary-700 transition-all duration-200">
                로그인하기
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!hasPermission) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="flat-card rounded-2xl border-0 p-8 max-w-md w-full">
          <div className="text-center">
            <div className="p-3 bg-gradient-to-br from-error-500 to-error-600 rounded-xl mx-auto mb-4 w-fit shadow-md">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">
              접근 권한이 없습니다
            </h3>
            <p className="text-gray-600 text-sm mb-6">
              수업 개설은 관리자, 매니저, 강사만 가능합니다.
            </p>
            <Link href="/">
              <button className="flex items-center gap-2 px-6 py-2 flat-card text-gray-600 rounded-2xl hover:text-gray-700 hover:flat-pressed transition-all duration-200">
                <Home className="w-4 h-4" />
                홈으로 돌아가기
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="flat-surface bg-gray-50 border-0 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="p-2 flat-card text-gray-500 hover:text-gray-700 rounded-2xl hover:flat-pressed transition-all duration-200"
              >
                <Home className="w-5 h-5" />
              </Link>

              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl shadow-md">
                  <Plus className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-800">수업 개설</h1>
                  <p className="text-sm text-gray-600">
                    새로운 수업을 만들어보세요
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="px-3 py-1 flat-card bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-2xl text-sm font-medium">
                {user?.role === "admin"
                  ? "관리자"
                  : user?.role === "manager"
                  ? "매니저"
                  : "강사"}
              </div>
              <span className="text-sm text-gray-600">{user?.name}</span>
            </div>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flat-card rounded-2xl border-0 overflow-hidden">
          {/* 페이지 헤더 */}
          <div className="flat-surface bg-gradient-to-r from-success-50 to-primary-50 px-8 py-6 border-0">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  새 수업 개설
                </h2>
                <p className="text-gray-600 max-w-2xl">
                  수업 정보를 입력하고 담당 강사와 수강 학생을 설정하여 새로운
                  수업을 개설하세요.
                </p>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Calendar className="w-4 h-4" />
                <span>필수 정보를 모두 입력해주세요</span>
              </div>
            </div>
          </div>

          {/* 기능 안내 카드 */}
          <div className="px-8 py-6 bg-neu-100 border border-neu-200 mx-8 my-6 rounded-xl">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              수업 개설 과정
            </h3>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 text-white rounded-lg flex items-center justify-center font-semibold shadow-sm">
                  1
                </div>
                <div>
                  <div className="font-medium text-gray-800">기본 정보</div>
                  <div className="text-gray-600">수업명, 과목 설정</div>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 bg-gradient-to-br from-success-500 to-success-600 text-white rounded-lg flex items-center justify-center font-semibold shadow-sm">
                  2
                </div>
                <div>
                  <div className="font-medium text-gray-800">시간 설정</div>
                  <div className="text-gray-600">요일, 시간 지정</div>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 bg-gradient-to-br from-secondary-500 to-secondary-600 text-white rounded-lg flex items-center justify-center font-semibold shadow-sm">
                  3
                </div>
                <div>
                  <div className="font-medium text-gray-800">강사 배정</div>
                  <div className="text-gray-600">담당 강사 선택</div>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 bg-gradient-to-br from-warning-500 to-warning-600 text-white rounded-lg flex items-center justify-center font-semibold shadow-sm">
                  4
                </div>
                <div>
                  <div className="font-medium text-gray-800">학생 등록</div>
                  <div className="text-gray-600">수강 학생 선택</div>
                </div>
              </div>
            </div>
          </div>

          {/* 수업 개설 폼 */}
          <div className="p-8">
            <CreateClassForm
              userRole={user?.role || "teacher"}
              userId={user?.id || ""}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
