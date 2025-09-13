import { createAdminSupabaseClient } from "@/lib/supabase-server";
import { NextRequest, NextResponse } from "next/server";

// PUT: 개인 일정 수정
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; scheduleId: string }> }
) {
  try {
    const { id, scheduleId } = await params;
    const body = await request.json();
    const supabase = createAdminSupabaseClient();

    // 수정할 데이터 추출
    const {
      title,
      description,
      start_time,
      end_time,
      day_of_week,
      type,
      color,
      location,
      recurring,
    } = body;

    if (!title || !start_time || !end_time || day_of_week === undefined) {
      return NextResponse.json(
        { error: "필수 필드가 누락되었습니다" },
        { status: 400 }
      );
    }

    const updateData = {
      title,
      description: description || null,
      start_time,
      end_time,
      day_of_week,
      type: type || "personal",
      color: color || "#3b82f6",
      location: location || null,
      recurring: recurring || false,
    };

    const { data: updatedSchedule, error } = await supabase
      .from("student_schedules")
      .update(updateData)
      .eq("id", scheduleId)
      .eq("student_id", parseInt(id))
      .select()
      .single();

    if (error) throw error;

    if (!updatedSchedule) {
      return NextResponse.json(
        { error: "일정을 찾을 수 없습니다" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: updatedSchedule });
  } catch (error: any) {
    console.error("Error updating student schedule:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update student schedule" },
      { status: 500 }
    );
  }
}

// DELETE: 개인 일정 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; scheduleId: string }> }
) {
  try {
    const { id, scheduleId } = await params;
    const supabase = createAdminSupabaseClient();

    const { data: deletedSchedule, error } = await supabase
      .from("student_schedules")
      .delete()
      .eq("id", scheduleId)
      .eq("student_id", parseInt(id))
      .select()
      .single();

    if (error) throw error;

    if (!deletedSchedule) {
      return NextResponse.json(
        { error: "일정을 찾을 수 없습니다" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: deletedSchedule });
  } catch (error: any) {
    console.error("Error deleting student schedule:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete student schedule" },
      { status: 500 }
    );
  }
}