"use client";

import CanvasScheduleHome from '@/components/CanvasScheduleHome';
import { ArrowLeft, Settings, Users, Download, Filter } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export default function StudentSchedulePage() {
  const [editMode, setEditMode] = useState<"view" | "edit" | "admin">("view");
  const [showFilters, setShowFilters] = useState(false);

  const handleModeChange = (mode: "view" | "edit" | "admin") => {
    setEditMode(mode);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>홈으로</span>
              </Link>
              <div className="w-px h-6 bg-gray-300"></div>
              <div className="flex items-center gap-3">
                <Users className="w-6 h-6 text-blue-600" />
                <div>
                  <h1 className="text-lg font-semibold text-gray-900">학생 시간표</h1>
                  <p className="text-sm text-gray-600">전체 학생 일정 관리</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* View Mode Toggle */}
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => handleModeChange("view")}
                  className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                    editMode === "view"
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  조회
                </button>
                <button
                  onClick={() => handleModeChange("edit")}
                  className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                    editMode === "edit"
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  편집
                </button>
                <button
                  onClick={() => handleModeChange("admin")}
                  className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                    editMode === "admin"
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  관리자
                </button>
              </div>

              {/* Action Buttons */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Filter className="w-4 h-4" />
                필터
              </button>
              
              <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <Download className="w-4 h-4" />
                내보내기
              </button>

              <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <Settings className="w-4 h-4" />
                설정
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Filter Panel */}
      {showFilters && (
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">학년:</label>
                <select className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">전체</option>
                  <option value="8">중2</option>
                  <option value="9">중3</option>
                  <option value="10">고1</option>
                </select>
              </div>
              
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">과목:</label>
                <select className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">전체</option>
                  <option value="math">수학</option>
                  <option value="english">영어</option>
                  <option value="science">과학</option>
                </select>
              </div>
              
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">시간대:</label>
                <select className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">전체</option>
                  <option value="morning">오전 (9-12시)</option>
                  <option value="afternoon">오후 (1-6시)</option>
                  <option value="evening">저녁 (7-10시)</option>
                </select>
              </div>

              <button className="px-4 py-1 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors">
                적용
              </button>
              <button 
                onClick={() => setShowFilters(false)}
                className="px-4 py-1 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mode Status Banner */}
      {editMode !== "view" && (
        <div className={`${
          editMode === "admin" ? "bg-orange-50 border-orange-200" : "bg-blue-50 border-blue-200"
        } border-b`}>
          <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                editMode === "admin" ? "bg-orange-500" : "bg-blue-500"
              }`}></div>
              <span className={`font-medium ${
                editMode === "admin" ? "text-orange-800" : "text-blue-800"
              }`}>
                {editMode === "admin" ? "관리자 모드" : "편집 모드"}
              </span>
              <span className={`text-sm ${
                editMode === "admin" ? "text-orange-700" : "text-blue-700"
              }`}>
                - {editMode === "admin" ? "모든 시간표를 편집하고 관리할 수 있습니다." : "시간표를 편집할 수 있습니다."}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="py-8">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
          <CanvasScheduleHome editMode={editMode} />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              총 학생 수: <span className="font-medium">15명</span> | 
              활성 일정: <span className="font-medium">45개</span>
            </div>
            <div className="text-sm text-gray-500">
              마지막 업데이트: {new Date().toLocaleString('ko-KR')}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}