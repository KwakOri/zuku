import Link from "next/link";
import ClassSchedulingSuggester from "@/components/class-scheduling/ClassSchedulingSuggester";
import { Home, Brain } from "lucide-react";

export default function ClassSchedulingPage() {
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
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-800">수업 시간 추천</h1>
                  <p className="text-sm text-gray-600">학생들의 개인 일정을 고려하여 최적의 수업 시간을 찾으세요</p>
                </div>
              </div>
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