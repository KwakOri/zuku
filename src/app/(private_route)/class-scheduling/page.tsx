import ClassSchedulingSuggester from "@/components/class-scheduling/ClassSchedulingSuggester";
import { PageHeader, PageLayout } from "@/components/common/layout";
import { Brain } from "lucide-react";

export default function ClassSchedulingPage() {
  return (
    <>
      <PageHeader
        title="수업 시간 추천"
        description="학생들의 개인 일정을 고려하여 최적의 수업 시간을 찾으세요"
        icon={Brain}
      />
      <PageLayout>
        <ClassSchedulingSuggester />
      </PageLayout>
    </>
  );
}