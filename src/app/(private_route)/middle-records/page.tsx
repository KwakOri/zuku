'use client';

import MiddleSchoolRecordManager from "@/components/middle-records/MiddleSchoolRecordManager";
import { PageHeader, PageLayout } from "@/components/common/layout";
import { FileText } from "lucide-react";

export default function MiddleRecordsPage() {
  return (
    <>
      <PageHeader
        icon={FileText}
        title="중등 주간 기록 관리"
        description="중등학생들의 주간 학습 상태를 기록하고 관리하세요"
      />
      <PageLayout>
        <MiddleSchoolRecordManager />
      </PageLayout>
    </>
  );
}