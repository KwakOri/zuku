import { createAdminSupabaseClient } from "@/lib/supabase-server";
import { NextRequest, NextResponse } from "next/server";

// GET: 특정 기간의 학생 예외 조회
export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminSupabaseClient();
    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const studentId = searchParams.get("studentId");
    const compositionIdFrom = searchParams.get("compositionIdFrom");

    let query = supabase
      .from("composition_students_exceptions")
      .select(
        `
        *,
        student:students(id, name, grade),
        composition_from:composition_id_from(
          id,
          class_id,
          day_of_week,
          start_time,
          end_time,
          type
        ),
        composition_to:composition_id_to(
          id,
          class_id,
          day_of_week,
          start_time,
          end_time,
          type
        )
      `
      )
      .order("date_from", { ascending: true });

    // 날짜 범위 필터링
    if (startDate && endDate) {
      query = query.gte("date_from", startDate).lte("date_to", endDate);
    }

    // 특정 학생 필터링
    if (studentId) {
      query = query.eq("student_id", studentId);
    }

    // 특정 원본 수업 필터링
    if (compositionIdFrom) {
      query = query.eq("composition_id_from", compositionIdFrom);
    }

    const { data: exceptions, error } = await query;

    if (error) {
      console.error("Error fetching student exceptions:", error);
      return NextResponse.json(
        { error: "Failed to fetch student exceptions" },
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

// POST: 새로운 학생 예외 생성
export async function POST(request: NextRequest) {
  try {
    const supabase = createAdminSupabaseClient();
    const body = await request.json();

    const {
      composition_id_from,
      date_from,
      composition_id_to,
      date_to,
      student_id,
      reason,
      created_by,
    } = body;

    // 필수 필드 검증
    if (
      !composition_id_from ||
      !date_from ||
      !composition_id_to ||
      !date_to ||
      !student_id
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const { data: exception, error } = await supabase
      .from("composition_students_exceptions")
      .insert({
        composition_id_from,
        date_from,
        composition_id_to,
        date_to,
        student_id,
        reason,
        created_by,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating student exception:", error);
      return NextResponse.json(
        { error: "Failed to create student exception" },
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

// PATCH: 학생 예외 수정
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
      .from("composition_students_exceptions")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating student exception:", error);
      return NextResponse.json(
        { error: "Failed to update student exception" },
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

// DELETE: 학생 예외 삭제
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
      .from("composition_students_exceptions")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting student exception:", error);
      return NextResponse.json(
        { error: "Failed to delete student exception" },
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
