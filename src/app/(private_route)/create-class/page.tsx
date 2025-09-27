"use client";

import CreateClassForm from "@/components/CreateClassForm";
import { useAuthState } from "@/queries/useAuth";
import { ArrowLeft, Calendar, Plus } from "lucide-react";
import Link from "next/link";

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
        <div className="bg-white rounded-lg border border-yellow-200 p-8 max-w-md w-full">
          <div className="text-center">
            <div className="text-yellow-600 mb-4 text-4xl">⚠️</div>
            <h3 className="text-lg font-medium text-yellow-900 mb-2">
              로그인이 필요합니다
            </h3>
            <p className="text-yellow-600 text-sm mb-4">
              수업 개설 기능을 사용하려면 로그인해주세요.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              로그인하기
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!hasPermission) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg border border-red-200 p-8 max-w-md w-full">
          <div className="text-center">
            <div className="text-red-600 mb-4 text-4xl">🚫</div>
            <h3 className="text-lg font-medium text-red-900 mb-2">
              접근 권한이 없습니다
            </h3>
            <p className="text-red-600 text-sm mb-4">
              수업 개설은 관리자, 매니저, 강사만 가능합니다.
            </p>
            <Link
              href="/"
              className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              홈으로 돌아가기
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>홈으로</span>
              </Link>
              <div className="h-6 w-px bg-gray-300" />
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-100 text-green-600 rounded-lg flex items-center justify-center">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">수업 개설</h1>
                  <p className="text-sm text-gray-600">
                    새로운 수업을 만들어보세요
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
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
      </div>

      {/* 메인 콘텐츠 */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* 페이지 헤더 */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 px-8 py-6 border-b border-gray-200">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
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
          <div className="px-8 py-6 bg-gray-50 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              수업 개설 과정
            </h3>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold">
                  1
                </div>
                <div>
                  <div className="font-medium text-gray-900">기본 정보</div>
                  <div className="text-gray-600">수업명, 과목 설정</div>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-semibold">
                  2
                </div>
                <div>
                  <div className="font-medium text-gray-900">시간 설정</div>
                  <div className="text-gray-600">요일, 시간 지정</div>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center font-semibold">
                  3
                </div>
                <div>
                  <div className="font-medium text-gray-900">강사 배정</div>
                  <div className="text-gray-600">담당 강사 선택</div>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center font-semibold">
                  4
                </div>
                <div>
                  <div className="font-medium text-gray-900">학생 등록</div>
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
