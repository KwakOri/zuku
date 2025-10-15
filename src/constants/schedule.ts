/**
 * 요일 관련 상수
 * 0 = 월요일, 1 = 화요일, ..., 6 = 일요일
 */

export const DAYS_OF_WEEK = ["월", "화", "수", "목", "금", "토", "일"] as const;

export const DAYS_OF_WEEK_FULL = [
  "월요일",
  "화요일",
  "수요일",
  "목요일",
  "금요일",
  "토요일",
  "일요일",
] as const;

export const DAYS_OF_WEEK_SHORT = ["월", "화", "수", "목", "금", "토", "일"] as const;

/**
 * 요일 인덱스를 문자열로 변환
 * @param dayIndex 0-6 (0=월요일, 6=일요일)
 * @param format 'short' | 'full'
 * @returns 요일 문자열
 */
export function getDayOfWeekLabel(dayIndex: number, format: "short" | "full" = "short"): string {
  const days = format === "full" ? DAYS_OF_WEEK_FULL : DAYS_OF_WEEK_SHORT;
  return days[dayIndex] || "";
}
