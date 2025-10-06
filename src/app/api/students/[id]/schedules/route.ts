import { createAdminSupabaseClient } from "@/lib/supabase-server";
import { NextRequest, NextResponse } from "next/server";

// GET: 특정 학생의 개인 일정 목록 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log("API called for student:", id);
    
    const supabase = createAdminSupabaseClient();

    const { data: schedules, error } = await supabase
      .from("student_schedules")
      .select("*")
      .eq("student_id", id)
      .eq("status", "active")
      .order("day_of_week", { ascending: true })
      .order("start_time", { ascending: true });

    if (error) throw error;

    return NextResponse.json({ data: schedules || [] });
  } catch (error) {
    console.error("Error fetching student schedules:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to fetch student schedules";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

// POST: 새로운 개인 일정 추가
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const supabase = createAdminSupabaseClient();

    // 새 일정 데이터 검증
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

    const scheduleData = {
      id: crypto.randomUUID(),
      student_id: id,
      title,
      description: description || null,
      start_time,
      end_time,
      day_of_week,
      type: type || "personal",
      color: color || "#3b82f6",
      location: location || null,
      recurring: recurring || false,
      status: "active",
      created_date: new Date().toISOString().split("T")[0],
    };

    const { data: newSchedule, error } = await supabase
      .from("student_schedules")
      .insert(scheduleData)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ data: newSchedule }, { status: 201 });
  } catch (error) {
    console.error("Error creating student schedule:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to create student schedule";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}