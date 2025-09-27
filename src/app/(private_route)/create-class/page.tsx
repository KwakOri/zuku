"use client";

import CreateClassForm from "@/components/CreateClassForm";
import { useAuthState } from "@/queries/useAuth";
import { ArrowLeft, Calendar, Plus } from "lucide-react";
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
      <div className="min-h-screen bg-neu-100 flex items-center justify-center p-4">
        <Card size="lg" variant="flat" className="border-warning-200 max-w-md w-full">
          <div className="text-center">
            <Icon name="alert-triangle" size="3xl" color="warning" className="mx-auto mb-4" />
            <h3 className="text-lg font-medium text-warning-900 mb-2">
              로그인이 필요합니다
            </h3>
            <p className="text-warning-600 text-sm mb-4">
              수업 개설 기능을 사용하려면 로그인해주세요.
            </p>
            <Link href="/login">
              <Button variant="primary" size="md">
                로그인하기
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  if (!hasPermission) {
    return (
      <div className="min-h-screen bg-neu-100 flex items-center justify-center p-4">
        <Card size="lg" variant="flat" className="border-error-200 max-w-md w-full">
          <div className="text-center">
            <Icon name="x-circle" size="3xl" color="error" className="mx-auto mb-4" />
            <h3 className="text-lg font-medium text-error-900 mb-2">
              접근 권한이 없습니다
            </h3>
            <p className="text-error-600 text-sm mb-4">
              수업 개설은 관리자, 매니저, 강사만 가능합니다.
            </p>
            <Link href="/">
              <Button variant="secondary" size="md">
                <ArrowLeft className="w-4 h-4 mr-2" />
                홈으로 돌아가기
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neu-100">
      {/* 헤더 */}
      <div className="bg-neu-50 border-b border-neu-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  홈으로
                </Button>
              </Link>
              <div className="h-6 w-px bg-neu-300" />
              <div className="flex items-center gap-3">
                <Avatar
                  size="md"
                  variant="flat"
                  className="bg-success-100"
                  fallback={<Icon name="plus" size="sm" color="success" />}
                />
                <div>
                  <h1 className="text-xl font-bold text-neu-900">수업 개설</h1>
                  <p className="text-sm text-neu-600">
                    새로운 수업을 만들어보세요
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Badge variant="primary" size="md">
                {user?.role === "admin"
                  ? "관리자"
                  : user?.role === "manager"
                  ? "매니저"
                  : "강사"}
              </Badge>
              <span className="text-sm text-neu-600">{user?.name}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card size="xl" className="overflow-hidden">
          {/* 페이지 헤더 */}
          <div className="bg-gradient-to-r from-success-50 to-primary-50 px-8 py-6 border-b border-neu-200">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold text-neu-900 mb-2">
                  새 수업 개설
                </h2>
                <p className="text-neu-600 max-w-2xl">
                  수업 정보를 입력하고 담당 강사와 수강 학생을 설정하여 새로운
                  수업을 개설하세요.
                </p>
              </div>
              <div className="flex items-center gap-2 text-sm text-neu-500">
                <Calendar className="w-4 h-4" />
                <span>필수 정보를 모두 입력해주세요</span>
              </div>
            </div>
          </div>

          {/* 기능 안내 카드 */}
          <div className="px-8 py-6 bg-neu-50 border-b border-neu-200">
            <h3 className="text-lg font-semibold text-neu-900 mb-4">
              수업 개설 과정
            </h3>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="flex items-center gap-3 text-sm">
                <Avatar
                  size="sm"
                  variant="flat"
                  className="bg-primary-100 text-primary-600 font-semibold"
                  fallback="1"
                />
                <div>
                  <div className="font-medium text-neu-900">기본 정보</div>
                  <div className="text-neu-600">수업명, 과목 설정</div>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Avatar
                  size="sm"
                  variant="flat"
                  className="bg-success-100 text-success-600 font-semibold"
                  fallback="2"
                />
                <div>
                  <div className="font-medium text-neu-900">시간 설정</div>
                  <div className="text-neu-600">요일, 시간 지정</div>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Avatar
                  size="sm"
                  variant="flat"
                  className="bg-secondary-100 text-secondary-600 font-semibold"
                  fallback="3"
                />
                <div>
                  <div className="font-medium text-neu-900">강사 배정</div>
                  <div className="text-neu-600">담당 강사 선택</div>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Avatar
                  size="sm"
                  variant="flat"
                  className="bg-warning-100 text-warning-600 font-semibold"
                  fallback="4"
                />
                <div>
                  <div className="font-medium text-neu-900">학생 등록</div>
                  <div className="text-neu-600">수강 학생 선택</div>
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
        </Card>
      </div>
    </div>
  );
}
