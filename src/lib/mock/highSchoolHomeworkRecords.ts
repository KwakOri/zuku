import { HighSchoolHomeworkRecord } from "@/types/schedule";

// 고등 숙제 검사 기록 데이터
export const highSchoolHomeworkRecords: HighSchoolHomeworkRecord[] = [
  {
    id: "hs-record-1",
    studentId: 1, // 정우진 (11학년)
    assistantId: "assistant-1",
    classId: "class-1",
    date: "2024-01-08",
    homeworkRange: "수학의 바이블 p.125-145, 문제 1-25",
    achievement: "good",
    completionRate: 85,
    accuracy: 78,
    notes: "계산 실수가 몇 개 있었지만 전반적으로 잘 해결했습니다.",
    createdDate: "2024-01-08",
  },
  {
    id: "hs-record-2",
    studentId: 2, // 김서윤 (10학년)
    assistantId: "assistant-2",
    classId: "class-2",
    date: "2024-01-08",
    homeworkRange: "Grammar in Use Unit 15-17",
    achievement: "excellent",
    completionRate: 100,
    accuracy: 92,
    notes: "문법 이해도가 높고 응용 문제도 잘 풀었습니다.",
    createdDate: "2024-01-08",
  },
  {
    id: "hs-record-3",
    studentId: 4, // 박하은 (12학년)
    assistantId: "assistant-1",
    classId: "class-1",
    date: "2024-01-09",
    homeworkRange: "기출문제집 2023년 6월 모의고사 전체",
    achievement: "fair",
    completionRate: 70,
    accuracy: 65,
    notes: "시간 관리가 부족해 보입니다. 좀 더 체계적인 접근이 필요합니다.",
    createdDate: "2024-01-09",
  },
  {
    id: "hs-record-4",
    studentId: 5, // 최도윤 (10학년)
    assistantId: "assistant-2",
    classId: "class-2",
    date: "2024-01-09",
    homeworkRange: "Reading Comprehension Chapter 8-10",
    achievement: "poor",
    completionRate: 50,
    accuracy: 45,
    notes: "과제 완성도가 낮습니다. 추가 지도가 필요합니다.",
    createdDate: "2024-01-09",
  },
  {
    id: "hs-record-5",
    studentId: 7, // 조서현 (11학년)
    assistantId: "assistant-1",
    classId: "class-1",
    date: "2024-01-10",
    homeworkRange: "개념원리 수학2 p.200-230",
    achievement: "excellent",
    completionRate: 95,
    accuracy: 88,
    notes: "꾸준히 실력이 향상되고 있습니다. 심화 문제도 도전해보세요.",
    createdDate: "2024-01-10",
  },
  {
    id: "hs-record-6",
    studentId: 8, // 윤지훈 (12학년)
    assistantId: "assistant-1",
    classId: "class-1",
    date: "2024-01-10",
    homeworkRange: "수능특강 수학 1회~3회 실전모의고사",
    achievement: "good",
    completionRate: 90,
    accuracy: 82,
    notes: "실전 감각이 좋아지고 있습니다. 시간 배분에 더 신경 써주세요.",
    createdDate: "2024-01-10",
  },
];
