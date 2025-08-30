import { Assistant } from "@/types/schedule";

// 조교 데이터
export const assistants: Assistant[] = [
  {
    id: "assistant-1",
    name: "김조교",
    teacherId: "teacher-1",
    subjects: ["수학"],
    phone: "010-1111-1111",
    email: "kim.assistant@academy.com",
    assignedGrades: [10, 11, 12],
  },
  {
    id: "assistant-2",
    name: "이조교",
    teacherId: "teacher-2",
    subjects: ["영어"],
    phone: "010-2222-2222",
    email: "lee.assistant@academy.com",
    assignedGrades: [10, 11, 12],
  },
  {
    id: "assistant-3",
    name: "박조교",
    teacherId: "teacher-3",
    subjects: ["화학", "생물"],
    phone: "010-3333-3333",
    email: "park.assistant@academy.com",
    assignedGrades: [10, 11],
  },
];
