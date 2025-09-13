import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase-server";
import { TablesInsert } from "@/types/supabase";

export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminSupabaseClient();
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get("student_id");
    
    let query = supabase
      .from("student_schedules")
      .select(`
        *,
        student:students(id, name, grade)
      `)
      .eq("status", "active")
      .order("day_of_week")
      .order("start_time");

    // 특정 학생의 일정만 조회하는 경우
    if (studentId) {
      const parsedStudentId = parseInt(studentId);
      if (isNaN(parsedStudentId)) {
        return NextResponse.json(
          { error: "Invalid student ID" },
          { status: 400 }
        );
      }
      query = query.eq("student_id", parsedStudentId);
    }

    const { data: schedules, error } = await query;

    if (error) {
      console.error("Student schedules fetch error:", error);
      return NextResponse.json(
        { error: "Failed to fetch student schedules" },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: schedules });
  } catch (error) {
    console.error("Student schedules API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const supabase = createAdminSupabaseClient();

    // 입력 데이터 검증
    const scheduleData: TablesInsert<"student_schedules"> = {
      id: body.id,
      student_id: body.student_id,
      title: body.title,
      description: body.description || null,
      start_time: body.start_time,
      end_time: body.end_time,
      day_of_week: body.day_of_week,
      color: body.color,
      type: body.type,
      location: body.location || null,
      recurring: body.recurring || null,
      rrule: body.rrule || null,
      created_date: body.created_date,
      status: body.status || "active",
    };

    const { data: schedule, error } = await supabase
      .from("student_schedules")
      .insert([scheduleData])
      .select(`
        *,
        student:students(id, name, grade)
      `)
      .single();

    if (error) {
      console.error("Student schedule creation error:", error);
      return NextResponse.json(
        { error: "Failed to create student schedule" },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: schedule }, { status: 201 });
  } catch (error) {
    console.error("Student schedule creation API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}