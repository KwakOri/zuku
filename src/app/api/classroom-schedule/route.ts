import { NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase-server";

export async function GET() {
  try {
    const supabase = createAdminSupabaseClient();

    // 수업 데이터와 관련 정보를 join해서 가져오기
    const { data: classes, error: classesError } = await supabase
      .from("classes")
      .select(`
        *,
        subject:subjects(
          id,
          subject_name
        ),
        teacher:teachers(
          id,
          name
        ),
        class_composition(
          id,
          class_id,
          day_of_week,
          start_time,
          end_time,
          type
        ),
        class_students(
          id,
          student:students(
            id,
            name,
            grade
          )
        )
      `)
      .order("title", { ascending: true });

    if (classesError) {
      console.error("Classroom schedule fetch error:", classesError);
      return NextResponse.json(
        { error: "Failed to fetch classroom schedule data" },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: classes });
  } catch (error) {
    console.error("Classroom schedule API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
