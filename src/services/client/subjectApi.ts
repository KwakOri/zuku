import { Tables } from "@/types/supabase";

export interface ApiResponse<T> {
  data: T;
  error?: string;
}

export interface ApiError {
  error: string;
}

export type Subject = Tables<"subjects">;

export class SubjectApi {
  private baseUrl = "/api/subjects";

  async getSubjects(): Promise<Subject[]> {
    const response = await fetch(this.baseUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(error.error || "Failed to fetch subjects");
    }

    const result: ApiResponse<Subject[]> = await response.json();
    return result.data;
  }
}

// 싱글톤 인스턴스
export const subjectApi = new SubjectApi();