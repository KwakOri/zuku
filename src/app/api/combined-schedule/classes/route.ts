import { createAdminSupabaseClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = createAdminSupabaseClient();

    // 수업 데이터와 관련 정보를 join해서 가져오기
    const { data: classes, error: classesError } = await supabase
      .from("classes")
      .select(
        `
        *,
        subject:subjects(
          id,
          subject_name
        ),
        teacher:teachers(
          id,
          name
        ),
        class_compositions(
          id,
          class_id,
          day_of_week,
          start_time,
          end_time,
          type
        )
      `
      )
      .order("title", { ascending: true });

    if (classesError) {
      console.error("Combined class schedule fetch error:", classesError);
      return NextResponse.json(
        { error: "Failed to fetch combined class schedule data" },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: classes });
  } catch (error) {
    console.error("Combined class schedule API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
