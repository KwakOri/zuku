/**
 * 강의실 시간표 관련 API 클라이언트 함수
 */

interface MoveStudentsParams {
  studentIds: string[];
  sourceCompositionId: string;
  targetCompositionId: string;
  isPermanent: boolean;
  reason?: string;
  weekStartDate?: string; // YYYY-MM-DD (주의 시작 날짜, 월요일)
}

interface ChangeRoomParams {
  compositionId: string;
  newRoom: string;
  isPermanent: boolean;
  reason?: string;
  weekStartDate?: string; // YYYY-MM-DD (주의 시작 날짜, 월요일)
}

interface ChangeTimeParams {
  compositionId: string;
  newStartTime: string; // HH:MM:SS
  newEndTime: string; // HH:MM:SS
  newDayOfWeek?: number; // 0-6
  isPermanent: boolean;
  reason?: string;
  weekStartDate?: string; // YYYY-MM-DD (주의 시작 날짜, 월요일)
}

/**
 * 학생을 다른 composition으로 이동
 */
export async function moveStudents(params: MoveStudentsParams) {
  const response = await fetch("/api/classroom-schedule/move-students", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "학생 이동에 실패했습니다.");
  }

  return response.json();
}

/**
 * 수업의 강의실 변경
 */
export async function changeRoom(params: ChangeRoomParams) {
  const response = await fetch("/api/classroom-schedule/change-room", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "강의실 변경에 실패했습니다.");
  }

  return response.json();
}

/**
 * 수업의 시간대 변경
 */
export async function changeTime(params: ChangeTimeParams) {
  const response = await fetch("/api/classroom-schedule/change-time", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "시간대 변경에 실패했습니다.");
  }

  return response.json();
}
