"use client";

import { PageHeader, PageLayout } from "@/components/common/layout";
import CombinedStudentSchedule from "@/components/common/schedule/CombinedStudentSchedule";
import { Calendar } from "lucide-react";

export default function CombinedSchedulePage() {
  return (
    <>
      <PageHeader
        title="학생별 통합 시간표"
        description="모든 학생의 일정을 한눈에 확인하세요"
        icon={Calendar}
      />

      <PageLayout>
        <div className="h-full overflow-hidden border-0 flat-card rounded-2xl">
          <CombinedStudentSchedule />
        </div>
      </PageLayout>
    </>
  );
}
