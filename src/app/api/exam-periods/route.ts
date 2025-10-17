import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase-server";

// GET /api/exam-periods
// Query params: school_id (optional) - filter by school
export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminSupabaseClient();
    const searchParams = request.nextUrl.searchParams;
    const schoolId = searchParams.get("school_id");

    let query = supabase
      .from("exam_periods")
      .select("*, schools(id, name)")
      .order("start_date", { ascending: false });

    if (schoolId) {
      query = query.eq("school_id", schoolId);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching exam periods:", error);
      return NextResponse.json(
        { error: "Failed to fetch exam periods" },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/exam-periods
// Body: { school_id: string, start_date: string, end_date?: string, year: number, semester: number, exam_round: number }
export async function POST(request: NextRequest) {
  try {
    const supabase = createAdminSupabaseClient();
    const body = await request.json();
    const { school_id, start_date, end_date, year, semester, exam_round } = body;

    // Validation
    if (!school_id || !start_date || !year || !semester || !exam_round) {
      return NextResponse.json(
        { error: "school_id, start_date, year, semester, and exam_round are required" },
        { status: 400 }
      );
    }

    // Validate date format and logic
    const startDateObj = new Date(start_date);
    if (isNaN(startDateObj.getTime())) {
      return NextResponse.json(
        { error: "Invalid start_date format" },
        { status: 400 }
      );
    }

    if (end_date) {
      const endDateObj = new Date(end_date);
      if (isNaN(endDateObj.getTime())) {
        return NextResponse.json(
          { error: "Invalid end_date format" },
          { status: 400 }
        );
      }
      if (endDateObj < startDateObj) {
        return NextResponse.json(
          { error: "end_date must be after or equal to start_date" },
          { status: 400 }
        );
      }
    }

    const { data, error } = await supabase
      .from("exam_periods")
      .insert({
        school_id,
        start_date,
        end_date: end_date || null,
        year,
        semester,
        exam_round,
      })
      .select("*, schools(id, name)")
      .single();

    if (error) {
      console.error("Error creating exam period:", error);
      return NextResponse.json(
        { error: "Failed to create exam period" },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
