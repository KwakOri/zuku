'use client';

import CombinedStudentSchedule from "@/components/common/schedule/CombinedStudentSchedule";
import { PageHeader, PageLayout } from "@/components/common/layout";
import { Calendar } from "lucide-react";

export default function CombinedSchedulePage() {
  return (
    <>
      <PageHeader
        title="학생별 통합 시간표"
        description="모든 학생의 일정을 한눈에 확인하세요"
        icon={Calendar}
      />

      <PageLayout variant="inset">
        <div className="overflow-hidden border-0 flat-card rounded-2xl">
          <CombinedStudentSchedule />
        </div>
      </PageLayout>
    </>
  );
}
