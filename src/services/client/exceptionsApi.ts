import { Tables } from "@/types/supabase";

// 수업 예외 타입
export type CompositionsException = Tables<"compositions_exceptions">;
export type CompositionStudentsException =
  Tables<"composition_students_exceptions">;

// 수업 예외 생성 요청 타입
export interface CreateCompositionsExceptionRequest {
  composition_id: string;
  date_from: string;
  start_time_from?: string;
  end_time_from?: string;
  date_to: string;
  start_time_to?: string;
  end_time_to?: string;
  room: string;
  reason?: string;
  created_by?: string;
}

// 학생 예외 생성 요청 타입
export interface CreateCompositionStudentsExceptionRequest {
  composition_id_from: string;
  date_from: string;
  composition_id_to: string;
  date_to: string;
  student_id: string;
  reason?: string;
  created_by?: string;
}

// 수업 예외 API
export const compositionsExceptionsApi = {
  // 수업 예외 조회
  async getCompositionsExceptions(params?: {
    startDate?: string;
    endDate?: string;
    compositionId?: string;
  }): Promise<CompositionsException[]> {
    const searchParams = new URLSearchParams();
    if (params?.startDate) searchParams.append("startDate", params.startDate);
    if (params?.endDate) searchParams.append("endDate", params.endDate);
    if (params?.compositionId)
      searchParams.append("compositionId", params.compositionId);

    const response = await fetch(
      `/api/compositions-exceptions?${searchParams.toString()}`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch compositions exceptions");
    }

    const data = await response.json();
    return data.exceptions;
  },

  // 수업 예외 생성
  async createCompositionsException(
    exception: CreateCompositionsExceptionRequest
  ): Promise<CompositionsException> {
    const response = await fetch("/api/compositions-exceptions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(exception),
    });

    if (!response.ok) {
      throw new Error("Failed to create compositions exception");
    }

    const data = await response.json();
    return data.exception;
  },

  // 수업 예외 수정
  async updateCompositionsException(
    id: string,
    updates: Partial<CreateCompositionsExceptionRequest>
  ): Promise<CompositionsException> {
    const response = await fetch("/api/compositions-exceptions", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id, ...updates }),
    });

    if (!response.ok) {
      throw new Error("Failed to update compositions exception");
    }

    const data = await response.json();
    return data.exception;
  },

  // 수업 예외 삭제
  async deleteCompositionsException(id: string): Promise<void> {
    const response = await fetch(`/api/compositions-exceptions?id=${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Failed to delete compositions exception");
    }
  },
};

// 학생 예외 API
export const compositionStudentsExceptionsApi = {
  // 학생 예외 조회
  async getCompositionStudentsExceptions(params?: {
    startDate?: string;
    endDate?: string;
    studentId?: string;
    compositionIdFrom?: string;
  }): Promise<CompositionStudentsException[]> {
    const searchParams = new URLSearchParams();
    if (params?.startDate) searchParams.append("startDate", params.startDate);
    if (params?.endDate) searchParams.append("endDate", params.endDate);
    if (params?.studentId) searchParams.append("studentId", params.studentId);
    if (params?.compositionIdFrom)
      searchParams.append("compositionIdFrom", params.compositionIdFrom);

    const response = await fetch(
      `/api/composition-students-exceptions?${searchParams.toString()}`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch composition students exceptions");
    }

    const data = await response.json();
    return data.exceptions;
  },

  // 학생 예외 생성
  async createCompositionStudentsException(
    exception: CreateCompositionStudentsExceptionRequest
  ): Promise<CompositionStudentsException> {
    const response = await fetch("/api/composition-students-exceptions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(exception),
    });

    if (!response.ok) {
      throw new Error("Failed to create composition students exception");
    }

    const data = await response.json();
    return data.exception;
  },

  // 학생 예외 수정
  async updateCompositionStudentsException(
    id: string,
    updates: Partial<CreateCompositionStudentsExceptionRequest>
  ): Promise<CompositionStudentsException> {
    const response = await fetch("/api/composition-students-exceptions", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id, ...updates }),
    });

    if (!response.ok) {
      throw new Error("Failed to update composition students exception");
    }

    const data = await response.json();
    return data.exception;
  },

  // 학생 예외 삭제
  async deleteCompositionStudentsException(id: string): Promise<void> {
    const response = await fetch(
      `/api/composition-students-exceptions?id=${id}`,
      {
        method: "DELETE",
      }
    );

    if (!response.ok) {
      throw new Error("Failed to delete composition students exception");
    }
  },
};
