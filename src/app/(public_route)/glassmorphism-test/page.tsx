"use client";

import Link from "next/link";
import { ArrowLeft, Sparkles, Users, Calendar, BookOpen, Target } from "lucide-react";

export default function GlassmorphismTestPage() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* 배경 이미지 */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/glass_bg.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center center',
          backgroundAttachment: 'fixed'
        }}
      />

      {/* 추가 배경 레이어 (더 나은 대비를 위해) */}
      <div className="absolute inset-0 bg-gradient-to-r from-white/5 via-transparent to-purple/5" />

      {/* 오버레이 */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/5 via-transparent to-black/10" />

      {/* 메인 콘텐츠 */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* 헤더 */}
        <header className="p-6">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            {/* 로고 */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <span className="text-white font-bold text-xl">ZUKU</span>
            </div>

            {/* 네비게이션 */}
            <nav className="hidden md:flex items-center gap-8">
              <a href="#" className="text-white/80 hover:text-white transition-colors">HOME</a>
              <a href="#" className="text-white/80 hover:text-white transition-colors">ABOUT</a>
              <a href="#" className="text-white/80 hover:text-white transition-colors">CLASSES</a>
              <a href="#" className="text-white/80 hover:text-white transition-colors">SCHEDULE</a>
              <a href="#" className="text-white/80 hover:text-white transition-colors">CONTACT</a>
            </nav>

            {/* 뒤로가기 버튼 */}
            <Link
              href="/"
              className="px-4 py-2 bg-white/20 backdrop-blur-md border border-white/30 rounded-full text-white hover:bg-white/30 transition-all duration-300"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </div>
        </header>

        {/* 메인 섹션 */}
        <main className="flex-1 flex items-center justify-center px-6">
          {/* 메인 글래스 컨테이너 */}
          <div className="w-full max-w-7xl mx-auto bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 lg:p-12 shadow-2xl">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* 좌측 콘텐츠 */}
              <div className="text-center lg:text-left">
                <div className="inline-block px-6 py-3 bg-white/15 backdrop-blur-md border border-white/20 rounded-full text-white text-sm font-medium mb-8 shadow-lg">
                  3D GLASSMORPHISM
                </div>

                <h1 className="text-5xl lg:text-6xl font-bold text-white mb-8 leading-tight drop-shadow-lg">
                  SMART
                  <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-300 to-gray-400">
                    ACADEMY
                  </span>
                </h1>

                <p className="text-white/90 text-lg mb-10 leading-relaxed drop-shadow-md">
                  혁신적인 학습 관리 시스템으로 학생들의 성장을 도우며,
                  <br />
                  미래 지향적인 교육 환경을 제공합니다.
                </p>

                <button className="px-10 py-4 bg-white/15 backdrop-blur-md border border-white/20 rounded-full text-white font-semibold hover:bg-white/25 hover:scale-105 transition-all duration-300 shadow-lg">
                  EXPLORE MORE
                </button>
              </div>

              {/* 우측 글래스 카드 */}
              <div className="space-y-6">
                {/* 메인 카드 */}
                <div className="bg-white/8 backdrop-blur-lg border border-white/15 rounded-3xl p-8 hover:bg-white/12 transition-all duration-500 hover:scale-[1.02] shadow-xl">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg" style={{ background: 'linear-gradient(135deg, #2d2d2d, #1a1a1a)' }}>
                      <Users className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-xl drop-shadow-md">학생 관리</h3>
                      <p className="text-white/80">Student Management</p>
                    </div>
                  </div>
                  <p className="text-white/90 leading-relaxed mb-6">
                    개별 학생의 성장 과정을 체계적으로 관리하고 추적할 수 있는 종합적인 학생 관리 시스템
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300 font-semibold drop-shadow-sm">Active Students: 156</span>
                    <div className="w-3 h-3 bg-gray-400 rounded-full animate-pulse shadow-lg shadow-gray-400/50"></div>
                  </div>
                </div>

                {/* 서브 카드들 */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/8 backdrop-blur-lg border border-white/15 rounded-2xl p-6 hover:bg-white/12 transition-all duration-300 hover:scale-[1.02] shadow-lg">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 shadow-lg" style={{ background: 'linear-gradient(135deg, #404040, #2d2d2d)' }}>
                      <Calendar className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="text-white font-semibold mb-2 drop-shadow-sm">시간표</h4>
                    <p className="text-white/80 text-sm">스마트 스케줄링</p>
                  </div>

                  <div className="bg-white/8 backdrop-blur-lg border border-white/15 rounded-2xl p-6 hover:bg-white/12 transition-all duration-300 hover:scale-[1.02] shadow-lg">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 shadow-lg" style={{ background: 'linear-gradient(135deg, #505050, #2d2d2d)' }}>
                      <BookOpen className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="text-white font-semibold mb-2 drop-shadow-sm">수업 관리</h4>
                    <p className="text-white/80 text-sm">클래스 운영</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* 플로팅 액센트 요소들 */}
        <div className="absolute top-20 left-10 w-4 h-4 bg-white/30 rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-20 w-6 h-6 bg-gray-300/40 rounded-full animate-bounce" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-32 left-16 w-3 h-3 bg-gray-400/50 rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-20 right-32 w-5 h-5 bg-gray-500/40 rounded-full animate-bounce" style={{ animationDelay: '0.5s' }}></div>

        {/* 하단 인디케이터 */}
        <div className="p-6">
          <div className="max-w-7xl mx-auto flex justify-center">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-white rounded-full"></div>
              <div className="w-6 h-2 bg-white/50 rounded-full"></div>
              <div className="w-2 h-2 bg-white/30 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}