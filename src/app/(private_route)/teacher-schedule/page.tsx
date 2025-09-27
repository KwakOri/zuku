"use client";

import TeacherClassManager from "@/components/TeacherClassManager";
import { Home, User } from "lucide-react";
import Link from "next/link";

export default function TeacherSchedulePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Home className="w-5 h-5" />
              </Link>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <User className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">
                    담당 수업 관리
                  </h1>
                  <p className="text-sm text-gray-600">
                    강사 전용 - 담당 수업의 시간표를 조정하고 학생 밀집도를
                    확인하세요
                  </p>
                </div>
              </div>
            </div>

            {/* 추가 액션 버튼들 */}
            <div className="flex items-center gap-3">
              <Link
                href="/schedule"
                className="px-4 py-2 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                전체 시간표 보기
              </Link>
              <Link
                href="/students"
                className="px-4 py-2 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                학생 관리
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <TeacherClassManager />
      </main>
    </div>
  );
}
