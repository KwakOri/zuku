import Link from "next/link";
import ClassSchedulingSuggester from "@/components/ClassSchedulingSuggester";
import { Home } from "lucide-react";

export default function ClassSchedulingPage() {
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

              <div>
                <h1 className="text-xl font-bold text-gray-900">수업 시간 추천</h1>
                <p className="text-sm text-gray-600">학생들의 개인 일정을 고려하여 최적의 수업 시간을 찾으세요</p>
              </div>
            </div>

            {/* 추가 액션 버튼들 */}
            <div className="flex items-center gap-3">
              <Link
                href="/schedule"
                className="px-4 py-2 text-green-600 border border-green-200 rounded-lg hover:bg-green-50 transition-colors"
              >
                시간표 관리
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
        <ClassSchedulingSuggester />
      </main>
    </div>
  );
}