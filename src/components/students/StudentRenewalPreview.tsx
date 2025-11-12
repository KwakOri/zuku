"use client";

import { RenewalPreview, StudentComparison } from "@/types/student-renewal";
import {
  AlertCircle,
  CheckCircle,
  Edit3,
  UserMinus,
  UserPlus,
  BookOpen,
  Clock,
  Users as UsersIcon,
} from "lucide-react";
import { DAYS_OF_WEEK } from "@/constants/schedule";

interface StudentRenewalPreviewProps {
  preview: RenewalPreview;
}

export default function StudentRenewalPreview({
  preview,
}: StudentRenewalPreviewProps) {
  const { newStudents, updatedStudents, withdrawnStudents, totalChanges } =
    preview;

  if (totalChanges === 0) {
    return (
      <div className="p-8 text-center">
        <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-success-100">
          <CheckCircle className="w-10 h-10 text-success-600" />
        </div>
        <p className="text-neu-600">
          변경사항이 없습니다. 모든 학생 정보가 최신 상태입니다.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 요약 정보 */}
      <div className="p-4 border bg-primary-50 border-primary-200 rounded-xl">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="mb-3 font-semibold text-primary-900">
              변경사항 요약
            </h3>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="p-3 bg-white rounded-lg">
                <span className="block mb-1 text-neu-600">새로운 학생</span>
                <span className="text-2xl font-bold text-success-600">
                  {newStudents.length}
                </span>
                <span className="ml-1 text-neu-600">명</span>
              </div>
              <div className="p-3 bg-white rounded-lg">
                <span className="block mb-1 text-neu-600">정보 변경</span>
                <span className="text-2xl font-bold text-warning-600">
                  {updatedStudents.length}
                </span>
                <span className="ml-1 text-neu-600">명</span>
              </div>
              <div className="p-3 bg-white rounded-lg">
                <span className="block mb-1 text-neu-600">퇴원 학생</span>
                <span className="text-2xl font-bold text-error-600">
                  {withdrawnStudents.length}
                </span>
                <span className="ml-1 text-neu-600">명</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 새로운 학생 */}
      {newStudents.length > 0 && (
        <div className="overflow-hidden bg-white border border-neu-200 rounded-xl">
          <div className="flex items-center gap-2 px-4 py-3 border-b bg-success-50 border-success-200">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-success-100">
              <UserPlus className="w-5 h-5 text-success-700" />
            </div>
            <h3 className="font-semibold text-success-900">
              새로운 학생 ({newStudents.length}명)
            </h3>
          </div>
          <div className="divide-y divide-neu-200">
            {newStudents.map((student, idx) => (
              <StudentRow key={idx} student={student} type="new" />
            ))}
          </div>
        </div>
      )}

      {/* 정보 변경 학생 */}
      {updatedStudents.length > 0 && (
        <div className="overflow-hidden bg-white border border-neu-200 rounded-xl">
          <div className="flex items-center gap-2 px-4 py-3 border-b bg-warning-50 border-warning-200">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-warning-100">
              <Edit3 className="w-5 h-5 text-warning-700" />
            </div>
            <h3 className="font-semibold text-warning-900">
              정보 변경 학생 ({updatedStudents.length}명)
            </h3>
          </div>
          <div className="divide-y divide-neu-200">
            {updatedStudents.map((student, idx) => (
              <StudentRow key={idx} student={student} type="updated" />
            ))}
          </div>
        </div>
      )}

      {/* 퇴원 학생 */}
      {withdrawnStudents.length > 0 && (
        <div className="overflow-hidden bg-white border border-neu-200 rounded-xl">
          <div className="flex items-center gap-2 px-4 py-3 border-b bg-error-50 border-error-200">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-error-100">
              <UserMinus className="w-5 h-5 text-error-700" />
            </div>
            <h3 className="font-semibold text-error-900">
              퇴원 학생 ({withdrawnStudents.length}명)
            </h3>
          </div>
          <div className="divide-y divide-neu-200">
            {withdrawnStudents.map((student, idx) => (
              <StudentRow key={idx} student={student} type="withdrawn" />
            ))}
          </div>
        </div>
      )}

      {/* 반 정보 */}
      {preview.classes && preview.classes.length > 0 && (
        <div className="overflow-hidden bg-white border border-neu-200 rounded-xl">
          <div className="flex items-center gap-2 px-4 py-3 border-b bg-blue-50 border-blue-200">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-100">
              <BookOpen className="w-5 h-5 text-blue-700" />
            </div>
            <h3 className="font-semibold text-blue-900">
              반 정보 ({preview.classes.filter(c => !c.exists).length}개 신규 생성)
            </h3>
          </div>
          <div className="p-4 space-y-2">
            {preview.classes.map((cls, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-lg ${
                  cls.exists ? 'bg-neu-50 border border-neu-200' : 'bg-blue-50 border border-blue-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-neu-900">{cls.fullClassName}</span>
                    <span className="ml-2 text-sm text-neu-600">
                      ({cls.splitType === 'split' ? '앞/뒤타임 수업' : '단일 수업'})
                    </span>
                    <span className="ml-2 text-sm text-neu-600">
                      ({cls.courseType === 'regular' ? '정규수업' : '내신대비'})
                    </span>
                  </div>
                  {cls.exists ? (
                    <span className="px-2 py-1 text-xs rounded-md bg-neu-200 text-neu-700">기존 반</span>
                  ) : (
                    <span className="px-2 py-1 text-xs rounded-md bg-blue-200 text-blue-700">신규</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 수업 구성 정보 */}
      {preview.compositions && preview.compositions.length > 0 && (
        <div className="overflow-hidden bg-white border border-neu-200 rounded-xl">
          <div className="flex items-center gap-2 px-4 py-3 border-b bg-purple-50 border-purple-200">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-100">
              <Clock className="w-5 h-5 text-purple-700" />
            </div>
            <h3 className="font-semibold text-purple-900">
              수업 구성 ({preview.compositions.filter(c => !c.exists).length}개 신규 생성)
            </h3>
          </div>
          <div className="p-4 space-y-2">
            {preview.compositions.map((comp, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-lg ${
                  comp.exists ? 'bg-neu-50 border border-neu-200' : 'bg-purple-50 border border-purple-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-neu-900">{comp.fullClassName}</span>
                    <span className="ml-2 text-sm text-neu-600">
                      {DAYS_OF_WEEK[comp.dayOfWeek]}요일 {comp.startTime}-{comp.endTime}
                    </span>
                    <span className="ml-2 text-xs px-2 py-0.5 rounded bg-neu-200 text-neu-700">
                      {comp.type === 'class' ? '수업' : '클리닉'}
                    </span>
                  </div>
                  {comp.exists ? (
                    <span className="px-2 py-1 text-xs rounded-md bg-neu-200 text-neu-700">기존</span>
                  ) : (
                    <span className="px-2 py-1 text-xs rounded-md bg-purple-200 text-purple-700">신규</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 수강 정보 */}
      {preview.enrollments && preview.enrollments.length > 0 && (
        <div className="overflow-hidden bg-white border border-neu-200 rounded-xl">
          <div className="flex items-center gap-2 px-4 py-3 border-b bg-green-50 border-green-200">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-green-100">
              <UsersIcon className="w-5 h-5 text-green-700" />
            </div>
            <h3 className="font-semibold text-green-900">
              수강 정보 ({preview.enrollments.filter(e => !e.exists).length}개 신규 등록)
            </h3>
          </div>
          <div className="p-4 space-y-2 max-h-64 overflow-y-auto">
            {preview.enrollments.map((enroll, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-lg ${
                  enroll.exists ? 'bg-neu-50 border border-neu-200' : 'bg-green-50 border border-green-200'
                }`}
              >
                <div className="mb-2 flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-neu-900">{enroll.studentName}</span>
                    <span className="ml-2 text-sm text-neu-600">→ {enroll.fullClassName}</span>
                  </div>
                  {enroll.exists ? (
                    <span className="px-2 py-1 text-xs rounded-md bg-neu-200 text-neu-700">기존</span>
                  ) : (
                    <span className="px-2 py-1 text-xs rounded-md bg-green-200 text-green-700">신규</span>
                  )}
                </div>
                <div className="flex flex-wrap gap-1">
                  {enroll.schedules.map((schedule, sIdx) => (
                    <span
                      key={sIdx}
                      className={`px-2 py-1 text-xs rounded ${
                        enroll.exists ? 'bg-neu-100 text-neu-700' : 'bg-green-100 text-green-700'
                      }`}
                    >
                      {DAYS_OF_WEEK[schedule.dayOfWeek]}요일 {schedule.startTime}-{schedule.endTime} ({schedule.type === 'class' ? '수업' : '클리닉'})
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface StudentRowProps {
  student: StudentComparison;
  type: "new" | "updated" | "withdrawn";
}

function StudentRow({ student, type }: StudentRowProps) {
  return (
    <div className="px-4 py-3 transition-colors hover:bg-neu-50">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="mb-1 font-semibold text-neu-900">
            {student.name}
            <span className="ml-2 text-sm font-normal text-neu-500">
              (생년월일: {student.birthDate})
            </span>
          </div>

          {/* 새로운 학생 정보 */}
          {type === "new" && student.newData && (
            <div className="grid grid-cols-2 mt-2 text-sm gap-x-4 gap-y-1 text-neu-700">
              <div className="flex items-center gap-2">
                <span className="text-neu-500">반:</span>
                <span className="font-medium">{student.newData.className}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-neu-500">학교:</span>
                <span className="font-medium">
                  {student.newData.schoolName}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-neu-500">학년:</span>
                <span className="font-medium">{student.newData.grade}학년</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-neu-500">휴대폰:</span>
                <span className="font-medium">{student.newData.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-neu-500">성별:</span>
                <span className="font-medium">
                  {student.newData.gender === "male" ? "남" : "여"}
                </span>
              </div>
            </div>
          )}

          {/* 변경된 정보 */}
          {type === "updated" &&
            student.changes &&
            student.changes.length > 0 && (
              <div className="mt-2 space-y-1.5">
                {student.changes.map((change, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm">
                    <span className="text-neu-600 min-w-[60px]">
                      {change.field}:
                    </span>
                    <span className="px-2 py-0.5 bg-error-100 text-error-700 rounded line-through">
                      {change.oldValue || "(없음)"}
                    </span>
                    <span className="text-neu-400">→</span>
                    <span className="px-2 py-0.5 bg-success-100 text-success-700 rounded font-medium">
                      {change.newValue}
                    </span>
                  </div>
                ))}
              </div>
            )}

          {/* 퇴원 학생 */}
          {type === "withdrawn" && (
            <div className="inline-flex items-center gap-2 px-3 py-1 mt-2 text-sm rounded-lg bg-error-100 text-error-700">
              {`재원 상태가 "퇴원"으로 변경됩니다`}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
