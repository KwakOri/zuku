import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase-server";
import { ClassComposition } from "@/types/schedule";

// GET: 특정 수업의 모든 시간 구성 조회 또는 전체 조회
export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminSupabaseClient();
    const searchParams = request.nextUrl.searchParams;
    const classId = searchParams.get("classId");

    let query = supabase
      .from("class_composition")
      .select("*")
      .order("day_of_week", { ascending: true })
      .order("start_time", { ascending: true });

    if (classId) {
      query = query.eq("class_id", classId);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // DB 형식을 TypeScript 형식으로 변환
    const compositions: ClassComposition[] = (data || []).map((item) => ({
      id: item.id,
      classId: item.class_id,
      type: item.type as "class" | "clinic",
      dayOfWeek: item.day_of_week,
      startTime: item.start_time,
      endTime: item.end_time,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
    }));

    return NextResponse.json(compositions);
  } catch (error) {
    console.error("Error fetching class compositions:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST: 새로운 시간 구성 생성
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { class_id, day_of_week, start_time, end_time, type } = body;

    // Validation
    if (!class_id || day_of_week === undefined || !start_time || !end_time) {
      return NextResponse.json(
        { error: "필수 필드가 누락되었습니다 (수업 ID, 요일, 시작 시간, 종료 시간)" },
        { status: 400 }
      );
    }

    // Validate day_of_week range
    if (day_of_week < 0 || day_of_week > 6) {
      return NextResponse.json(
        { error: "요일은 0(일요일)부터 6(토요일) 사이여야 합니다" },
        { status: 400 }
      );
    }

    // Validate time format (HH:MM or HH:MM:SS)
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/;
    if (!timeRegex.test(start_time) || !timeRegex.test(end_time)) {
      return NextResponse.json(
        { error: "시간 형식이 올바르지 않습니다 (HH:MM)" },
        { status: 400 }
      );
    }

    // Validate end_time > start_time
    if (start_time >= end_time) {
      return NextResponse.json(
        { error: "종료 시간은 시작 시간보다 늦어야 합니다" },
        { status: 400 }
      );
    }

    const supabase = createAdminSupabaseClient();

    // Check if class exists and get split_type
    const { data: classData, error: classError } = await supabase
      .from("classes")
      .select("id, split_type")
      .eq("id", class_id)
      .single();

    if (classError || !classData) {
      return NextResponse.json(
        { error: "수업을 찾을 수 없습니다" },
        { status: 404 }
      );
    }

    // Validate type field for split classes
    if (classData.split_type === "split" && !type) {
      return NextResponse.json(
        { error: "앞/뒤타임 구분이 필요합니다" },
        { status: 400 }
      );
    }

    if (classData.split_type === "split" && type !== "class" && type !== "clinic") {
      return NextResponse.json(
        { error: "타임 구분은 'class' 또는 'clinic'이어야 합니다" },
        { status: 400 }
      );
    }

    // Format times to HH:MM:SS
    const formatTime = (time: string) => {
      if (time.length === 5) {
        return `${time}:00`;
      }
      return time;
    };

    const formattedStartTime = formatTime(start_time);
    const formattedEndTime = formatTime(end_time);

    // Check for time conflicts
    const { data: existingCompositions, error: checkError } = await supabase
      .from("class_composition")
      .select("*")
      .eq("class_id", class_id)
      .eq("day_of_week", day_of_week);

    if (checkError) {
      console.error("Time conflict check error:", checkError);
      return NextResponse.json(
        { error: "시간 중복 확인 중 오류가 발생했습니다" },
        { status: 500 }
      );
    }

    // Check for overlapping times
    const hasConflict = existingCompositions?.some((comp) => {
      const existingStart = comp.start_time;
      const existingEnd = comp.end_time;

      // Check if new time overlaps with existing time
      return (
        (formattedStartTime >= existingStart && formattedStartTime < existingEnd) ||
        (formattedEndTime > existingStart && formattedEndTime <= existingEnd) ||
        (formattedStartTime <= existingStart && formattedEndTime >= existingEnd)
      );
    });

    if (hasConflict) {
      return NextResponse.json(
        { error: "해당 요일의 시간대가 이미 등록되어 있습니다" },
        { status: 409 }
      );
    }

    // Create class composition
    const { data: newComposition, error: createError } = await supabase
      .from("class_composition")
      .insert([{
        class_id,
        day_of_week,
        start_time: formattedStartTime,
        end_time: formattedEndTime,
        type: classData.split_type === "split" ? type : null,
      }])
      .select()
      .single();

    if (createError) {
      console.error("Class composition creation error:", createError);
      return NextResponse.json(
        { error: "시간표 생성에 실패했습니다" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        data: newComposition,
        message: "시간표가 성공적으로 추가되었습니다",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Class composition API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH: 시간 구성 수정
export async function PATCH(request: NextRequest) {
  try {
    const supabase = createAdminSupabaseClient();
    const body = await request.json();

    const { id, dayOfWeek, startTime, endTime } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Composition ID is required" },
        { status: 400 }
      );
    }

    const updateData: {
      updated_at: string;
      day_of_week?: number;
      start_time?: string;
      end_time?: string;
    } = {
      updated_at: new Date().toISOString(),
    };

    if (dayOfWeek !== undefined) updateData.day_of_week = dayOfWeek;
    if (startTime) updateData.start_time = startTime;
    if (endTime) updateData.end_time = endTime;

    const { data, error } = await supabase
      .from("class_composition")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const composition: ClassComposition = {
      id: data.id,
      classId: data.class_id,
      type: data.type as "class" | "clinic",
      dayOfWeek: data.day_of_week,
      startTime: data.start_time,
      endTime: data.end_time,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };

    return NextResponse.json(composition);
  } catch (error) {
    console.error("Error updating class composition:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE: 시간 구성 삭제
export async function DELETE(request: NextRequest) {
  try {
    const supabase = createAdminSupabaseClient();
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Composition ID is required" },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("class_composition")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting class composition:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
