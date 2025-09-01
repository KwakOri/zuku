import { Class } from "@/types/schedule";

export const classes: Class[] = [
  {
    id: "class-1",
    title: "중2 수학 A반",
    subject: "수학",
    teacherId: "teacher-1",
    teacherName: "김수학",
    startTime: "14:00",
    endTime: "15:30",
    dayOfWeek: 1, // 월요일
    color: "#3B82F6", // blue-500
    room: "A101",
    maxStudents: 8,
    description: "중학교 2학년 수학 기본반",
    rrule: "FREQ=WEEKLY;BYDAY=MO",
  },
  {
    id: "class-2",
    title: "중2 영어 A반",
    subject: "영어",
    teacherId: "teacher-2",
    teacherName: "박영어",
    startTime: "16:00",
    endTime: "17:30",
    dayOfWeek: 3, // 수요일
    color: "#10B981", // emerald-500
    room: "B201",
    maxStudents: 8,
    description: "중학교 2학년 영어 기본반",
    rrule: "FREQ=WEEKLY;BYDAY=WE",
  },
  {
    id: "class-3",
    title: "중2 수학 B반",
    subject: "수학",
    teacherId: "teacher-1",
    teacherName: "김수학",
    startTime: "15:30",
    endTime: "17:00",
    dayOfWeek: 1, // 월요일
    color: "#3B82F6", // blue-500
    room: "A102",
    maxStudents: 8,
    description: "중학교 2학년 수학 심화반",
    rrule: "FREQ=WEEKLY;BYDAY=MO",
  },
  {
    id: "class-4",
    title: "중3 화학 실험반",
    subject: "화학",
    teacherId: "teacher-3",
    teacherName: "이과학",
    startTime: "19:00",
    endTime: "20:30",
    dayOfWeek: 5, // 금요일
    color: "#F59E0B", // amber-500
    room: "실험실",
    maxStudents: 6,
    description: "중학교 3학년 화학 실험반",
    rrule: "FREQ=WEEKLY;BYDAY=FR",
  },
  {
    id: "class-5",
    title: "중2 영어 B반",
    subject: "영어",
    teacherId: "teacher-2",
    teacherName: "박영어",
    startTime: "18:00",
    endTime: "19:30",
    dayOfWeek: 2, // 화요일
    color: "#10B981", // emerald-500
    room: "B202",
    maxStudents: 8,
    description: "중학교 2학년 영어 심화반",
    rrule: "FREQ=WEEKLY;BYDAY=TU",
  },
  {
    id: "class-6",
    title: "중3 수학 A반",
    subject: "수학",
    teacherId: "teacher-1",
    teacherName: "김수학",
    startTime: "17:00",
    endTime: "18:30",
    dayOfWeek: 3, // 수요일
    color: "#3B82F6", // blue-500
    room: "A103",
    maxStudents: 8,
    description: "중학교 3학년 수학 기본반",
    rrule: "FREQ=WEEKLY;BYDAY=WE",
  },
  {
    id: "class-7",
    title: "중3 영어 A반",
    subject: "영어",
    teacherId: "teacher-2",
    teacherName: "박영어",
    startTime: "14:00",
    endTime: "15:30",
    dayOfWeek: 4, // 목요일
    color: "#10B981", // emerald-500
    room: "B203",
    maxStudents: 8,
    description: "중학교 3학년 영어 기본반",
    rrule: "FREQ=WEEKLY;BYDAY=TH",
  },
  {
    id: "class-8",
    title: "중2 물리 입문반",
    subject: "물리",
    teacherId: "teacher-1",
    teacherName: "김수학",
    startTime: "19:30",
    endTime: "21:00",
    dayOfWeek: 2, // 화요일
    color: "#8B5CF6", // violet-500
    room: "A104",
    maxStudents: 6,
    description: "중학교 2학년 물리 입문반",
    rrule: "FREQ=WEEKLY;BYDAY=TU",
  },
];
