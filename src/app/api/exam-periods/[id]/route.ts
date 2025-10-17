import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase-server";

// PUT /api/exam-periods/[id]
// Body: { start_date?: string, end_date?: string }
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createAdminSupabaseClient();
    const body = await request.json();
    const { start_date, end_date } = body;
    const { id } = await params;

    // At least one field must be provided
    if (!start_date && end_date === undefined) {
      return NextResponse.json(
        { error: "At least one field (start_date or end_date) must be provided" },
        { status: 400 }
      );
    }

    // Build update object
    const updateData: {
      start_date?: string;
      end_date?: string | null;
      updated_at?: string;
    } = {};

    if (start_date) {
      const startDateObj = new Date(start_date);
      if (isNaN(startDateObj.getTime())) {
        return NextResponse.json(
          { error: "Invalid start_date format" },
          { status: 400 }
        );
      }
      updateData.start_date = start_date;
    }

    if (end_date !== undefined) {
      if (end_date === null) {
        updateData.end_date = null;
      } else {
        const endDateObj = new Date(end_date);
        if (isNaN(endDateObj.getTime())) {
          return NextResponse.json(
            { error: "Invalid end_date format" },
            { status: 400 }
          );
        }
        updateData.end_date = end_date;
      }
    }

    // Validate date logic if both dates are being set
    if (updateData.start_date && updateData.end_date) {
      const startDateObj = new Date(updateData.start_date);
      const endDateObj = new Date(updateData.end_date);
      if (endDateObj < startDateObj) {
        return NextResponse.json(
          { error: "end_date must be after or equal to start_date" },
          { status: 400 }
        );
      }
    }

    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from("exam_periods")
      .update(updateData)
      .eq("id", id)
      .select("*, schools(id, name)")
      .single();

    if (error) {
      console.error("Error updating exam period:", error);
      return NextResponse.json(
        { error: "Failed to update exam period" },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: "Exam period not found" },
        { status: 404 }
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

// DELETE /api/exam-periods/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createAdminSupabaseClient();
    const { id } = await params;

    const { error } = await supabase
      .from("exam_periods")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting exam period:", error);
      return NextResponse.json(
        { error: "Failed to delete exam period" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
