import {
  Class,
  ClassBlock,
  ClassException,
  ClassStudent,
  ScheduleConfig,
  Student,
  Teacher,
} from "@/types/schedule";

export const teachers: Teacher[] = [
  {
    id: "teacher-1",
    name: "김수학",
    subjects: ["수학", "물리"],
    phone: "010-1111-2222",
    email: "kim.math@academy.com",
  },
  {
    id: "teacher-2",
    name: "박영어",
    subjects: ["영어", "영문법"],
    phone: "010-3333-4444",
    email: "park.english@academy.com",
  },
  {
    id: "teacher-3",
    name: "이과학",
    subjects: ["화학", "생물"],
    phone: "010-5555-6666",
    email: "lee.science@academy.com",
  },
];

export const students: Student[] = [
  {
    id: 1,
    name: "정우진",
    grade: 11,
    phone: "010-1234-5678",
    parentPhone: "010-9876-5432",
    email: "woojin.jeong@example.com",
  },
  {
    id: 2,
    name: "김서윤",
    grade: 10,
    phone: "010-2345-6789",
    parentPhone: "010-8765-4321",
    email: "seoyoon.kim@example.com",
  },
  {
    id: 3,
    name: "이민서",
    grade: 9,
    phone: "010-3456-7890",
    parentPhone: "010-7654-3210",
    email: "minseo.lee@example.com",
  },
  {
    id: 4,
    name: "박하은",
    grade: 12,
    phone: "010-4567-8901",
    parentPhone: "010-6543-2109",
    email: "haeun.park@example.com",
  },
  {
    id: 5,
    name: "최도윤",
    grade: 10,
    phone: "010-5678-9012",
    parentPhone: "010-5432-1098",
    email: "doyoon.choi@example.com",
  },
  {
    id: 6,
    name: "강민규",
    grade: 8,
    phone: "010-6789-0123",
    parentPhone: "010-4321-0987",
    email: "mingyu.kang@example.com",
  },
  {
    id: 7,
    name: "조서현",
    grade: 11,
    phone: "010-7890-1234",
    parentPhone: "010-3210-9876",
    email: "seohyun.jo@example.com",
  },
  {
    id: 8,
    name: "윤지훈",
    grade: 12,
    phone: "010-8901-2345",
    parentPhone: "010-2109-8765",
    email: "jihun.yoon@example.com",
  },
  {
    id: 9,
    name: "송은서",
    grade: 7,
    phone: "010-9012-3456",
    parentPhone: "010-1098-7654",
    email: "eunseo.song@example.com",
  },
  {
    id: 10,
    name: "한준서",
    grade: 10,
    phone: "010-0123-4567",
    parentPhone: "010-0987-6543",
    email: "junseo.han@example.com",
  },
  {
    id: 11,
    name: "임유진",
    grade: 11,
    phone: "010-1122-3344",
    parentPhone: "010-9988-7766",
    email: "yujin.im@example.com",
  },
  {
    id: 12,
    name: "고민준",
    grade: 12,
    phone: "010-2233-4455",
    parentPhone: "010-8877-6655",
    email: "minjun.go@example.com",
  },
  {
    id: 13,
    name: "오지우",
    grade: 9,
    phone: "010-3344-5566",
    parentPhone: "010-7766-5544",
    email: "jiwoo.oh@example.com",
  },
  {
    id: 14,
    name: "노채은",
    grade: 10,
    phone: "010-4455-6677",
    parentPhone: "010-6655-4433",
    email: "chaeun.no@example.com",
  },
  {
    id: 15,
    name: "전수빈",
    grade: 11,
    phone: "010-5566-7788",
    parentPhone: "010-5544-3322",
    email: "subin.jeon@example.com",
  },
  {
    id: 16,
    name: "문태우",
    grade: 12,
    phone: "010-6677-8899",
    parentPhone: "010-4433-2211",
    email: "taewoo.moon@example.com",
  },
  {
    id: 17,
    name: "김서준",
    grade: 8,
    phone: "010-7788-9900",
    parentPhone: "010-3322-1100",
    email: "seojun.kim@example.com",
  },
  {
    id: 18,
    name: "박윤아",
    grade: 10,
    phone: "010-8899-0011",
    parentPhone: "010-2211-0099",
    email: "yoonah.park@example.com",
  },
  {
    id: 19,
    name: "이시우",
    grade: 11,
    phone: "010-9900-1122",
    parentPhone: "010-1100-9988",
    email: "siwoo.lee@example.com",
  },
  {
    id: 20,
    name: "정지은",
    grade: 12,
    phone: "010-0011-2233",
    parentPhone: "010-0099-8877",
    email: "jieun.jeong@example.com",
  },
  {
    id: 21,
    name: "최민서",
    grade: 7,
    phone: "010-1122-3344",
    parentPhone: "010-9988-7766",
    email: "minseo.choi@example.com",
  },
  {
    id: 22,
    name: "강유빈",
    grade: 10,
    phone: "010-2233-4455",
    parentPhone: "010-8877-6655",
    email: "yubin.kang@example.com",
  },
  {
    id: 23,
    name: "윤예원",
    grade: 11,
    phone: "010-3344-5566",
    parentPhone: "010-7766-5544",
    email: "yewon.yoon@example.com",
  },
  {
    id: 24,
    name: "조우진",
    grade: 12,
    phone: "010-4455-6677",
    parentPhone: "010-6655-4433",
    email: "woojin.jo@example.com",
  },
  {
    id: 25,
    name: "송서윤",
    grade: 9,
    phone: "010-5566-7788",
    parentPhone: "010-5544-3322",
    email: "seoyoon.song@example.com",
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
    dayOfWeek: 0, // 월요일
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
    dayOfWeek: 2, // 수요일
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
    dayOfWeek: 0, // 월요일
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
    dayOfWeek: 4, // 금요일
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
    dayOfWeek: 1, // 화요일
    color: "#10B981", // emerald-500
    room: "B202",
    maxStudents: 12,
    description: "중학교 2학년 영어 중급반",
  },
];

export const classStudents: ClassStudent[] = [
  {
    id: "cs-1",
    classId: "class-1",
    studentId: "student-1",
    enrolledDate: "2024-01-01",
    status: "active",
  },
  {
    id: "cs-2",
    classId: "class-1",
    studentId: "student-2",
    enrolledDate: "2024-01-01",
    status: "active",
  },
  {
    id: "cs-3",
    classId: "class-2",
    studentId: "student-1",
    enrolledDate: "2024-01-15",
    status: "active",
  },
  {
    id: "cs-4",
    classId: "class-3",
    studentId: "student-2",
    enrolledDate: "2024-02-01",
    status: "active",
  },
  {
    id: "cs-5",
    classId: "class-4",
    studentId: "student-3",
    enrolledDate: "2024-01-01",
    status: "active",
  },
  {
    id: "cs-6",
    classId: "class-5",
    studentId: "student-1",
    enrolledDate: "2024-02-15",
    status: "active",
  },
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
  endHour: 24,
  timeSlotMinutes: 10,
  showWeekend: true,
  firstDayOfWeek: 1, // 월요일 시작
};

// 더미 ClassBlock 데이터 생성 함수
export function generateClassBlocks(): ClassBlock[] {
  return classes.map((cls) => {
    const studentsInClass = classStudents.filter(
      (cs) => cs.classId === cls.id && cs.status === "active"
    );

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
