import { ParsedClassInfo, ParsedSchedule } from '@/types/student-renewal';

/**
 * 요일 문자를 숫자로 변환
 * 0(월) ~ 6(일)
 */
function parseDayOfWeek(dayStr: string): number {
  const dayMap: Record<string, number> = {
    '월': 0,
    '화': 1,
    '수': 2,
    '목': 3,
    '금': 4,
    '토': 5,
    '일': 6,
  };
  return dayMap[dayStr] ?? -1;
}

/**
 * 시간 숫자를 HH:MM 형식으로 변환
 * @param timeNum 시간 (예: 6, 9, 12)
 * @param isWeekend 주말 여부
 * @returns HH:MM 형식 시간
 */
function convertTimeToHHMM(timeNum: number, isWeekend: boolean): string {
  let hour = timeNum;

  if (isWeekend) {
    // 주말: 9-12는 오전, 1-8은 오후
    if (timeNum >= 9 && timeNum <= 12) {
      hour = timeNum; // 오전 그대로
    } else if (timeNum >= 1 && timeNum <= 8) {
      hour = timeNum + 12; // 오후
    }
  } else {
    // 주중: 모두 오후
    if (timeNum < 12) {
      hour = timeNum + 12;
    }
  }

  return `${String(hour).padStart(2, '0')}:00`;
}

/**
 * 수업 종료 시간 계산
 * @param startTime 시작 시간 (HH:MM)
 * @param grade 학년 (1-12)
 * @returns 종료 시간 (HH:MM)
 */
function calculateEndTime(startTime: string, grade: number): string {
  const [hour, minute] = startTime.split(':').map(Number);
  let duration: number;

  // 고등(10-12학년): 2시간, 중등(7-9학년): 1.5시간
  if (grade >= 10) {
    duration = 2;
  } else {
    duration = 1.5;
  }

  const endHour = Math.floor(hour + duration);
  const endMinute = minute + ((duration % 1) * 60);

  return `${String(endHour).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}`;
}

/**
 * 수업 시간 문자열 파싱
 * 예: "(금6-9)" -> 금요일 18:00-21:00 (단일 수업)
 * 예: "(월6/목6)" -> 월요일 18:00 (수업) + 목요일 18:00 (클리닉)
 */
export function parseScheduleTime(scheduleStr: string, grade: number): ParsedSchedule[] {
  const schedules: ParsedSchedule[] = [];

  // 괄호 제거
  const cleaned = scheduleStr.replace(/[()]/g, '').trim();

  // "/" 로 구분된 경우: 두 요일 (수업 + 클리닉)
  if (cleaned.includes('/')) {
    const parts = cleaned.split('/');

    parts.forEach((part, index) => {
      const match = part.match(/^([월화수목금토일])(\d+)$/);
      if (match) {
        const [, dayStr, timeStr] = match;
        const dayOfWeek = parseDayOfWeek(dayStr);
        const timeNum = parseInt(timeStr);
        const isWeekend = dayOfWeek >= 5; // 토(5), 일(6)

        const startTime = convertTimeToHHMM(timeNum, isWeekend);
        const endTime = calculateEndTime(startTime, grade);

        schedules.push({
          dayOfWeek,
          startTime,
          endTime,
          type: index === 0 ? 'class' : 'clinic', // 첫 번째는 수업, 두 번째는 클리닉
        });
      }
    });
  } else {
    // "-" 로 구분된 경우: 단일 요일 (시작-종료)
    const match = cleaned.match(/^([월화수목금토일])(\d+)-(\d+)$/);
    if (match) {
      const [, dayStr, startTimeStr, endTimeStr] = match;
      const dayOfWeek = parseDayOfWeek(dayStr);
      const startTimeNum = parseInt(startTimeStr);
      const endTimeNum = parseInt(endTimeStr);
      const isWeekend = dayOfWeek >= 5; // 토(5), 일(6)

      const startTime = convertTimeToHHMM(startTimeNum, isWeekend);
      const endTime = convertTimeToHHMM(endTimeNum, isWeekend);

      schedules.push({
        dayOfWeek,
        startTime,
        endTime,
        type: 'class',
      });
    }
  }

  return schedules;
}

/**
 * 반명 전체 파싱
 * 예: "국어-고3반 (금6-9) 25"
 * 예: "국어-고1반 (월6/목6) 2025"
 */
export function parseClassName(fullClassNameWithSchedule: string, grade: number): ParsedClassInfo | null {
  // 패턴: "과목-반명 (스케줄) 년도"
  // 예: 국어-고3반 (금6-9) 25
  const pattern = /^(.+?)-(.+?)\s*\(([^)]+)\)\s*(\d+)?$/;
  const match = fullClassNameWithSchedule.trim().match(pattern);

  if (!match) {
    console.error('Failed to parse class name:', fullClassNameWithSchedule);
    return null;
  }

  const [, subjectName, className, scheduleStr, year] = match;
  const fullClassName = `${subjectName.trim()}-${className.trim()}`;
  const schedules = parseScheduleTime(`(${scheduleStr})`, grade);

  // schedules가 2개면 split (앞/뒤 수업), 1개면 single (단일 수업)
  const splitType: 'single' | 'split' = schedules.length === 2 ? 'split' : 'single';

  return {
    subjectName: subjectName.trim(),
    className: className.trim(),
    fullClassName,
    schedules,
    splitType,
    year: year?.trim(),
  };
}
