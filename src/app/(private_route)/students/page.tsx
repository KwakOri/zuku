"use client";

import { useState } from "react";
import Link from "next/link";
import { Student } from "@/types/schedule";
import StudentList from "@/components/StudentList";
import StudentScheduleEditor from "@/components/StudentScheduleEditor";
import { ArrowLeft, Home } from "lucide-react";

export default function StudentsPage() {
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "edit">("list");

  const handleStudentSelect = (student: Student) => {
    setSelectedStudent(student);
    setViewMode("edit");
  };

  const handleBackToList = () => {
    setSelectedStudent(null);
    setViewMode("list");
  };

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
              
              {viewMode === "edit" && (
                <button
                  onClick={handleBackToList}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
              )}

              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  {viewMode === "list" ? "학생 관리" : `${selectedStudent?.name} 일정 관리`}
                </h1>
                <p className="text-sm text-gray-600">
                  {viewMode === "list" 
                    ? "학생 정보를 관리하고 개별 일정을 편집하세요" 
                    : "개별 학생의 일정을 관리할 수 있습니다"
                  }
                </p>
              </div>
            </div>

            {/* 추가 액션 버튼들 */}
            <div className="flex items-center gap-3">
              {viewMode === "list" && (
                <Link
                  href="/schedule"
                  className="px-4 py-2 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  전체 시간표 보기
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {viewMode === "list" ? (
          <StudentList onStudentSelect={handleStudentSelect} />
        ) : selectedStudent ? (
          <StudentScheduleEditor 
            student={selectedStudent} 
            onBack={handleBackToList}
          />
        ) : null}
      </main>
    </div>
  );
}