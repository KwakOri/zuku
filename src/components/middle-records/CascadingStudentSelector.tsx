"use client";

import { useState, useMemo } from "react";
import { ChevronRight, User, BookOpen, Users } from "lucide-react";
import { Tables } from "@/types/supabase";
import { getGrade } from "@/lib/utils";

// Type definition for class_students with nested relations from API
interface ClassStudentWithRelations extends Tables<"relations_classes_students"> {
  student?: Pick<Tables<"students">, "id" | "name" | "grade" | "phone" | "parent_phone" | "email"> & {
    school?: Pick<Tables<"schools">, "id" | "name" | "level"> | null;
  } | null;
  class?: Pick<Tables<"classes">, "id" | "title"> & {
    subject?: Pick<Tables<"subjects">, "id" | "subject_name"> | null;
  } | null;
  student_compositions?: Array<Tables<"relations_compositions_students"> & {
    composition?: Pick<Tables<"class_compositions">, "id" | "class_id" | "day_of_week" | "start_time" | "end_time" | "type"> | null;
  }>;
}

type Student = Tables<"students"> & {
  school?: Pick<Tables<"schools">, "id" | "name" | "level"> | null;
};

interface CascadingStudentSelectorProps {
  students: Student[];
  allStudentClasses: ClassStudentWithRelations[];
  selectedStudentId: string;
  selectedClassId: string;
  onSelect: (studentId: string, classId: string) => void;
  recordsColumn?: React.ReactNode;
}

export default function CascadingStudentSelector({
  students,
  allStudentClasses,
  selectedStudentId,
  selectedClassId,
  onSelect,
  recordsColumn,
}: CascadingStudentSelectorProps) {
  const [activeStudentId, setActiveStudentId] = useState<string | null>(selectedStudentId || null);
  const [activeClassId, setActiveClassId] = useState<string | null>(selectedClassId || null);
  const [activeSubject, setActiveSubject] = useState<string | null>(null);

  // 과목별로 그룹화
  const subjectGroups = useMemo(() => {
    const groups = new Map<string, Set<string>>();

    allStudentClasses.forEach((classStudent) => {
      const subjectName = classStudent.class?.subject?.subject_name || "기타";
      if (!groups.has(subjectName)) {
        groups.set(subjectName, new Set());
      }
      if (classStudent.class_id) {
        groups.get(subjectName)?.add(classStudent.class_id);
      }
    });

    return Array.from(groups.entries()).map(([subject, classIds]) => ({
      subject,
      count: classIds.size,
    }));
  }, [allStudentClasses]);

  // 선택된 과목의 수업 목록
  const classesForSubject = useMemo(() => {
    if (!activeSubject) return [];

    const uniqueClasses = new Map<string, ClassStudentWithRelations>();

    allStudentClasses.forEach((classStudent) => {
      const subjectName = classStudent.class?.subject?.subject_name || "기타";
      if (subjectName === activeSubject && classStudent.class_id) {
        if (!uniqueClasses.has(classStudent.class_id)) {
          uniqueClasses.set(classStudent.class_id, classStudent);
        }
      }
    });

    return Array.from(uniqueClasses.values());
  }, [allStudentClasses, activeSubject]);

  // 선택된 수업의 학생 목록
  const studentsForClass = useMemo(() => {
    if (!activeClassId) return [];

    const studentIds = new Set<string>();

    allStudentClasses
      .filter((cs) => cs.class_id === activeClassId)
      .forEach((cs) => {
        if (cs.student_id) {
          studentIds.add(cs.student_id);
        }
      });

    return students.filter((s) => studentIds.has(s.id));
  }, [students, allStudentClasses, activeClassId]);

  const handleSubjectClick = (subject: string) => {
    setActiveSubject(subject);
    setActiveClassId(null);
  };

  const handleClassClick = (classId: string) => {
    setActiveClassId(classId);
  };

  const handleStudentClick = (studentId: string) => {
    setActiveStudentId(studentId);
    if (activeClassId) {
      onSelect(studentId, activeClassId);
    }
  };

  return (
    <div className="grid grid-cols-4 gap-0 border border-gray-200 rounded-lg overflow-hidden bg-white h-full min-h-0">
      {/* Column 1: 과목 목록 */}
      <div className="border-r border-gray-200 flex flex-col min-h-0">
        <div className="sticky top-0 z-10 px-4 py-3 bg-gradient-to-r from-primary-50 to-primary-100 border-b border-primary-200 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-primary-600" />
              <h3 className="text-sm font-semibold text-primary-900">과목</h3>
            </div>
            <span className="text-xs font-medium text-primary-600">{subjectGroups.length}개</span>
          </div>
        </div>
        <div className="divide-y divide-gray-100 flex-1 overflow-y-auto">
          {subjectGroups.map(({ subject, count }) => (
            <button
              key={subject}
              onClick={() => handleSubjectClick(subject)}
              className={`w-full px-4 py-3 text-left transition-colors hover:bg-primary-50 group ${
                activeSubject === subject ? "bg-primary-50 border-l-2 border-l-primary-500" : ""
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className={`font-medium text-sm truncate ${
                    activeSubject === subject ? "text-primary-900" : "text-gray-900"
                  }`}>
                    {subject}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">{count}개 수업</div>
                </div>
                <ChevronRight className={`w-4 h-4 flex-shrink-0 transition-colors ${
                  activeSubject === subject ? "text-primary-600" : "text-gray-400 group-hover:text-primary-500"
                }`} />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Column 2: 수업명 목록 */}
      <div className="border-r border-gray-200 flex flex-col min-h-0">
        <div className="sticky top-0 z-10 px-4 py-3 bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-semibold text-blue-900">수업명</h3>
            </div>
            <span className="text-xs font-medium text-blue-600">
              {activeSubject ? `${classesForSubject.length}개` : '-'}
            </span>
          </div>
        </div>
        {!activeSubject ? (
          <div className="flex flex-col items-center justify-center flex-1 p-6 text-center">
            <BookOpen className="w-12 h-12 mb-3 text-gray-300" />
            <p className="text-sm font-medium text-gray-500">과목을 선택하세요</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 flex-1 overflow-y-auto">
            {classesForSubject.map((classStudent) => (
              <button
                key={classStudent.class_id}
                onClick={() => handleClassClick(classStudent.class_id)}
                className={`w-full px-4 py-3 text-left transition-colors hover:bg-blue-50 group ${
                  activeClassId === classStudent.class_id ? "bg-blue-50 border-l-2 border-l-blue-500" : ""
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className={`font-medium text-sm truncate ${
                      activeClassId === classStudent.class_id ? "text-blue-900" : "text-gray-900"
                    }`}>
                      {classStudent.class?.title || "제목 없음"}
                    </div>
                  </div>
                  <ChevronRight className={`w-4 h-4 flex-shrink-0 transition-colors ${
                    activeClassId === classStudent.class_id ? "text-blue-600" : "text-gray-400 group-hover:text-blue-500"
                  }`} />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Column 3: 학생 목록 */}
      <div className="flex flex-col border-r border-gray-200 min-h-0">
        <div className="sticky top-0 z-10 px-4 py-3 bg-gradient-to-r from-green-50 to-green-100 border-b border-green-200 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-green-600" />
              <h3 className="text-sm font-semibold text-green-900">학생</h3>
            </div>
            <span className="text-xs font-medium text-green-600">
              {activeClassId ? `${studentsForClass.length}명` : '-'}
            </span>
          </div>
        </div>
        {!activeClassId ? (
          <div className="flex flex-col items-center justify-center flex-1 p-6 text-center">
            <User className="w-12 h-12 mb-3 text-gray-300" />
            <p className="text-sm font-medium text-gray-500">수업을 선택하세요</p>
          </div>
        ) : studentsForClass.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 p-6 text-center">
            <User className="w-12 h-12 mb-3 text-gray-300" />
            <p className="text-sm font-medium text-gray-500">등록된 학생이 없습니다</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 flex-1 overflow-y-auto">
            {studentsForClass.map((student) => (
              <button
                key={student.id}
                onClick={() => handleStudentClick(student.id)}
                className={`w-full px-4 py-3 text-left transition-colors hover:bg-green-50 ${
                  activeStudentId === student.id ? "bg-green-50 border-l-2 border-l-green-500" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex-shrink-0">
                    <span className="text-xs font-semibold text-white">
                      {student.name.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`font-medium text-sm truncate ${
                      activeStudentId === student.id ? "text-green-900" : "text-gray-900"
                    }`}>
                      {student.name}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {getGrade(student.grade, "half")}
                      {student.school?.name && ` • ${student.school.name}`}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Column 4: 기록 목록 */}
      {recordsColumn && (
        <div className="flex flex-col min-h-0">
          {recordsColumn}
        </div>
      )}
    </div>
  );
}
