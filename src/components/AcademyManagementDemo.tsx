"use client";

import { useState } from "react";
import { Student } from "@/types/schedule";
import StudentList from "./StudentList";
import StudentScheduleEditor from "./StudentScheduleEditor";
import MiddleSchoolRecordManager from "./MiddleSchoolRecordManager";
import HighSchoolHomeworkManager from "./HighSchoolHomeworkManager";
import ClassSchedulingSuggester from "./ClassSchedulingSuggester";
import EditableSchedule from "./EditableSchedule";
import { 
  GraduationCap,
  Calendar,
  BookOpen,
  BookCheck,
  Clock,
  Settings
} from "lucide-react";

type ViewType = 
  | "students" 
  | "schedule-editor" 
  | "middle-records" 
  | "high-homework" 
  | "class-scheduling" 
  | "main-schedule";

export default function AcademyManagementDemo() {
  const [currentView, setCurrentView] = useState<ViewType>("students");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const navigationItems = [
    {
      id: "students" as ViewType,
      label: "학생 관리",
      icon: GraduationCap,
      description: "학생 목록 및 개별 관리"
    },
    {
      id: "schedule-editor" as ViewType,
      label: "개별 일정 관리",
      icon: Calendar,
      description: "학생 개인 일정 편집"
    },
    {
      id: "middle-records" as ViewType,
      label: "중등 주간 기록",
      icon: BookOpen,
      description: "중등생 주간 기록 관리"
    },
    {
      id: "high-homework" as ViewType,
      label: "고등 숙제 검사",
      icon: BookCheck,
      description: "고등생 숙제 검사 기록"
    },
    {
      id: "class-scheduling" as ViewType,
      label: "수업 시간 추천",
      icon: Clock,
      description: "최적 수업 시간 찾기"
    },
    {
      id: "main-schedule" as ViewType,
      label: "전체 시간표",
      icon: Settings,
      description: "메인 시간표 관리"
    }
  ];

  const handleStudentSelect = (student: Student) => {
    setSelectedStudent(student);
    setCurrentView("schedule-editor");
  };

  const handleBackToStudents = () => {
    setSelectedStudent(null);
    setCurrentView("students");
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case "students":
        return (
          <StudentList 
            onStudentSelect={handleStudentSelect}
          />
        );
      
      case "schedule-editor":
        if (!selectedStudent) {
          return (
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">학생을 선택해주세요</h3>
              <p className="text-gray-500 mb-4">학생 목록에서 학생을 선택하여 개별 일정을 관리하세요.</p>
              <button
                onClick={() => setCurrentView("students")}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                학생 목록으로 이동
              </button>
            </div>
          );
        }
        return (
          <StudentScheduleEditor 
            student={selectedStudent}
            onBack={handleBackToStudents}
          />
        );

      case "middle-records":
        return <MiddleSchoolRecordManager />;

      case "high-homework":
        return <HighSchoolHomeworkManager />;

      case "class-scheduling":
        return <ClassSchedulingSuggester />;

      case "main-schedule":
        return <EditableSchedule />;

      default:
        return null;
    }
  };

  const getCurrentViewTitle = () => {
    const item = navigationItems.find(item => item.id === currentView);
    return item ? item.label : "학원 관리 시스템";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <GraduationCap className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">학원 관리 시스템</h1>
                <p className="text-sm text-gray-600">{getCurrentViewTitle()}</p>
              </div>
            </div>
            
            <div className="text-sm text-gray-500">
              구현된 모든 기능을 테스트할 수 있는 데모 페이지입니다
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* 사이드바 네비게이션 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-gray-200 p-4 sticky top-8">
              <h3 className="font-semibold text-gray-900 mb-4">기능 메뉴</h3>
              <nav className="space-y-2">
                {navigationItems.map(item => {
                  const IconComponent = item.icon;
                  const isActive = currentView === item.id;
                  
                  return (
                    <button
                      key={item.id}
                      onClick={() => setCurrentView(item.id)}
                      className={`w-full text-left p-3 rounded-lg border transition-colors ${
                        isActive
                          ? "border-blue-500 bg-blue-50 text-blue-700"
                          : "border-gray-200 hover:bg-gray-50 text-gray-700"
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-1">
                        <IconComponent className="w-4 h-4" />
                        <span className="font-medium">{item.label}</span>
                      </div>
                      <p className="text-xs opacity-75">
                        {item.description}
                      </p>
                    </button>
                  );
                })}
              </nav>

              {/* 기능 설명 */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="font-medium text-gray-900 mb-3">구현된 주요 기능</h4>
                <ul className="text-xs text-gray-600 space-y-2">
                  <li>• 학생 정보 관리 및 검색</li>
                  <li>• 개별 학생 일정 편집</li>
                  <li>• 중등생 주간 기록 관리</li>
                  <li>• 고등생 숙제 검사 기록</li>
                  <li>• 시간표 충돌 검사</li>
                  <li>• 최적 수업 시간 추천</li>
                  <li>• 드래그 앤 드롭 시간표</li>
                </ul>
              </div>
            </div>
          </div>

          {/* 메인 컨텐츠 */}
          <div className="lg:col-span-3">
            {renderCurrentView()}
          </div>
        </div>
      </div>
    </div>
  );
}