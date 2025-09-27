"use client";

import Link from "next/link";
import { StudentList, AddStudentModal, Card, Button, Icon } from "@/components/design-system";
import { Home, UserPlus } from "lucide-react";
import { useState } from "react";

export default function StudentsPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-neu-100">
      {/* 헤더 */}
      <header className="bg-neu-50 shadow-sm border-b border-neu-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link
                href="/"
              >
                <Button variant="ghost" size="sm">
                  <Home className="w-5 h-5" />
                </Button>
              </Link>

              <div>
                <h1 className="text-xl font-bold text-neu-900">학생 관리</h1>
                <p className="text-sm text-neu-600">
                  학생 정보를 관리하고 개별 일정을 편집하세요
                </p>
              </div>
            </div>

            {/* 추가 액션 버튼들 */}
            <div className="flex items-center gap-3">
              <Button
                variant="primary"
                size="md"
                onClick={() => setIsAddModalOpen(true)}
              >
                <UserPlus className="w-4 h-4 mr-2" />
                학생 추가
              </Button>
              <Link href="/schedule">
                <Button variant="outline" size="md">
                  전체 시간표 보기
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <StudentList />
      </main>

      {/* 학생 추가 모달 */}
      <AddStudentModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </div>
  );
}