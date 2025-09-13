import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase-server";
import { TablesInsert } from "@/types/supabase";

export async function GET() {
  try {
    const supabase = createAdminSupabaseClient();
    
    const { data: classes, error } = await supabase
      .from("classes")
      .select(`
        *,
        teacher:teachers(id, name)
      `)
      .order("day_of_week")
      .order("start_time");

    if (error) {
      console.error("Classes fetch error:", error);
      return NextResponse.json(
        { error: "Failed to fetch classes" },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: classes });
  } catch (error) {
    console.error("Classes API error:", error);
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
    const classData: TablesInsert<"classes"> = {
      id: body.id,
      title: body.title,
      subject: body.subject,
      teacher_id: body.teacher_id || null,
      teacher_name: body.teacher_name,
      start_time: body.start_time,
      end_time: body.end_time,
      day_of_week: body.day_of_week,
      color: body.color,
      room: body.room || null,
      max_students: body.max_students || null,
      description: body.description || null,
      rrule: body.rrule || null,
    };

    const { data: newClass, error } = await supabase
      .from("classes")
      .insert([classData])
      .select(`
        *,
        teacher:teachers(id, name)
      `)
      .single();

    if (error) {
      console.error("Class creation error:", error);
      return NextResponse.json(
        { error: "Failed to create class" },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: newClass }, { status: 201 });
  } catch (error) {
    console.error("Class creation API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}