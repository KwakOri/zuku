import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase-server";
import { TablesUpdate } from "@/types/supabase";

// GET /api/student-schedules/[id] - 특정 학생 개인 일정 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const supabase = createAdminSupabaseClient();

    const { data, error } = await supabase
      .from("student_schedules")
      .select(`
        *,
        student:students(
          id,
          name,
          grade
        )
      `)
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json(
          { error: "해당 학생 개인 일정을 찾을 수 없습니다." },
          { status: 404 }
        );
      }

      console.error("Error fetching student schedule:", error);
      return NextResponse.json(
        { error: "학생 개인 일정을 불러오는 중 오류가 발생했습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "예상치 못한 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

// PUT /api/student-schedules/[id] - 학생 개인 일정 수정
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body: TablesUpdate<"student_schedules"> = await request.json();

    const supabase = createAdminSupabaseClient();

    const { data, error } = await supabase
      .from("student_schedules")
      .update(body)
      .eq("id", id)
      .select(`
        *,
        student:students(
          id,
          name,
          grade
        )
      `)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json(
          { error: "해당 학생 개인 일정을 찾을 수 없습니다." },
          { status: 404 }
        );
      }

      console.error("Error updating student schedule:", error);
      return NextResponse.json(
        { error: "학생 개인 일정 수정 중 오류가 발생했습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "예상치 못한 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

// DELETE /api/student-schedules/[id] - 학생 개인 일정 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const supabase = createAdminSupabaseClient();

    const { error } = await supabase
      .from("student_schedules")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting student schedule:", error);
      return NextResponse.json(
        { error: "학생 개인 일정 삭제 중 오류가 발생했습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: { success: true } });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "예상치 못한 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}