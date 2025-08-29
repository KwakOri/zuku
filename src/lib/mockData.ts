import {
  Class,
  ClassException,
  ClassStudent,
  Student,
  Teacher,
  ClassBlock,
  ScheduleConfig,
} from "@/types/schedule";

export const teachers: Teacher[] = [
  { 
    id: "teacher-1", 
    name: "김수학", 
    subjects: ["수학", "물리"], 
    phone: "010-1111-2222",
    email: "kim.math@academy.com"
  },
  { 
    id: "teacher-2", 
    name: "박영어", 
    subjects: ["영어", "영문법"], 
    phone: "010-3333-4444",
    email: "park.english@academy.com"
  },
  { 
    id: "teacher-3", 
    name: "이과학", 
    subjects: ["화학", "생물"], 
    phone: "010-5555-6666",
    email: "lee.science@academy.com"
  },
];

export const students: Student[] = [
  { 
    id: "student-1", 
    name: "이민수", 
    grade: "중2", 
    parentPhone: "010-1111-0000",
    email: "minsu.lee@student.com"
  },
  { 
    id: "student-2", 
    name: "김지현", 
    grade: "중2", 
    parentPhone: "010-2222-0000",
    email: "jihyun.kim@student.com"
  },
  { 
    id: "student-3", 
    name: "박준호", 
    grade: "중3", 
    parentPhone: "010-3333-0000",
    email: "junho.park@student.com"
  },
];

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
    maxStudents: 15,
    description: "중학교 2학년 수학 기본반",
  },
  {
    id: "class-2",
    title: "중2 영어 초급반",
    subject: "영어",
    teacherId: "teacher-2",
    teacherName: "박영어",
    startTime: "16:00",
    endTime: "17:30",
    dayOfWeek: 3, // 수요일
    color: "#10B981", // emerald-500
    room: "B201",
    maxStudents: 12,
    description: "중학교 2학년 영어 초급반",
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
    maxStudents: 15,
    description: "중학교 2학년 수학 심화반",
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
    maxStudents: 8,
    description: "중학교 3학년 화학 실험반",
  },
  {
    id: "class-5",
    title: "중2 영어 중급반",
    subject: "영어",
    teacherId: "teacher-2",
    teacherName: "박영어",
    startTime: "18:00",
    endTime: "19:30",
    dayOfWeek: 2, // 화요일
    color: "#10B981", // emerald-500
    room: "B202",
    maxStudents: 12,
    description: "중학교 2학년 영어 중급반",
  },
];

export const classStudents: ClassStudent[] = [
  { id: "cs-1", classId: "class-1", studentId: "student-1", enrolledDate: "2024-01-01", status: "active" },
  { id: "cs-2", classId: "class-1", studentId: "student-2", enrolledDate: "2024-01-01", status: "active" },
  { id: "cs-3", classId: "class-2", studentId: "student-1", enrolledDate: "2024-01-15", status: "active" },
  { id: "cs-4", classId: "class-3", studentId: "student-2", enrolledDate: "2024-02-01", status: "active" },
  { id: "cs-5", classId: "class-4", studentId: "student-3", enrolledDate: "2024-01-01", status: "active" },
  { id: "cs-6", classId: "class-5", studentId: "student-1", enrolledDate: "2024-02-15", status: "active" },
];

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

// 기본 시간표 설정
export const defaultScheduleConfig: ScheduleConfig = {
  startHour: 9,
  endHour: 22,
  timeSlotMinutes: 10,
  showWeekend: true,
  firstDayOfWeek: 1, // 월요일 시작
};

// 더미 ClassBlock 데이터 생성 함수
export function generateClassBlocks(): ClassBlock[] {
  return classes.map(cls => {
    const studentsInClass = classStudents.filter(cs => cs.classId === cls.id && cs.status === 'active');
    
    return {
      id: cls.id,
      classId: cls.id,
      title: cls.title,
      subject: cls.subject,
      teacherName: cls.teacherName,
      startTime: cls.startTime,
      endTime: cls.endTime,
      dayOfWeek: cls.dayOfWeek,
      color: cls.color,
      room: cls.room,
      studentCount: studentsInClass.length,
      maxStudents: cls.maxStudents,
    };
  });
}
