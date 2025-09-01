import { ClassException } from "@/types/schedule";

export const classExceptions: ClassException[] = [
  // 수학 A반 휴강 (추석 연휴)
  {
    id: "ex-1",
    classId: "class-1",
    date: "2024-09-16", // 추석
    type: "cancel",
    reason: "추석 연휴로 인한 휴강",
  },
  // 영어 A반 시간 변경
  {
    id: "ex-2",
    classId: "class-2",
    date: "2024-09-11",
    type: "reschedule",
    reason: "강사 개인사정으로 시간 변경",
    newStartTime: "17:00",
    newEndTime: "18:30",
  },
  // 화학 실험반 대체 강사
  {
    id: "ex-3",
    classId: "class-4",
    date: "2024-09-13",
    type: "substitute",
    reason: "담당 강사 병가로 대체 강사 수업",
    substituteTeacherId: "teacher-1",
  },
  // 수학 B반 휴강 (강사 연수)
  {
    id: "ex-4",
    classId: "class-3",
    date: "2024-09-09",
    type: "cancel",
    reason: "강사 연수 참석으로 인한 휴강",
  },
  // 영어 B반 교실 변경
  {
    id: "ex-5",
    classId: "class-5",
    date: "2024-09-17",
    type: "reschedule",
    reason: "교실 공사로 인한 교실 변경",
    newRoom: "B203",
  },
  // 중3 수학 A반 시간 단축
  {
    id: "ex-6",
    classId: "class-6",
    date: "2024-09-25",
    type: "reschedule",
    reason: "시설 점검으로 수업 시간 단축",
    newStartTime: "17:00",
    newEndTime: "18:00",
  },
  // 중3 영어 A반 휴강 (한글날)
  {
    id: "ex-7",
    classId: "class-7",
    date: "2024-10-09", // 한글날
    type: "cancel",
    reason: "한글날 공휴일로 인한 휴강",
  },
  // 물리 입문반 대체 강사 (주강사 출장)
  {
    id: "ex-8",
    classId: "class-8",
    date: "2024-09-24",
    type: "substitute",
    reason: "담당 강사 출장으로 대체 강사 수업",
    substituteTeacherId: "teacher-3",
  },
];
