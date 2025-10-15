import { ScheduleConfig } from "@/types/schedule";

// 기본 시간표 설정
export const defaultScheduleConfig: ScheduleConfig = {
  startHour: 9,
  endHour: 24,
  timeSlotMinutes: 10,
  showWeekend: true,
  firstDayOfWeek: 0, // 월요일 시작 (0 = 월요일)
};

// Mock data functions removed - use API data instead

// 실제 API 데이터로 밀집도 계산하는 함수
export function calculateDensityFromScheduleData(
  config: ScheduleConfig,
  classSchedules: Array<{
    class?: {
      day_of_week: number;
      start_time: string;
      end_time: string;
    } | null;
  }>,
  personalSchedules: Array<{
    day_of_week: number;
    start_time: string;
    end_time: string;
  }>
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

/**
 * JavaScript Date.getDay() 결과를 월요일 기준(0-6)으로 변환
 * @param jsDay JavaScript Date.getDay() 결과 (0=일요일, 1=월요일, ..., 6=토요일)
 * @returns 월요일 기준 요일 (0=월요일, 1=화요일, ..., 6=일요일)
 */
export function convertJsDayToMondayBased(jsDay: number): number {
  return jsDay === 0 ? 6 : jsDay - 1;
}

/**
 * 월요일 기준 요일(0-6)을 JavaScript Date.getDay() 형식으로 변환
 * @param mondayBasedDay 월요일 기준 요일 (0=월요일, 1=화요일, ..., 6=일요일)
 * @returns JavaScript Date.getDay() 형식 (0=일요일, 1=월요일, ..., 6=토요일)
 */
export function convertMondayBasedToJsDay(mondayBasedDay: number): number {
  return mondayBasedDay === 6 ? 0 : mondayBasedDay + 1;
}
