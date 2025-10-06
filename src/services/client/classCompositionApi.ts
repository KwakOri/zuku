import { ClassComposition } from "@/types/schedule";

// 특정 수업의 모든 시간 구성 조회
export async function getClassCompositions(
  classId?: string
): Promise<ClassComposition[]> {
  const url = classId
    ? `/api/class-composition?classId=${classId}`
    : "/api/class-composition";

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Failed to fetch class compositions");
  }

  return response.json();
}

// 새로운 시간 구성 생성
export async function createClassComposition(data: {
  class_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  type?: "class" | "clinic" | null;
}): Promise<Record<string, unknown>> {
  const response = await fetch("/api/class-composition", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to create class composition");
  }

  return response.json();
}

// 시간 구성 수정
export async function updateClassComposition(data: {
  id: string;
  dayOfWeek?: number;
  startTime?: string;
  endTime?: string;
}): Promise<ClassComposition> {
  const response = await fetch("/api/class-composition", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Failed to update class composition");
  }

  return response.json();
}

// 시간 구성 삭제
export async function deleteClassComposition(id: string): Promise<void> {
  const response = await fetch(`/api/class-composition?id=${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to delete class composition");
  }
}
