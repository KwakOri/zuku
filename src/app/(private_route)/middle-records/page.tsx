import Link from "next/link";
import MiddleSchoolRecordManager from "@/components/MiddleSchoolRecordManager";
import { Home } from "lucide-react";

export default function MiddleRecordsPage() {
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
                <h1 className="text-xl font-bold text-gray-900">중등 주간 기록 관리</h1>
                <p className="text-sm text-gray-600">중등학생들의 주간 학습 상태를 기록하고 관리하세요</p>
              </div>
            </div>

            {/* 추가 액션 버튼들 */}
            <div className="flex items-center gap-3">
              <Link
                href="/high-homework"
                className="px-4 py-2 text-purple-600 border border-purple-200 rounded-lg hover:bg-purple-50 transition-colors"
              >
                고등 숙제 검사
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
        <MiddleSchoolRecordManager />
      </main>
    </div>
  );
}