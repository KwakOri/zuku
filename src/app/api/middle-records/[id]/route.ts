import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase-server";
import { TablesUpdate } from "@/types/supabase";

// GET /api/middle-records/[id] - 특정 중등 기록 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const supabase = createAdminSupabaseClient();

    const { data, error } = await supabase
      .from("homework_records_middle")
      .select(`
        *,
        student:students(
          id,
          name,
          grade,
          phone,
          parent_phone,
          email
        ),
        class:classes(
          id,
          title,
          subject:subjects(id, subject_name)
        )
      `)
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json(
          { error: "해당 중등 기록을 찾을 수 없습니다." },
          { status: 404 }
        );
      }

      console.error("Error fetching middle school record:", error);
      return NextResponse.json(
        { error: "중등 기록을 불러오는 중 오류가 발생했습니다." },
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

// PUT /api/middle-records/[id] - 중등 기록 수정
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body: TablesUpdate<"homework_records_middle"> = await request.json();

    const supabase = createAdminSupabaseClient();

    // last_modified 자동 업데이트
    const updatedData = {
      ...body,
      last_modified: new Date().toISOString().split("T")[0],
    };

    const { data, error } = await supabase
      .from("homework_records_middle")
      .update(updatedData)
      .eq("id", id)
      .select(`
        *,
        student:students(
          id,
          name,
          grade,
          phone,
          parent_phone,
          email
        ),
        class:classes(
          id,
          title,
          subject:subjects(id, subject_name)
        )
      `)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json(
          { error: "해당 중등 기록을 찾을 수 없습니다." },
          { status: 404 }
        );
      }

      console.error("Error updating middle school record:", error);
      return NextResponse.json(
        { error: "중등 기록 수정 중 오류가 발생했습니다." },
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

// DELETE /api/middle-records/[id] - 중등 기록 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const supabase = createAdminSupabaseClient();

    const { error } = await supabase
      .from("homework_records_middle")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting middle school record:", error);
      return NextResponse.json(
        { error: "중등 기록 삭제 중 오류가 발생했습니다." },
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