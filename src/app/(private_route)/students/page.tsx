"use client";

import StudentList from "@/components/students/StudentList";
import AddStudentModal from "@/components/common/modals/AddStudentModal";
import StudentRenewalDialog from "@/components/students/StudentRenewalDialog";
import { PageHeader, PageLayout } from "@/components/common/layout";
import { UserPlus, Users, RefreshCw } from "lucide-react";
import { useState } from "react";

export default function StudentsPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isRenewalOpen, setIsRenewalOpen] = useState(false);

  return (
    <>
      <PageHeader
        title="학생 관리"
        description="학생 정보를 관리하고 개별 일정을 편집하세요"
        icon={Users}
        actions={
          <>
            <button
              onClick={() => setIsRenewalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 flat-card bg-white text-primary-600 rounded-2xl hover:bg-primary-50 transition-all duration-200 border border-primary-200"
            >
              <RefreshCw className="w-4 h-4" />
              학생 정보 갱신
            </button>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 flat-card bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-2xl hover:from-primary-600 hover:to-primary-700 transition-all duration-200"
            >
              <UserPlus className="w-4 h-4" />
              학생 추가
            </button>
          </>
        }
      />

      <PageLayout>
        <StudentList />
      </PageLayout>

      {/* 학생 추가 모달 */}
      <AddStudentModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

      {/* 학생 정보 갱신 다이얼로그 */}
      <StudentRenewalDialog
        isOpen={isRenewalOpen}
        onClose={() => setIsRenewalOpen(false)}
      />
    </>
  );
}