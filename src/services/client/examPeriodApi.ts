import { ExamPeriod } from "@/types/schedule";

export interface ExamPeriodWithSchool extends ExamPeriod {
  schools: {
    id: string;
    name: string;
  } | null;
}

export interface CreateExamPeriodParams {
  school_id: string;
  start_date: string; // YYYY-MM-DD format
  end_date?: string | null; // YYYY-MM-DD format
}

export interface UpdateExamPeriodParams {
  start_date?: string; // YYYY-MM-DD format
  end_date?: string | null; // YYYY-MM-DD format
}

/**
 * Fetch all exam periods or filter by school
 * @param schoolId - Optional school ID to filter results
 */
export async function getExamPeriods(
  schoolId?: string
): Promise<ExamPeriodWithSchool[]> {
  try {
    const url = new URL("/api/exam-periods", window.location.origin);
    if (schoolId) {
      url.searchParams.set("school_id", schoolId);
    }

    const response = await fetch(url.toString());

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to fetch exam periods");
    }

    return await response.json();
  } catch (error) {
    console.error("Error in getExamPeriods:", error);
    throw error;
  }
}

/**
 * Create a new exam period
 */
export async function createExamPeriod(
  params: CreateExamPeriodParams
): Promise<ExamPeriodWithSchool> {
  try {
    const response = await fetch("/api/exam-periods", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to create exam period");
    }

    return await response.json();
  } catch (error) {
    console.error("Error in createExamPeriod:", error);
    throw error;
  }
}

/**
 * Update an existing exam period
 */
export async function updateExamPeriod(
  id: string,
  params: UpdateExamPeriodParams
): Promise<ExamPeriodWithSchool> {
  try {
    const response = await fetch(`/api/exam-periods/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to update exam period");
    }

    return await response.json();
  } catch (error) {
    console.error("Error in updateExamPeriod:", error);
    throw error;
  }
}

/**
 * Delete an exam period
 */
export async function deleteExamPeriod(id: string): Promise<void> {
  try {
    const response = await fetch(`/api/exam-periods/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to delete exam period");
    }
  } catch (error) {
    console.error("Error in deleteExamPeriod:", error);
    throw error;
  }
}
