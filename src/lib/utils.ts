import {
  AvailabilityAnalysis,
  ClassBlock,
  ClassSchedulingSuggestion,
  ScheduleConfig,
  Student,
  StudentSchedule,
  StudentScheduleBlock,
  StudentWeeklyView,
} from "@/types/schedule";

// 기본 시간표 설정
export const defaultScheduleConfig: ScheduleConfig = {
  startHour: 9,
  endHour: 24,
  timeSlotMinutes: 10,
  showWeekend: true,
  firstDayOfWeek: 1, // 월요일 시작
};

// Mock data functions removed - use API data instead

// 실제 API 데이터로 밀집도 계산하는 함수
export function calculateDensityFromScheduleData(
  config: ScheduleConfig,
  classSchedules: Array<{ class: { day_of_week: number; start_time: string; end_time: string } | null }>,
  personalSchedules: Array<{ day_of_week: number; start_time: string; end_time: string }>
) {
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

  // 수업 일정 카운트
  classSchedules.forEach((cs) => {
    if (!cs.class) return;
    const { day_of_week, start_time, end_time } = cs.class;

    const startHour = parseInt(start_time.split(":")[0]);
    const startMinute = parseInt(start_time.split(":")[1]);
    const endHour = parseInt(end_time.split(":")[0]);
    const endMinute = parseInt(end_time.split(":")[1]);
    const startMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;

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
      const key = `${day_of_week}-${time}`;
      if (timeSlots[key] !== undefined) {
        timeSlots[key]++;
      }
    }
  });

  // 개인 일정 카운트
  personalSchedules.forEach((ps) => {
    const startHour = parseInt(ps.start_time.split(":")[0]);
    const startMinute = parseInt(ps.start_time.split(":")[1]);
    const endHour = parseInt(ps.end_time.split(":")[0]);
    const endMinute = parseInt(ps.end_time.split(":")[1]);
    const startMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;

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
      const key = `${ps.day_of_week}-${time}`;
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
    // 낮은 밀집도: 연한 초록 (투명도 낮음)
    return `rgba(34, 197, 94, ${0.15 + ratio * 0.2})`; // green-500 기반, 투명도 0.15-0.21
  } else if (ratio <= 0.7) {
    // 중간 밀집도: 노랑 (투명도 중간)
    return `rgba(234, 179, 8, ${0.2 + ratio * 0.25})`; // yellow-500 기반, 투명도 0.2-0.375
  } else {
    // 높은 밀집도: 빨강 (투명도 높음)
    return `rgba(239, 68, 68, ${0.3 + ratio * 0.3})`; // red-500 기반, 투명도 0.3-0.6
  }
}

// Mock function removed - use custom tooltip data instead

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

// 학생 개별 시간표 데이터 생성 함수
export function generateStudentWeeklyView(
  studentId: number
): StudentWeeklyView {
  const student = students.find((s) => s.id === studentId);
  if (!student) {
    throw new Error(`Student with id ${studentId} not found`);
  }

  // 시간 슬롯 생성 (9:00 ~ 22:00, 30분 단위)
  const timeSlots: string[] = [];
  for (let hour = 9; hour <= 22; hour++) {
    timeSlots.push(`${hour.toString().padStart(2, "0")}:00`);
    if (hour < 22) {
      timeSlots.push(`${hour.toString().padStart(2, "0")}:30`);
    }
  }

  // 해당 학생의 수업 일정
  const studentClassIds = classStudents
    .filter((cs) => cs.studentId === studentId && cs.status === "active")
    .map((cs) => cs.classId);

  const studentClasses = classes.filter((cls) =>
    studentClassIds.includes(cls.id)
  );

  // 해당 학생의 개인 일정
  const studentPersonalSchedules = studentSchedules.filter(
    (s) => s.studentId === studentId && s.status === "active"
  );

  // 스케줄 블록 생성
  const scheduleBlocks: StudentScheduleBlock[] = [];

  // 수업 블록 추가
  studentClasses.forEach((cls) => {
    scheduleBlocks.push({
      id: `class-${cls.id}`,
      title: cls.title,
      type: "class",
      startTime: cls.startTime,
      endTime: cls.endTime,
      dayOfWeek: cls.dayOfWeek,
      color: cls.color,
      location: cls.room,
      teacherName: cls.teacherName,
      subject: cls.subject,
      description: `${cls.subject} 수업 - ${cls.teacherName} 강사`,
      isEditable: false, // 수업은 편집 불가
    });
  });

  // 개인 일정 블록 추가
  studentPersonalSchedules.forEach((schedule) => {
    const typeColorMap = {
      personal: "#10b981", // green-500
      extracurricular: "#8b5cf6", // violet-500
      study: "#f59e0b", // amber-500
      appointment: "#ec4899", // pink-500
      other: "#6b7280", // gray-500
    };

    scheduleBlocks.push({
      id: schedule.id,
      title: schedule.title,
      type: schedule.type,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      dayOfWeek: schedule.dayOfWeek,
      color: typeColorMap[schedule.type] || typeColorMap.other,
      location: schedule.location,
      description: schedule.description,
      isEditable: true, // 개인 일정은 편집 가능
    });
  });

  return {
    student,
    scheduleBlocks,
    weekDays: ["월", "화", "수", "목", "금", "토", "일"],
    timeSlots,
  };
}
