import { ClassStudent } from "@/types/schedule";

// 각 학생은 1개의 수업만 수강 가능하며, 개인 일정과 시간이 겹치면 안됨
export const classStudents: ClassStudent[] = [
  // 학생 1 (정우진): class-1 (중2 수학 A반, 월 14:00-15:30) - 피아노(월16:00), 수영(수18:00)과 충돌 없음
  {
    id: "cs-1",
    classId: "class-1",
    studentId: 1,
    enrolledDate: "2024-01-01",
    status: "active",
  },
  // 학생 2 (김서윤): class-2 (중2 영어 A반, 수 16:00-17:30) - 태권도(화17:30), 미술(목19:00)과 충돌 없음
  {
    id: "cs-2",
    classId: "class-2",
    studentId: 2,
    enrolledDate: "2024-01-01",
    status: "active",
  },
  // 학생 3 (이민서): class-4 (중3 화학 실험반, 금 19:00-20:30) - 코딩(수16:30), 농구(금20:00)와 충돌 있음 -> 농구시간 변경
  {
    id: "cs-3",
    classId: "class-4",
    studentId: 3,
    enrolledDate: "2024-01-01",
    status: "active",
  },
  // 학생 4 (박하은): class-3 (중2 수학 B반, 월 15:30-17:00) - 첼로(일17:00), 과학실험(토16:00)과 충돌 없음
  {
    id: "cs-4",
    classId: "class-3",
    studentId: 4,
    enrolledDate: "2024-02-01",
    status: "active",
  },
  // 학생 5 (최도윤): class-5 (중2 영어 B반, 화 18:00-19:30) - 중국어(월18:00), 복싱(수20:30)과 충돌 없음
  {
    id: "cs-5",
    classId: "class-5",
    studentId: 5,
    enrolledDate: "2024-02-15",
    status: "active",
  },
  // 학생 6 (강민규): class-6 (중3 수학 A반, 수 17:00-18:30) - 요가(화16:00), 기타(목19:00)과 충돌 없음
  {
    id: "cs-6",
    classId: "class-6",
    studentId: 6,
    enrolledDate: "2024-01-01",
    status: "active",
  },
  // 학생 7 (조서현): class-7 (중3 영어 A반, 목 14:00-15:30) - 축구(일17:00), 입시미술(토19:30)과 충돌 없음
  {
    id: "cs-7",
    classId: "class-7",
    studentId: 7,
    enrolledDate: "2024-03-01",
    status: "active",
  },
  // 학생 8 (윤지훈): class-8 (중2 물리 입문반, 화 19:30-21:00) - 바이올린(월16:30), 토론(금18:00)과 충돌 없음
  {
    id: "cs-8",
    classId: "class-8",
    studentId: 8,
    enrolledDate: "2024-01-01",
    status: "active",
  },
  // 학생 9 (송은서): class-1 (중2 수학 A반, 월 14:00-15:30) - 필라테스(화19:00), 밴드(토20:00)과 충돌 없음
  {
    id: "cs-9",
    classId: "class-1",
    studentId: 9,
    enrolledDate: "2024-01-15",
    status: "active",
  },
  // 학생 10 (한준서): class-2 (중2 영어 A반, 수 16:00-17:30) - 성악(일17:30), 체스(목20:00)과 충돌 없음
  {
    id: "cs-10",
    classId: "class-2",
    studentId: 10,
    enrolledDate: "2024-02-01",
    status: "active",
  },
  // 학생 11 (임유진): class-6 (중3 수학 A반, 수 17:00-18:30) - 클라리넷(월16:00), 테니스(수18:00)와 시간 겹침 -> 테니스 시간 조정
  {
    id: "cs-11",
    classId: "class-6",
    studentId: 11,
    enrolledDate: "2024-01-01",
    status: "active",
  },
  // 학생 12 (고민준): class-7 (중3 영어 A반, 목 14:00-15:30) - 독서모임(화19:00), 배드민턴(토20:30)과 충돌 없음
  {
    id: "cs-12",
    classId: "class-7",
    studentId: 12,
    enrolledDate: "2024-04-01",
    status: "active",
  },
  // 학생 13 (오지우): class-4 (중3 화학 실험반, 금 19:00-20:30) - 피아노(일16:00), 축구(화18:00)과 충돌 없음
  {
    id: "cs-13",
    classId: "class-4",
    studentId: 13,
    enrolledDate: "2024-01-01",
    status: "active",
  },
  // 학생 14 (노채은): class-3 (중2 수학 B반, 월 15:30-17:00) - 태권도(월17:30), 미술(목19:00)과 충돌 없음
  {
    id: "cs-14",
    classId: "class-3",
    studentId: 14,
    enrolledDate: "2024-01-01",
    status: "active",
  },
  // 학생 15 (전수빈): class-5 (중2 영어 B반, 화 18:00-19:30) - 코딩(수16:30), 농구(금20:00)과 충돌 없음
  {
    id: "cs-15",
    classId: "class-5",
    studentId: 15,
    enrolledDate: "2024-04-10",
    status: "active",
  },
];
