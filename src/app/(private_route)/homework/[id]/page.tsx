import { notFound } from "next/navigation";
import { middleSchoolRecords } from "@/lib/mock/middleSchoolRecords";
import { students } from "@/lib/mock/students";
import { teachers } from "@/lib/mock/teachers";
import { classes } from "@/lib/mock/classes";
import { GraduationCap, Calendar, Clock, User, BookOpen, FileText, CheckCircle, XCircle, AlertCircle } from "lucide-react";

interface HomeworkDetailPageProps {
  params: {
    id: string;
  };
}

export default function HomeworkDetailPage({ params }: HomeworkDetailPageProps) {
  const record = middleSchoolRecords.find((r) => r.id === params.id);

  if (!record) {
    notFound();
  }

  const student = students.find((s) => s.id === record.studentId);
  const teacher = teachers.find((t) => t.id === record.teacherId);
  const classInfo = classes.find((c) => c.id === record.classId);

  if (!student || !teacher || !classInfo) {
    notFound();
  }

  const getHomeworkStatusInfo = (status: string) => {
    switch (status) {
      case "excellent":
        return {
          label: "우수",
          color: "text-green-600 bg-green-100",
          icon: CheckCircle,
          description: "매우 잘 완성된 숙제입니다"
        };
      case "good":
        return {
          label: "양호",
          color: "text-blue-600 bg-blue-100",
          icon: CheckCircle,
          description: "잘 완성된 숙제입니다"
        };
      case "fair":
        return {
          label: "보통",
          color: "text-yellow-600 bg-yellow-100",
          icon: AlertCircle,
          description: "개선이 필요한 부분이 있습니다"
        };
      case "poor":
        return {
          label: "미흡",
          color: "text-orange-600 bg-orange-100",
          icon: AlertCircle,
          description: "더 많은 노력이 필요합니다"
        };
      case "not_submitted":
        return {
          label: "미제출",
          color: "text-red-600 bg-red-100",
          icon: XCircle,
          description: "숙제를 제출하지 않았습니다"
        };
      default:
        return {
          label: "알 수 없음",
          color: "text-gray-600 bg-gray-100",
          icon: AlertCircle,
          description: ""
        };
    }
  };

  const getAttendanceInfo = (attendance: string) => {
    switch (attendance) {
      case "present":
        return {
          label: "출석",
          color: "text-green-600 bg-green-100"
        };
      case "late":
        return {
          label: "지각",
          color: "text-yellow-600 bg-yellow-100"
        };
      case "absent":
        return {
          label: "결석",
          color: "text-red-600 bg-red-100"
        };
      default:
        return {
          label: "알 수 없음",
          color: "text-gray-600 bg-gray-100"
        };
    }
  };

  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span
        key={i}
        className={`text-lg ${
          i < rating ? "text-yellow-400" : "text-gray-300"
        }`}
      >
        ★
      </span>
    ));
  };

  const homeworkStatus = getHomeworkStatusInfo(record.homework);
  const attendanceStatus = getAttendanceInfo(record.attendance);
  const StatusIcon = homeworkStatus.icon;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 헤더 */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <GraduationCap className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {student.name} 학습 기록
                </h1>
                <p className="text-gray-600 mt-1">
                  {classInfo.subject} • {teacher.name} 선생님
                </p>
              </div>
            </div>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${homeworkStatus.color}`}>
              <div className="flex items-center space-x-2">
                <StatusIcon className="h-4 w-4" />
                <span>{homeworkStatus.label}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 기본 정보 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 숙제 상태 */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <BookOpen className="h-5 w-5 mr-2 text-gray-600" />
                숙제 상태
              </h2>
              <div className="space-y-4">
                <div className={`p-4 rounded-lg ${homeworkStatus.color}`}>
                  <div className="flex items-center space-x-3">
                    <StatusIcon className="h-6 w-6" />
                    <div>
                      <p className="font-medium">{homeworkStatus.label}</p>
                      <p className="text-sm opacity-80">{homeworkStatus.description}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 학습 평가 */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <CheckCircle className="h-5 w-5 mr-2 text-gray-600" />
                학습 평가
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">참여도</h3>
                  <div className="flex items-center space-x-2">
                    {getRatingStars(record.participation)}
                    <span className="text-sm text-gray-600 ml-2">
                      {record.participation}/5
                    </span>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">이해도</h3>
                  <div className="flex items-center space-x-2">
                    {getRatingStars(record.understanding)}
                    <span className="text-sm text-gray-600 ml-2">
                      {record.understanding}/5
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 선생님 코멘트 */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FileText className="h-5 w-5 mr-2 text-gray-600" />
                선생님 코멘트
              </h2>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700 leading-relaxed">
                  {record.notes || "특이사항이 없습니다."}
                </p>
              </div>
            </div>
          </div>

          {/* 사이드바 정보 */}
          <div className="space-y-6">
            {/* 수업 정보 */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="font-semibold text-gray-900 mb-4">수업 정보</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <BookOpen className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">과목</p>
                    <p className="font-medium">{classInfo.subject}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <User className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">담당 선생님</p>
                    <p className="font-medium">{teacher.name}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">수업 시간</p>
                    <p className="font-medium">
                      {classInfo.startTime} - {classInfo.endTime}
                    </p>
                  </div>
                </div>
                {classInfo.room && (
                  <div className="flex items-center space-x-3">
                    <GraduationCap className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600">강의실</p>
                      <p className="font-medium">{classInfo.room}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 출석 상태 */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="font-semibold text-gray-900 mb-4">출석 상태</h3>
              <div className={`px-3 py-2 rounded-lg ${attendanceStatus.color}`}>
                <p className="text-center font-medium">{attendanceStatus.label}</p>
              </div>
            </div>

            {/* 기록 정보 */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="font-semibold text-gray-900 mb-4">기록 정보</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">주간</p>
                    <p className="font-medium">{record.weekOf}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <FileText className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">최종 수정</p>
                    <p className="font-medium">{record.lastModified}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}