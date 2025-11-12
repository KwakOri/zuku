"use client";

import { useAuthState, useLogout } from "@/queries/useAuth";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Building2,
  GraduationCap,
  Grid3X3,
  Loader2,
  LogOut,
  MessageSquare,
  Settings,
  Star,
  UserPlus,
  Users,
  ScanLine,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function HomePage() {
  const { isAuthenticated, user, isLoading } = useAuthState();
  const logoutMutation = useLogout();
  const router = useRouter();

  // 로그인 체크: 로그인되어 있지 않으면 로그인 페이지로 리다이렉트
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  // 로딩 중이거나 인증되지 않은 경우 로딩 화면 표시
  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 mx-auto mb-4 text-primary-600 animate-spin" />
          <p className="text-gray-600">로그인 확인 중...</p>
        </div>
      </div>
    );
  }

  const features = [
    {
      id: "students",
      title: "학생 관리",
      description:
        "학생 정보를 체계적으로 관리하고 개별 일정을 편집할 수 있습니다",
      icon: GraduationCap,
      color: "bg-blue-50 text-blue-600 border-blue-200",
      href: "/students",
      stats: "전체 학생 관리",
      features: [
        "학생 정보 조회",
        "학년별 필터링",
        "검색 기능",
        "개별 일정 편집",
      ],
    },

    {
      id: "combined-schedule",
      title: "통합 시간표",
      description:
        "모든 학생의 시간표를 한눈에 보고 스크롤 시 시간대가 고정되는 향상된 뷰",
      icon: Grid3X3,
      color: "bg-indigo-50 text-indigo-600 border-indigo-200",
      href: "/combined-schedule",
      stats: "통합 뷰",
      features: [
        "학생별 일정 조회",
        "고정 타임라인",
        "세로 스크롤",
        "통합 관리",
      ],
    },
    {
      id: "classroom-schedule",
      title: "학원 수업 시간표",
      description:
        "강의실별 수업 일정을 요일과 시간대로 구분하여 한눈에 확인하세요",
      icon: Building2,
      color: "bg-teal-50 text-teal-600 border-teal-200",
      href: "/classroom-schedule",
      stats: "강의실별 뷰",
      features: [
        "1~10강의실 구분",
        "요일별 시간표",
        "수업 상세 정보",
        "학생 목록 확인",
      ],
    },
    {
      id: "class-management",
      title: "수업 관리",
      description:
        "개설된 수업들의 시간표를 설정하고 학생 밀집도를 확인하며 효율적으로 관리할 수 있습니다",
      icon: Settings,
      color: "bg-violet-50 text-violet-600 border-violet-200",
      href: "/class-management",
      stats: "관리자/매니저",
      features: [
        "수업 시간 설정",
        "학생 밀집도 확인",
        "드래그 앤 드롭 편집",
        "확정/미확정 분류",
      ],
    },
    {
      id: "middle-records",
      title: "중등 주간 기록",
      description:
        "중등학생들의 주간 학습 상태를 기록하고 학부모에게 전달합니다",
      icon: BookOpen,
      color: "bg-purple-50 text-purple-600 border-purple-200",
      href: "/middle-records",
      stats: "강사 전용",
      features: ["출석 체크", "참여도 평가", "이해도 측정", "숙제 상태"],
    },
    {
      id: "admin-invites",
      title: "초대 관리",
      description: "새로운 사용자를 초대하고 계정 권한을 관리합니다",
      icon: UserPlus,
      color: "bg-red-50 text-red-600 border-red-200",
      href: "/admin/invites",
      stats: "관리자 전용",
      features: ["사용자 초대", "권한 설정", "계정 관리", "접근 제어"],
    },
    {
      id: "notifications",
      title: "알림톡 발송",
      description: "학부모에게 학습 현황과 중요한 정보를 알림톡으로 전달합니다",
      icon: MessageSquare,
      color: "bg-emerald-50 text-emerald-600 border-emerald-200",
      href: "/notifications",
      stats: "실시간 발송",
      features: ["개별 발송", "일괄 발송", "템플릿 관리", "발송 내역"],
    },
    {
      id: "omr-grading",
      title: "OMR 자동 채점",
      description: "스캔된 OMR 답안지를 자동으로 채점하고 결과를 분석합니다",
      icon: ScanLine,
      color: "bg-orange-50 text-orange-600 border-orange-200",
      href: "/omr-grading",
      stats: "자동 채점",
      features: ["이미지 자동 처리", "자동 채점", "통계 분석", "CSV 다운로드"],
    },
    {
      id: "omr-python-grading",
      title: "AI OMR 채점",
      description: "Python AI 모델로 고정밀 이미지 정렬과 채점을 수행합니다",
      icon: Sparkles,
      color: "bg-cyan-50 text-cyan-600 border-cyan-200",
      href: "/omr-python-grading",
      stats: "AI 고정밀 채점",
      features: ["자동 이미지 정렬", "배치 채점", "고정밀 인식", "실시간 결과"],
    },
  ];

  const stats = [
    { label: "등록 학생", value: "150+", icon: Users },
    { label: "운영 수업", value: "25+", icon: BookOpen },
    { label: "주간 기록", value: "300+", icon: BarChart3 },
    { label: "만족도", value: "98%", icon: Star },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="border-0 shadow-sm flat-surface bg-gray-50">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 flat-card rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">ZUKU</h1>
                <p className="text-sm text-gray-600">학원 관리 시스템</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {isLoading ? (
                /* 로딩 상태 */
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 text-primary-600 animate-spin" />
                  <span className="text-sm text-gray-600">확인 중...</span>
                </div>
              ) : isAuthenticated ? (
                <>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2 text-gray-700 transition-all duration-200 flat-card bg-gradient-to-r from-neu-200 to-neu-300 rounded-2xl hover:flat-pressed"
                  >
                    <LogOut className="w-4 h-4" />
                    로그아웃
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/glassmorphism-test"
                    className="px-4 py-2 text-white transition-all duration-200 flat-card bg-gradient-to-r from-green-500 to-green-600 rounded-2xl hover:from-green-600 hover:to-green-700"
                  >
                    Glass Demo
                  </Link>
                  <Link
                    href="/login"
                    className="px-4 py-2 text-white transition-all duration-200 flat-card bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl hover:from-primary-600 hover:to-primary-700"
                  >
                    로그인
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="px-4 py-12 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {/* 히어로 섹션 */}
        <div className="mb-16 text-center">
          <h1 className="mb-6 text-4xl font-bold text-gray-800 md:text-5xl">
            스마트한 학원 관리의
            <span className="text-primary-600"> 새로운 시작</span>
          </h1>
          <p className="max-w-3xl mx-auto mb-8 text-xl text-gray-600">
            학생 관리부터 수업 기록, 시간표 최적화까지. 하나의 시스템으로 모든
            학원 업무를 효율적으로 관리하세요.
          </p>

          {/* 통계 */}
          <div className="grid max-w-4xl grid-cols-2 gap-6 mx-auto md:grid-cols-4">
            {stats.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <div
                  key={index}
                  className="p-6 transition-all duration-300 border-0 flat-card rounded-2xl shadow-neu-lg hover:shadow-neu-xl hover:-translate-y-1"
                >
                  <IconComponent className="w-8 h-8 mx-auto mb-3 text-primary-600" />
                  <div className="mb-1 text-2xl font-bold text-gray-800">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 기능 카드 */}
        <div className="mb-16">
          <h2 className="mb-12 text-3xl font-bold text-center text-gray-800">
            주요 기능
          </h2>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {features
              .filter((feature) => {
                // 초대 관리는 관리자와 매니저만 볼 수 있음
                if (feature.id === "admin-invites") {
                  return (
                    isAuthenticated &&
                    (user?.role === "admin" || user?.role === "manager")
                  );
                }
                return true;
              })
              .map((feature) => {
                const IconComponent = feature.icon;
                return (
                  <Link key={feature.id} href={feature.href} className="group">
                    <div className="h-full p-8 transition-all duration-300 border-0 flat-card rounded-3xl shadow-neu-lg hover:shadow-neu-xl hover:flat-pressed hover:-translate-y-2">
                      {/* 아이콘과 제목 */}
                      <div className="flex items-center gap-4 mb-6">
                        <div className="flex items-center justify-center w-12 h-12 shadow-sm rounded-xl bg-gradient-to-br from-primary-500 to-primary-600">
                          <IconComponent className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-800">
                            {feature.title}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {feature.stats}
                          </p>
                        </div>
                      </div>

                      {/* 설명 */}
                      <p className="mb-6 leading-relaxed text-gray-600">
                        {feature.description}
                      </p>

                      {/* 기능 목록 */}
                      <div className="mb-6 space-y-3">
                        {feature.features.map((item, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-2 text-sm text-gray-600"
                          >
                            <div className="w-1.5 h-1.5 bg-primary-400 rounded-full" />
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>

                      {/* 이동 버튼 */}
                      <div className="flex items-center gap-2 font-medium transition-all text-primary-600 group-hover:gap-3">
                        <span>자세히 보기</span>
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </Link>
                );
              })}
          </div>
        </div>

        {/* 빠른 시작 가이드 */}
        <div className="p-8 border-0 flat-card rounded-3xl shadow-neu-lg">
          <h2 className="mb-6 text-2xl font-bold text-center text-gray-800">
            빠른 시작 가이드
          </h2>

          <div className="grid gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 text-white rounded-full shadow-md bg-gradient-to-br from-primary-500 to-primary-600">
                <span className="font-bold">1</span>
              </div>
              <h3 className="mb-2 font-semibold text-gray-800">
                학생 정보 등록
              </h3>
              <p className="text-sm text-gray-600">
                학생 정보를 시스템에 등록하고 개별 일정을 설정하세요
              </p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 text-white rounded-full shadow-md bg-gradient-to-br from-success-500 to-success-600">
                <span className="font-bold">2</span>
              </div>
              <h3 className="mb-2 font-semibold text-gray-800">시간표 설정</h3>
              <p className="text-sm text-gray-600">
                드래그 앤 드롭으로 쉽게 시간표를 구성하고 편집하세요
              </p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 text-white rounded-full shadow-md bg-gradient-to-br from-success-500 to-success-600">
                <span className="font-bold">3</span>
              </div>
              <h3 className="mb-2 font-semibold text-gray-800">
                학습 기록 관리
              </h3>
              <p className="text-sm text-gray-600">
                중등/고등별 맞춤 기록 시스템으로 학습 현황을 체계적으로
                관리하세요
              </p>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/students"
              className="inline-flex items-center gap-2 px-6 py-3 text-white transition-all duration-200 flat-card bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl hover:from-primary-600 hover:to-primary-700"
            >
              <Users className="w-5 h-5" />
              학생 관리로 시작하기
            </Link>
            <Link
              href="/omr-python-grading"
              className="inline-flex items-center gap-2 px-6 py-3 text-white transition-all duration-200 flat-card bg-gradient-to-r from-cyan-500 to-cyan-600 rounded-2xl hover:from-cyan-600 hover:to-cyan-700"
            >
              <Sparkles className="w-5 h-5" />
              AI OMR 채점
            </Link>
            <Link
              href="/omr-grading"
              className="inline-flex items-center gap-2 px-6 py-3 text-white transition-all duration-200 flat-card bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl hover:from-orange-600 hover:to-orange-700"
            >
              <ScanLine className="w-5 h-5" />
              OMR 자동 채점
            </Link>
          </div>
        </div>
      </main>

      {/* 푸터 */}
      <footer className="mt-16 border-0 flat-surface bg-gray-50">
        <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 flat-card rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="font-semibold text-gray-800">
                  ZUKU 학원 관리 시스템
                </div>
                <div className="text-sm text-gray-600">
                  효율적인 학원 운영의 파트너
                </div>
              </div>
            </div>

            <div className="text-sm text-gray-500">
              © 2024 ZUKU. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
