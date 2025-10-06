"use client";

import { PageHeader, PageLayout } from "@/components/common/layout";
import ClassCompositionManager from "@/components/ClassCompositionManager";
import StudentEnrollmentForm from "@/components/StudentEnrollmentForm";
import { useClasses } from "@/queries/useClasses";
import { Split, Users, BookOpen } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ClassCompositionPage() {
  const router = useRouter();
  const { data: classes = [], isLoading } = useClasses();
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"manage" | "enroll">("manage");

  const selectedClass = classes.find((c) => c.id === selectedClassId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 mx-auto border-b-2 rounded-full animate-spin border-primary-600"></div>
          <p className="mt-2 text-gray-600">수업 목록을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title="앞/뒤타임 관리"
        description="수업의 앞타임/뒤타임을 설정하고 학생을 등록하세요"
        icon={Split}
      />

      <PageLayout>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 왼쪽: 수업 목록 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                수업 목록
              </h3>

              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {classes.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-8">
                    등록된 수업이 없습니다.
                  </p>
                ) : (
                  classes.map((cls) => (
                    <button
                      key={cls.id}
                      onClick={() => setSelectedClassId(cls.id)}
                      className={`w-full text-left p-3 rounded-lg border transition-colors ${
                        selectedClassId === cls.id
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium text-gray-900">{cls.title}</h4>
                        <div
                          className={`px-2 py-0.5 rounded text-xs font-medium ${
                            cls.split_type === "split"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {cls.split_type === "split" ? "앞/뒤타임" : "단일"}
                        </div>
                      </div>
                      <p className="text-xs text-gray-500">
                        {cls.teacher_name} • {cls.subject}
                      </p>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* 오른쪽: 선택된 수업 관리 */}
          <div className="lg:col-span-2">
            {selectedClass ? (
              <div className="bg-white rounded-lg border border-gray-200">
                {/* 헤더 */}
                <div className="border-b border-gray-200 p-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {selectedClass.title}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {selectedClass.subject} • {selectedClass.teacher_name}
                  </p>
                </div>

                {/* 탭 */}
                <div className="border-b border-gray-200 px-4">
                  <div className="flex gap-4">
                    <button
                      onClick={() => setActiveTab("manage")}
                      className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                        activeTab === "manage"
                          ? "border-blue-600 text-blue-600"
                          : "border-transparent text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Split className="w-4 h-4" />
                        시간 구성 관리
                      </div>
                    </button>
                    <button
                      onClick={() => setActiveTab("enroll")}
                      className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                        activeTab === "enroll"
                          ? "border-blue-600 text-blue-600"
                          : "border-transparent text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        학생 등록
                      </div>
                    </button>
                  </div>
                </div>

                {/* 컨텐츠 */}
                <div className="p-6">
                  {activeTab === "manage" ? (
                    <ClassCompositionManager
                      classId={selectedClass.id}
                      splitType={selectedClass.split_type || "single"}
                      onTypeChange={(newType) => {
                        // 타입 변경 시 목록 새로고침
                        router.refresh();
                      }}
                    />
                  ) : (
                    <StudentEnrollmentForm
                      onSuccess={() => {
                        // 등록 성공 시 처리
                        router.refresh();
                      }}
                    />
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                <Split className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  수업을 선택하세요
                </h3>
                <p className="text-gray-500">
                  왼쪽 목록에서 수업을 선택하면 앞/뒤타임을 설정하고 학생을
                  등록할 수 있습니다.
                </p>
              </div>
            )}
          </div>
        </div>
      </PageLayout>
    </>
  );
}
