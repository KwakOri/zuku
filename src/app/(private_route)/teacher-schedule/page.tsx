"use client";

import TeacherClassManager from "@/components/class-management/TeacherClassManager";
import { PageHeader, PageLayout } from "@/components/common/layout";
import { User } from "lucide-react";

export default function TeacherSchedulePage() {
  return (
    <>
      <PageHeader
        icon={User}
        title="담당 수업 관리"
        description="강사 전용 - 담당 수업의 시간표를 조정하고 학생 밀집도를 확인하세요"
      />
      <PageLayout variant="default">
        <TeacherClassManager />
      </PageLayout>
    </>
  );
}
