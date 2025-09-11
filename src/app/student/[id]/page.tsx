"use client";

import StudentWeeklySchedule from "@/components/StudentWeeklySchedule";
import { generateStudentWeeklyView } from "@/lib/utils";
import { use } from "react";

interface StudentSchedulePageProps {
  params: Promise<{ id: string }>;
}

export default function StudentSchedulePage({ params }: StudentSchedulePageProps) {
  const resolvedParams = use(params);
  const studentId = parseInt(resolvedParams.id);

  try {
    const studentWeeklyView = generateStudentWeeklyView(studentId);
    
    return (
      <main className="min-h-screen bg-gray-50 py-8">
        <StudentWeeklySchedule 
          studentWeeklyView={studentWeeklyView} 
          viewMode="edit"
        />
      </main>
    );
  } catch (error) {
    return (
      <main className="min-h-screen bg-gray-50 py-8 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">학생을 찾을 수 없습니다</h1>
          <p className="text-gray-600">학생 ID: {studentId}</p>
          <p className="text-sm text-gray-500 mt-4">올바른 학생 ID를 확인해 주세요.</p>
        </div>
      </main>
    );
  }
}