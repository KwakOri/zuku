import { MiddleSchoolRecord } from "@/types/schedule";

// 중등 주간 기록 데이터
export const middleSchoolRecords: MiddleSchoolRecord[] = [
  {
    id: "ms-record-1",
    studentId: 3, // 이민서 (9학년)
    teacherId: "teacher-1",
    classId: "class-1",
    weekOf: "2024-01-08", // 1월 둘째 주
    attendance: "present",
    participation: 4,
    understanding: 3,
    homework: "good",
    notes:
      "수학 문제 해결 능력이 향상되고 있습니다. 응용 문제에서 조금 더 노력이 필요합니다.",
    createdDate: "2024-01-12",
    lastModified: "2024-01-12",
  },
  {
    id: "ms-record-2",
    studentId: 6, // 강민규 (8학년)
    teacherId: "teacher-2",
    classId: "class-2",
    weekOf: "2024-01-08",
    attendance: "present",
    participation: 5,
    understanding: 4,
    homework: "excellent",
    notes: "영어 말하기에 적극적으로 참여하며, 발음도 많이 개선되었습니다.",
    createdDate: "2024-01-12",
    lastModified: "2024-01-12",
  },
  {
    id: "ms-record-3",
    studentId: 3, // 이민서 (9학년)
    teacherId: "teacher-1",
    classId: "class-1",
    weekOf: "2024-01-15", // 1월 셋째 주
    attendance: "late",
    participation: 3,
    understanding: 4,
    homework: "fair",
    notes:
      "늦은 출석이 있었으나 수업 참여도는 괜찮습니다. 과제 완성도를 높여주세요.",
    createdDate: "2024-01-19",
    lastModified: "2024-01-19",
  },
  {
    id: "ms-record-4",
    studentId: 6, // 강민규 (8학년)
    teacherId: "teacher-2",
    classId: "class-2",
    weekOf: "2024-01-15",
    attendance: "present",
    participation: 4,
    understanding: 5,
    homework: "excellent",
    notes: "문법 이해력이 뛰어나며, 다른 학생들에게도 도움을 줍니다.",
    createdDate: "2024-01-19",
    lastModified: "2024-01-19",
  },
];
