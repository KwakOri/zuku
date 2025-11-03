import { createAdminSupabaseClient } from "@/lib/supabase-server";
import { NextRequest, NextResponse } from "next/server";

// GET: 특정 기간의 수업 예외 조회
export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminSupabaseClient();
    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const compositionId = searchParams.get("compositionId");

    let query = supabase
      .from("compositions_exceptions")
      .select(
        `
        *,
        composition:class_compositions(
          id,
          class_id,
          day_of_week,
          start_time,
          end_time,
          type
        )
      `
      )
      .order("week_start_date", { ascending: true });

    // 날짜 범위 필터링 (week_start_date 기준)
    if (startDate && endDate) {
      query = query
        .gte("week_start_date", startDate)
        .lte("week_start_date", endDate);
    }

    // 특정 composition 필터링
    if (compositionId) {
      query = query.eq("composition_id", compositionId);
    }

    const { data: exceptions, error } = await query;

    if (error) {
      console.error("Error fetching composition exceptions:", error);
      return NextResponse.json(
        { error: "Failed to fetch composition exceptions" },
        { status: 500 }
      );
    }

    return NextResponse.json({ exceptions }, { status: 200 });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST: 새로운 수업 예외 생성
export async function POST(request: NextRequest) {
  try {
    const supabase = createAdminSupabaseClient();
    const body = await request.json();

    const {
      composition_id,
      week_start_date,
      start_time_from,
      end_time_from,
      start_time_to,
      end_time_to,
      room,
      reason,
      created_by,
    } = body;

    // 필수 필드 검증
    if (!composition_id || !week_start_date || !room) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const { data: exception, error } = await supabase
      .from("compositions_exceptions")
      .insert({
        composition_id,
        week_start_date,
        start_time_from,
        end_time_from,
        start_time_to,
        end_time_to,
        room,
        reason,
        created_by,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating composition exception:", error);
      return NextResponse.json(
        { error: "Failed to create composition exception" },
        { status: 500 }
      );
    }

    return NextResponse.json({ exception }, { status: 201 });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH: 수업 예외 수정
export async function PATCH(request: NextRequest) {
  try {
    const supabase = createAdminSupabaseClient();
    const body = await request.json();

    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Exception ID is required" },
        { status: 400 }
      );
    }

    const { data: exception, error } = await supabase
      .from("compositions_exceptions")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating composition exception:", error);
      return NextResponse.json(
        { error: "Failed to update composition exception" },
        { status: 500 }
      );
    }

    return NextResponse.json({ exception }, { status: 200 });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE: 수업 예외 삭제
export async function DELETE(request: NextRequest) {
  try {
    const supabase = createAdminSupabaseClient();
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Exception ID is required" },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("compositions_exceptions")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting composition exception:", error);
      return NextResponse.json(
        { error: "Failed to delete composition exception" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Exception deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
