import { ClassException } from "@/types/schedule";

export const classExceptions: ClassException[] = [
  {
    id: "ex-1",
    classId: "class-1",
    date: "2024-09-01",
    type: "cancel",
    reason: "추석 연휴",
  },
  {
    id: "ex-2",
    classId: "class-2",
    date: "2024-09-15",
    type: "reschedule",
    reason: "강사 개인사정",
    newStartTime: "17:00",
    newEndTime: "18:30",
  },
];
