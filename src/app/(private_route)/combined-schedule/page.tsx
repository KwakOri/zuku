"use client";

import { PageHeader, PageLayout } from "@/components/common/layout";
import CombinedStudentSchedule from "@/components/common/schedule/CombinedStudentSchedule";
import CombinedClassSchedule from "@/components/common/schedule/CombinedClassSchedule";
import CombinedTeacherSchedule from "@/components/common/schedule/CombinedTeacherSchedule";
import { Calendar, Users, BookOpen, GraduationCap } from "lucide-react";
import { useState } from "react";

type ViewMode = "student" | "class" | "teacher";

export default function CombinedSchedulePage() {
  const [viewMode, setViewMode] = useState<ViewMode>("student");

  const viewConfig = {
    student: {
      title: "통합 시간표",
      description: "모든 학생의 일정을 한눈에 확인하세요",
      icon: Users,
      component: <CombinedStudentSchedule />,
    },
    class: {
      title: "통합 시간표",
      description: "수업별 일정을 한눈에 확인하세요",
      icon: BookOpen,
      component: <CombinedClassSchedule />,
    },
    teacher: {
      title: "통합 시간표",
      description: "선생님별 담당 수업 일정을 한눈에 확인하세요",
      icon: GraduationCap,
      component: <CombinedTeacherSchedule />,
    },
  };

  const currentView = viewConfig[viewMode];

  return (
    <>
      <PageHeader
        title={currentView.title}
        description={currentView.description}
        icon={Calendar}
      />

      <PageLayout maxWidth={"inset"}>
        <div className="h-full overflow-hidden border-0 flat-card rounded-2xl">
          {/* View Mode Tabs */}
          <div className="flex gap-2 p-4 bg-white border-b border-gray-200">
            <button
              onClick={() => setViewMode("student")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                viewMode === "student"
                  ? "bg-primary-100 text-primary-700"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <Users className="w-4 h-4" />
              <span>학생별</span>
            </button>
            <button
              onClick={() => setViewMode("class")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                viewMode === "class"
                  ? "bg-primary-100 text-primary-700"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>수업별</span>
            </button>
            <button
              onClick={() => setViewMode("teacher")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                viewMode === "teacher"
                  ? "bg-primary-100 text-primary-700"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>선생님별</span>
            </button>
          </div>

          {/* Current View Component */}
          {currentView.component}
        </div>
      </PageLayout>
    </>
  );
}
