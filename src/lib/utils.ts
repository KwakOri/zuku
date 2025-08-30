import { classes } from "@/lib/mock/classes";
import { classStudents } from "@/lib/mock/classStudents";
import { students } from "@/lib/mock/students";
import { studentSchedules } from "@/lib/mock/studentSchedules";
import {
  AvailabilityAnalysis,
  ClassBlock,
  ClassSchedulingSuggestion,
  ScheduleConfig,
  Student,
  StudentSchedule,
} from "@/types/schedule";

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

// 시간대별 학생 일정 밀집도 계산 함수
export function calculateStudentDensity(config: ScheduleConfig) {
  const timeSlots: { [key: string]: number } = {};

  // 모든 시간 슬롯 초기화
  for (let day = 0; day < 7; day++) {
    for (let hour = config.startHour; hour <= config.endHour; hour++) {
      for (let minute = 0; minute < 60; minute += config.timeSlotMinutes) {
        const time = `${hour.toString().padStart(2, "0")}:${minute
          .toString()
          .padStart(2, "0")}`;
        const key = `${day}-${time}`;
        timeSlots[key] = 0;
      }
    }
  }

  // 학생 일정 카운트
  studentSchedules.forEach((schedule) => {
    if (schedule.status !== "active") return;

    const startHour = parseInt(schedule.startTime.split(":")[0]);
    const startMinute = parseInt(schedule.startTime.split(":")[1]);
    const endHour = parseInt(schedule.endTime.split(":")[0]);
    const endMinute = parseInt(schedule.endTime.split(":")[1]);

    const startMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;

    // 시작 시간부터 종료 시간까지 모든 슬롯에 카운트 추가
    for (
      let minutes = startMinutes;
      minutes < endMinutes;
      minutes += config.timeSlotMinutes
    ) {
      const hour = Math.floor(minutes / 60);
      const minute = minutes % 60;
      const time = `${hour.toString().padStart(2, "0")}:${minute
        .toString()
        .padStart(2, "0")}`;
      const key = `${schedule.dayOfWeek}-${time}`;

      if (timeSlots[key] !== undefined) {
        timeSlots[key]++;
      }
    }
  });

  return timeSlots;
}

// 밀집도에 따른 색상 계산 함수
export function getDensityColor(density: number, maxDensity: number): string {
  if (density === 0) return "transparent";

  const ratio = density / maxDensity;

  if (ratio <= 0.3) {
    // 낮은 밀집도: 파랑 → 초록
    return `rgba(34, 197, 94, ${0.3 + ratio * 0.4})`; // green-500 기반
  } else if (ratio <= 0.7) {
    // 중간 밀집도: 초록 → 노랑
    return `rgba(234, 179, 8, ${0.4 + ratio * 0.3})`; // yellow-500 기반
  } else {
    // 높은 밀집도: 노랑 → 빨강
    return `rgba(239, 68, 68, ${0.5 + ratio * 0.4})`; // red-500 기반
  }
}

// 특정 시간대의 학생들 정보 가져오기 함수
export function getStudentsAtTime(dayOfWeek: number, time: string) {
  const studentsAtTime: Array<{ student: Student; schedule: StudentSchedule }> =
    [];

  const targetHour = parseInt(time.split(":")[0]);
  const targetMinute = parseInt(time.split(":")[1]);
  const targetMinutes = targetHour * 60 + targetMinute;

  studentSchedules.forEach((schedule) => {
    if (schedule.status !== "active" || schedule.dayOfWeek !== dayOfWeek)
      return;

    const startHour = parseInt(schedule.startTime.split(":")[0]);
    const startMinute = parseInt(schedule.startTime.split(":")[1]);
    const endHour = parseInt(schedule.endTime.split(":")[0]);
    const endMinute = parseInt(schedule.endTime.split(":")[1]);

    const startMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;

    // 해당 시간이 일정 시간 범위에 포함되는지 확인
    if (targetMinutes >= startMinutes && targetMinutes < endMinutes) {
      const student = students.find((s) => s.id === schedule.studentId);
      if (student) {
        studentsAtTime.push({ student, schedule });
      }
    }
  });

  return studentsAtTime;
}

// 시간표 가용 시간 분석 함수
export function analyzeStudentAvailability(
  studentId: number,
  dayOfWeek: number
): AvailabilityAnalysis {
  const studentScheduleList = studentSchedules.filter(
    (s) =>
      s.studentId === studentId &&
      s.dayOfWeek === dayOfWeek &&
      s.status === "active"
  );

  // 하루를 30분 단위로 나누어 가용 시간 계산 (9:00 ~ 22:00)
  const timeSlots: {
    startTime: string;
    endTime: string;
    available: boolean;
  }[] = [];
  for (let hour = 9; hour < 22; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const startTime = `${hour.toString().padStart(2, "0")}:${minute
        .toString()
        .padStart(2, "0")}`;
      const endTime =
        minute === 30
          ? `${(hour + 1).toString().padStart(2, "0")}:00`
          : `${hour.toString().padStart(2, "0")}:30`;

      timeSlots.push({ startTime, endTime, available: true });
    }
  }

  // 기존 일정과 겹치는 시간 표시
  studentScheduleList.forEach((schedule) => {
    const startMinutes =
      parseInt(schedule.startTime.split(":")[0]) * 60 +
      parseInt(schedule.startTime.split(":")[1]);
    const endMinutes =
      parseInt(schedule.endTime.split(":")[0]) * 60 +
      parseInt(schedule.endTime.split(":")[1]);

    timeSlots.forEach((slot) => {
      const slotStartMinutes =
        parseInt(slot.startTime.split(":")[0]) * 60 +
        parseInt(slot.startTime.split(":")[1]);
      const slotEndMinutes =
        parseInt(slot.endTime.split(":")[0]) * 60 +
        parseInt(slot.endTime.split(":")[1]);

      if (slotStartMinutes < endMinutes && slotEndMinutes > startMinutes) {
        slot.available = false;
      }
    });
  });

  // 연속된 가용 시간을 그룹화
  const availableSlots: {
    startTime: string;
    endTime: string;
    duration: number;
  }[] = [];
  let currentSlot: {
    startTime: string;
    endTime: string;
    duration: number;
  } | null = null;

  timeSlots.forEach((slot) => {
    if (slot.available) {
      if (!currentSlot) {
        currentSlot = {
          startTime: slot.startTime,
          endTime: slot.endTime,
          duration: 30,
        };
      } else {
        currentSlot.endTime = slot.endTime;
        currentSlot.duration += 30;
      }
    } else {
      if (currentSlot) {
        availableSlots.push(currentSlot);
        currentSlot = null;
      }
    }
  });

  // 마지막 슬롯 추가
  if (currentSlot) {
    availableSlots.push(currentSlot);
  }

  return {
    studentId,
    dayOfWeek,
    availableSlots,
    conflictingSchedules: studentScheduleList,
  };
}

// 수업 스케줄링 제안 함수
export function suggestClassScheduling(
  classId: string,
  dayOfWeek: number,
  startTime: string,
  endTime: string,
  targetStudentIds: number[]
): ClassSchedulingSuggestion {
  const availableStudents: number[] = [];
  const conflictStudents: number[] = [];

  const startMinutes =
    parseInt(startTime.split(":")[0]) * 60 + parseInt(startTime.split(":")[1]);
  const endMinutes =
    parseInt(endTime.split(":")[0]) * 60 + parseInt(endTime.split(":")[1]);

  targetStudentIds.forEach((studentId) => {
    const analysis = analyzeStudentAvailability(studentId, dayOfWeek);
    const hasConflict = analysis.conflictingSchedules.some((schedule) => {
      const scheduleStartMinutes =
        parseInt(schedule.startTime.split(":")[0]) * 60 +
        parseInt(schedule.startTime.split(":")[1]);
      const scheduleEndMinutes =
        parseInt(schedule.endTime.split(":")[0]) * 60 +
        parseInt(schedule.endTime.split(":")[1]);

      return (
        startMinutes < scheduleEndMinutes && endMinutes > scheduleStartMinutes
      );
    });

    if (hasConflict) {
      conflictStudents.push(studentId);
    } else {
      availableStudents.push(studentId);
    }
  });

  // 점수 계산 (가능한 학생 비율 * 100)
  const score = Math.round(
    (availableStudents.length / targetStudentIds.length) * 100
  );

  return {
    classId,
    dayOfWeek,
    startTime,
    endTime,
    availableStudents,
    conflictStudents,
    score,
  };
}

export const getGrade = (
  grade: number,
  type: "full" | "half" = "full"
): string => {
  if (grade < 1 || grade > 12) {
    return type === "half" ? "학년 오류" : "잘못된 학년";
  }

  if (type === "half") {
    if (grade <= 6) return `초${grade}`;
    if (grade <= 9) return `중${grade - 6}`;
    return `고${grade - 9}`;
  }

  const gradeLabels = [
    "초등학교 1학년",
    "초등학교 2학년",
    "초등학교 3학년",
    "초등학교 4학년",
    "초등학교 5학년",
    "초등학교 6학년",
    "중학교 1학년",
    "중학교 2학년",
    "중학교 3학년",
    "고등학교 1학년",
    "고등학교 2학년",
    "고등학교 3학년",
  ];

  return gradeLabels[grade - 1];
};
