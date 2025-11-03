import { NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase-server";

export async function GET() {
  try {
    const supabase = createAdminSupabaseClient();

    // 선생님 데이터와 담당 수업 정보를 가져오기
    const { data: teachers, error: teachersError } = await supabase
      .from("teachers")
      .select(`
        *
      `)
      .eq("is_active", true)
      .order("name", { ascending: true });

    if (teachersError) {
      console.error("Teachers fetch error:", teachersError);
      return NextResponse.json(
        { error: "Failed to fetch teachers data" },
        { status: 500 }
      );
    }

    // 각 선생님의 담당 수업 조회
    const enrichedTeachers = await Promise.all(
      teachers.map(async (teacher) => {
        const { data: classes, error: classesError } = await supabase
          .from("classes")
          .select(`
            id,
            title,
            color,
            subject:subjects(
              id,
              subject_name
            ),
            class_composition(
              id,
              class_id,
              day_of_week,
              start_time,
              end_time,
              type
            )
          `)
          .eq("teacher_id", teacher.id);

        if (classesError) {
          console.error(`Classes fetch error for teacher ${teacher.id}:`, classesError);
          return {
            ...teacher,
            classes: [],
          };
        }

        return {
          ...teacher,
          classes: classes || [],
        };
      })
    );

    return NextResponse.json({ data: enrichedTeachers });
  } catch (error) {
    console.error("Combined teacher schedule API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
