import { ClassBlock } from "@/types/schedule";
import { Tables } from "@/types/supabase";

type StudentScheduleRow = Tables<"student_schedules">;

// 학생 개인 일정을 ClassBlock 형태로 변환
export function convertStudentSchedulesToBlocks(
  schedules: StudentScheduleRow[]
): ClassBlock[] {
  return schedules.map((schedule) => ({
    id: schedule.id,
    classId: schedule.id,
    title: schedule.title,
    subject: schedule.type,
    teacherName: "개인 일정",
    startTime: schedule.start_time,
    endTime: schedule.end_time,
    dayOfWeek: schedule.day_of_week,
    color: schedule.color,
    room: schedule.location || undefined,
    studentCount: 1,
    maxStudents: 1,
    isException: false,
  }));
}

// ClassBlock을 학생 개인 일정 형태로 변환 (생성용)
export function convertBlockToStudentSchedule(
  block: ClassBlock,
  studentId: string
): {
  title: string;
  description?: string | null;
  start_time: string;
  end_time: string;
  day_of_week: number;
  type: string;
  color: string;
  location?: string | null;
  recurring?: boolean;
} {
  return {
    title: block.title,
    description: null,
    start_time: block.startTime,
    end_time: block.endTime,
    day_of_week: block.dayOfWeek,
    type: block.subject || "personal",
    color: block.color,
    location: block.room || null,
    recurring: false,
  };
}

// 기본 색상 팔레트
export const defaultColors = [
  "#3b82f6", // blue
  "#ef4444", // red
  "#10b981", // emerald
  "#f59e0b", // amber
  "#8b5cf6", // violet
  "#ec4899", // pink
  "#06b6d4", // cyan
  "#84cc16", // lime
];

// 랜덤 색상 선택
export function getRandomColor(): string {
  return defaultColors[Math.floor(Math.random() * defaultColors.length)];
}

// 과목별 색상 테마 정의 (모두 탁한 색상으로 통일)
export const subjectColorThemes = {
  국어: {
    front: "#c87171",  // 탁한 빨강
    back: "#b06565",   // 더 탁한 빨강
  },
  수학: {
    front: "#7191b0",  // 탁한 파랑
    back: "#6080a0",   // 더 탁한 파랑
  },
  영어: {
    front: "#d4b76f",  // 탁한 노랑
    back: "#c0a660",   // 더 탁한 노랑
  },
  개인: {
    front: "#adb5bd",  // 탁한 회색
    back: "#868e96",   // 더 탁한 회색
  },
};

// 과목명에 따라 색상 반환 (앞타임/뒷타임 구분)
export function getSubjectColor(
  subjectName: string | undefined,
  isPersonal: boolean,
  isFrontTime: boolean = true,
  compositionType: string = "class"
): string {
  if (isPersonal) {
    return isFrontTime ? subjectColorThemes.개인.front : subjectColorThemes.개인.back;
  }

  // 과목명에 "국어", "수학", "영어"가 포함되어 있는지 확인
  if (subjectName?.includes("국어")) {
    return isFrontTime ? subjectColorThemes.국어.front : subjectColorThemes.국어.back;
  }
  if (subjectName?.includes("수학")) {
    return isFrontTime ? subjectColorThemes.수학.front : subjectColorThemes.수학.back;
  }
  if (subjectName?.includes("영어")) {
    return isFrontTime ? subjectColorThemes.영어.front : subjectColorThemes.영어.back;
  }

  // 기본 색상 (회색)
  return isFrontTime ? subjectColorThemes.개인.front : subjectColorThemes.개인.back;
}

// 두 블록 배열의 차이점을 찾는 함수
export function findBlockChanges(
  originalBlocks: ClassBlock[],
  updatedBlocks: ClassBlock[]
) {
  const added: ClassBlock[] = [];
  const updated: ClassBlock[] = [];
  const deleted: ClassBlock[] = [];

  // 원본에서 업데이트된 배열에 없는 것들은 삭제된 것
  originalBlocks.forEach(originalBlock => {
    const foundInUpdated = updatedBlocks.find(block => block.id === originalBlock.id);
    if (!foundInUpdated) {
      deleted.push(originalBlock);
    }
  });

  // 업데이트된 배열의 각 블록을 확인
  updatedBlocks.forEach(updatedBlock => {
    const originalBlock = originalBlocks.find(block => block.id === updatedBlock.id);
    
    if (!originalBlock) {
      // 원본에 없으면 새로 추가된 것
      added.push(updatedBlock);
    } else {
      // 원본과 비교해서 변경된 것이 있으면 수정된 것
      if (hasBlockChanged(originalBlock, updatedBlock)) {
        updated.push(updatedBlock);
      }
    }
  });

  return { added, updated, deleted };
}

// 두 블록이 다른지 확인하는 함수
function hasBlockChanged(original: ClassBlock, updated: ClassBlock): boolean {
  return (
    original.title !== updated.title ||
    original.startTime !== updated.startTime ||
    original.endTime !== updated.endTime ||
    original.dayOfWeek !== updated.dayOfWeek ||
    original.color !== updated.color ||
    original.subject !== updated.subject ||
    original.room !== updated.room
  );
}

// 새 블록인지 확인하는 함수 (임시 ID 패턴으로 판단)
export function isNewBlock(block: ClassBlock): boolean {
  return block.id.startsWith('temp-') || block.id.startsWith('new-');
}

// Combined Schedule용 이벤트 색상 반환 (과목명 기반)
export function getEventColor(
  subjectName: string | null | undefined,
  isPersonal: boolean
): string {
  // 개인 일정은 회색
  if (isPersonal) {
    return subjectColorThemes.개인.front;
  }

  // 과목명에 "국어", "수학", "영어"가 포함되어 있는지 확인
  if (subjectName?.includes("국어")) {
    return subjectColorThemes.국어.front;
  }
  if (subjectName?.includes("수학")) {
    return subjectColorThemes.수학.front;
  }
  if (subjectName?.includes("영어")) {
    return subjectColorThemes.영어.front;
  }

  // 기본 색상 (회색)
  return subjectColorThemes.개인.front;
}