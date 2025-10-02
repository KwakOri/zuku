'use client';

import HighSchoolHomeworkManager from "@/components/admin/HighSchoolHomeworkManager";
import { PageHeader, PageLayout } from "@/components/common/layout";
import { ClipboardCheck } from "lucide-react";

export default function HighHomeworkPage() {
  return (
    <>
      <PageHeader
        icon={ClipboardCheck}
        title="고등 숙제 검사 관리"
        description="고등학생들의 숙제를 체계적으로 검사하고 기록하세요"
      />
      <PageLayout variant="default">
        <HighSchoolHomeworkManager />
      </PageLayout>
    </>
  );
}