"use client";

import { useAuthState, useLogout } from "@/queries/useAuth";
import {
  ArrowRight,
  BarChart3,
  BookCheck,
  BookOpen,
  Calendar,
  Clock,
  GraduationCap,
  Grid3X3,
  Loader2,
  LogOut,
  MessageSquare,
  Plus,
  Settings,
  Star,
  UserCheck,
  UserPlus,
  Users,
} from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  const { isAuthenticated, user, isLoading } = useAuthState();
  const logoutMutation = useLogout();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

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
      id: "schedule",
      title: "시간표 관리",
      description:
        "드래그 앤 드롭으로 쉽게 시간표를 편집하고 관리할 수 있습니다",
      icon: Calendar,
      color: "bg-green-50 text-green-600 border-green-200",
      href: "/schedule",
      stats: "메인 시간표",
      features: ["드래그 앤 드롭", "실시간 편집", "시간표 모드", "밀집도 표시"],
    },
    {
      id: "combined-schedule",
      title: "학생별 통합 시간표",
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
      id: "teacher-schedule",
      title: "강사 수업 관리",
      description:
        "강사가 담당 수업을 선택하고 학생 밀집도를 확인하며 수업 시간을 조정할 수 있습니다",
      icon: UserCheck,
      color: "bg-cyan-50 text-cyan-600 border-cyan-200",
      href: "/teacher-schedule",
      stats: "강사 전용",
      features: [
        "담당 수업 조회",
        "학생 밀집도 표시",
        "드래그 앤 드롭 편집",
        "실시간 시간 조정",
      ],
    },
    {
      id: "create-class",
      title: "수업 개설",
      description:
        "새로운 수업을 개설하고 강사를 배정하며 학생들을 등록할 수 있습니다",
      icon: Plus,
      color: "bg-emerald-50 text-emerald-600 border-emerald-200",
      href: "/create-class",
      stats: "관리자/매니저/강사",
      features: [
        "수업 정보 설정",
        "강사 배정",
        "학생 선택 등록",
        "시간 중복 검사",
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
      id: "high-homework",
      title: "고등 숙제 검사",
      description: "고등학생들의 숙제를 체계적으로 검사하고 기록을 관리합니다",
      icon: BookCheck,
      color: "bg-orange-50 text-orange-600 border-orange-200",
      href: "/high-homework",
      stats: "조교 전용",
      features: ["숙제 범위 설정", "성취도 평가", "완성도 측정", "정확도 분석"],
    },
    {
      id: "class-scheduling",
      title: "수업 시간 추천",
      description:
        "학생들의 개인 일정을 고려하여 최적의 수업 시간을 추천합니다",
      icon: Clock,
      color: "bg-yellow-50 text-yellow-600 border-yellow-200",
      href: "/class-scheduling",
      stats: "스마트 추천",
      features: ["충돌 검사", "가용 시간 분석", "자동 추천", "공통 시간 찾기"],
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
  ];

  const stats = [
    { label: "등록 학생", value: "150+", icon: Users },
    { label: "운영 수업", value: "25+", icon: BookOpen },
    { label: "주간 기록", value: "300+", icon: BarChart3 },
    { label: "만족도", value: "98%", icon: Star },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* 헤더 */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">ZUKU</h1>
                <p className="text-sm text-gray-600">학원 관리 시스템</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {isLoading ? (
                /* 로딩 상태 */
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                  <span className="text-sm text-gray-600">확인 중...</span>
                </div>
              ) : isAuthenticated ? (
                <>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    로그아웃
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  로그인
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* 히어로 섹션 */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            스마트한 학원 관리의
            <span className="text-blue-600"> 새로운 시작</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            학생 관리부터 수업 기록, 시간표 최적화까지. 하나의 시스템으로 모든
            학원 업무를 효율적으로 관리하세요.
          </p>

          {/* 통계 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {stats.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <div
                  key={index}
                  className="bg-white rounded-lg p-6 shadow-sm border border-gray-200"
                >
                  <IconComponent className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                  <div className="text-2xl font-bold text-gray-900 mb-1">
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
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            주요 기능
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features
              .filter((feature) => {
                // 초대 관리는 관리자와 매니저만 볼 수 있음
                if (feature.id === "admin-invites") {
                  return (
                    isAuthenticated &&
                    (user?.role === "admin" || user?.role === "manager")
                  );
                }
                // 수업 개설은 관리자, 매니저, 강사만 볼 수 있음
                if (feature.id === "create-class") {
                  return (
                    isAuthenticated &&
                    (user?.role === "admin" ||
                      user?.role === "manager" ||
                      user?.role === "teacher")
                  );
                }
                return true;
              })
              .map((feature) => {
                const IconComponent = feature.icon;
                return (
                  <Link key={feature.id} href={feature.href} className="group">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 h-full hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                      {/* 아이콘과 제목 */}
                      <div className="flex items-center gap-4 mb-6">
                        <div
                          className={`w-12 h-12 rounded-lg border flex items-center justify-center ${feature.color}`}
                        >
                          <IconComponent className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">
                            {feature.title}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {feature.stats}
                          </p>
                        </div>
                      </div>

                      {/* 설명 */}
                      <p className="text-gray-600 mb-6 leading-relaxed">
                        {feature.description}
                      </p>

                      {/* 기능 목록 */}
                      <div className="space-y-3 mb-6">
                        {feature.features.map((item, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-2 text-sm text-gray-600"
                          >
                            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>

                      {/* 이동 버튼 */}
                      <div className="flex items-center gap-2 text-blue-600 font-medium group-hover:gap-3 transition-all">
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
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            빠른 시작 가이드
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="font-bold">1</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                학생 정보 등록
              </h3>
              <p className="text-sm text-gray-600">
                학생 정보를 시스템에 등록하고 개별 일정을 설정하세요
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="font-bold">2</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">시간표 설정</h3>
              <p className="text-sm text-gray-600">
                드래그 앤 드롭으로 쉽게 시간표를 구성하고 편집하세요
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="font-bold">3</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                학습 기록 관리
              </h3>
              <p className="text-sm text-gray-600">
                중등/고등별 맞춤 기록 시스템으로 학습 현황을 체계적으로
                관리하세요
              </p>
            </div>
          </div>

          <div className="text-center mt-8">
            <Link
              href="/students"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Users className="w-5 h-5" />
              학생 관리로 시작하기
            </Link>
          </div>
        </div>
      </main>

      {/* 푸터 */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="font-semibold text-gray-900">
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
