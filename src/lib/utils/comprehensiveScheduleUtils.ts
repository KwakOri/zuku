import { 
  Student, 
  StudentSchedule, 
  Class, 
  ClassStudent 
} from "@/types/schedule";
import { 
  StudentComprehensiveSchedule, 
  DaySchedule, 
  TimeSlot, 
  ScheduleItem,
  DEFAULT_SCHEDULE_CONFIG 
} from "@/types/comprehensiveSchedule";

/**
 * 시간 문자열을 분으로 변환
 */
export function timeToMinutes(time: string): number {
  const [hour, minute] = time.split(':').map(Number);
  return hour * 60 + minute;
}

/**
 * 분을 시간 문자열로 변환
 */
export function minutesToTime(minutes: number): string {
  const hour = Math.floor(minutes / 60);
  const minute = minutes % 60;
  return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
}

/**
 * 요일별 시간 슬롯 생성
 */
export function generateTimeSlots(dayIndex: number): TimeSlot[] {
  const config = DEFAULT_SCHEDULE_CONFIG;
  const isWeekend = dayIndex === 5 || dayIndex === 6; // 토요일(5), 일요일(6)
  
  const startHour = isWeekend ? config.weekendStartHour : config.weekdayStartHour;
  const endHour = isWeekend ? config.weekendEndHour : config.weekdayEndHour;
  
  const slots: TimeSlot[] = [];
  for (let hour = startHour; hour <= endHour; hour++) {
    slots.push({
      hour,
      label: hour.toString()
    });
  }
  
  return slots;
}

/**
 * 수업 데이터를 ScheduleItem으로 변환
 */
export function classToScheduleItem(cls: Class): ScheduleItem {
  return {
    id: `class-${cls.id}`,
    title: cls.title,
    startTime: cls.startTime,
    endTime: cls.endTime,
    type: "class",
    color: cls.color,
    subject: cls.subject,
    location: cls.room
  };
}

/**
 * 개인 일정을 ScheduleItem으로 변환
 */
export function personalScheduleToScheduleItem(schedule: StudentSchedule): ScheduleItem {
  return {
    id: `personal-${schedule.id}`,
    title: schedule.title,
    startTime: schedule.startTime,
    endTime: schedule.endTime,
    type: "personal",
    color: schedule.color,
    location: schedule.location
  };
}

/**
 * 시간표 항목이 특정 시간 슬롯과 겹치는지 확인
 */
export function isScheduleInTimeSlot(schedule: ScheduleItem, hour: number): boolean {
  const scheduleStart = timeToMinutes(schedule.startTime);
  const scheduleEnd = timeToMinutes(schedule.endTime);
  const slotStart = hour * 60;
  const slotEnd = (hour + 1) * 60;
  
  return scheduleStart < slotEnd && scheduleEnd > slotStart;
}

/**
 * 학생의 종합 시간표 생성
 */
export function generateStudentComprehensiveSchedule(
  student: Student,
  studentClasses: Class[],
  personalSchedules: StudentSchedule[]
): StudentComprehensiveSchedule {
  const config = DEFAULT_SCHEDULE_CONFIG;
  
  // 요일별 스케줄 생성 (월=0, 화=1, ..., 일=6)
  const weeklySchedule: DaySchedule[] = config.dayNames.map((dayName, dayIndex) => {
    const timeSlots = generateTimeSlots(dayIndex);
    
    // 해당 요일의 수업 찾기 (dayOfWeek: 0=일, 1=월, 2=화, ...)
    const dayOfWeekMapping = dayIndex === 6 ? 0 : dayIndex + 1; // 일요일 처리
    const dayClasses = studentClasses
      .filter(cls => cls.dayOfWeek === dayOfWeekMapping)
      .map(classToScheduleItem);
    
    // 해당 요일의 개인 일정 찾기 (dayOfWeek: 0=월, 1=화, ..., 6=일)
    const dayPersonalSchedules = personalSchedules
      .filter(schedule => schedule.dayOfWeek === dayIndex && schedule.status === 'active')
      .map(personalScheduleToScheduleItem);
    
    return {
      dayIndex,
      dayName,
      timeSlots,
      schedules: [...dayClasses, ...dayPersonalSchedules]
    };
  });
  
  return {
    student,
    school: "중앙중학교", // 임시 학교명
    weeklySchedule,
    classSchedules: studentClasses,
    personalSchedules: personalSchedules.filter(s => s.status === 'active')
  };
}

/**
 * 여러 학생의 종합 시간표 생성
 */
export function generateAllStudentsComprehensiveSchedules(
  students: Student[],
  classes: Class[],
  classStudents: ClassStudent[],
  studentSchedules: StudentSchedule[]
): StudentComprehensiveSchedule[] {
  return students.map(student => {
    // 해당 학생이 수강하는 수업 찾기
    const studentClassIds = classStudents
      .filter(cs => cs.studentId === student.id && cs.status === 'active')
      .map(cs => cs.classId);
    
    const studentClasses = classes.filter(cls => studentClassIds.includes(cls.id));
    
    // 해당 학생의 개인 일정 찾기
    const personalSchedules = studentSchedules.filter(
      schedule => schedule.studentId === student.id
    );
    
    return generateStudentComprehensiveSchedule(student, studentClasses, personalSchedules);
  });
}

/**
 * 특정 시간 슬롯에서의 스케줄 찾기
 */
export function findScheduleInTimeSlot(
  schedules: ScheduleItem[],
  hour: number
): ScheduleItem | undefined {
  return schedules.find(schedule => isScheduleInTimeSlot(schedule, hour));
}