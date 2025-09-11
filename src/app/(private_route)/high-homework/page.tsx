import Link from "next/link";
import HighSchoolHomeworkManager from "@/components/HighSchoolHomeworkManager";
import { Home } from "lucide-react";

export default function HighHomeworkPage() {
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
                <h1 className="text-xl font-bold text-gray-900">고등 숙제 검사 관리</h1>
                <p className="text-sm text-gray-600">고등학생들의 숙제를 체계적으로 검사하고 기록하세요</p>
              </div>
            </div>

            {/* 추가 액션 버튼들 */}
            <div className="flex items-center gap-3">
              <Link
                href="/middle-records"
                className="px-4 py-2 text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
              >
                중등 주간 기록
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
        <HighSchoolHomeworkManager />
      </main>
    </div>
  );
}