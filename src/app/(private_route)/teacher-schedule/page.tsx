"use client";

import TeacherClassManager from "@/components/class-management/TeacherClassManager";
import { Home, User } from "lucide-react";
import Link from "next/link";

export default function TeacherSchedulePage() {
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
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-800">
                    담당 수업 관리
                  </h1>
                  <p className="text-sm text-gray-600">
                    강사 전용 - 담당 수업의 시간표를 조정하고 학생 밀집도를
                    확인하세요
                  </p>
                </div>
              </div>
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
