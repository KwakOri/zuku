import { createAdminSupabaseClient } from "@/lib/supabase-server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminSupabaseClient();

    // 쿼리 파라미터에서 week_start_date 가져오기
    const searchParams = request.nextUrl.searchParams;
    const weekStartDate = searchParams.get("week_start_date");

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
          type,
          relations_compositions_students(
            id,
            composition_id,
            student_id,
            enrolled_date,
            status,
            student:students(
              id,
              name,
              grade,
              school:schools(
                id,
                name,
                level
              )
            )
          )
        )
      `
      )
      .order("title", { ascending: true });

    if (classesError) {
      console.error("Classroom schedule fetch error:", classesError);
      return NextResponse.json(
        { error: "Failed to fetch classroom schedule data" },
        { status: 500 }
      );
    }

    // 예외 데이터 가져오기 (week_start_date로 필터링)
    let compositionsExceptionsQuery = supabase
      .from("compositions_exceptions")
      .select("*");

    if (weekStartDate) {
      compositionsExceptionsQuery = compositionsExceptionsQuery.eq(
        "week_start_date",
        weekStartDate
      );
    }

    const { data: compositionsExceptions, error: exceptionsError } =
      await compositionsExceptionsQuery;

    if (exceptionsError) {
      console.error("Compositions exceptions fetch error:", exceptionsError);
    }

    let studentsExceptionsQuery = supabase.from(
      "composition_students_exceptions"
    ).select(`
        *,
        student:students(
          id,
          name,
          grade,
          school:schools(
            id,
            name,
            level
          )
        )
      `);

    if (weekStartDate) {
      studentsExceptionsQuery = studentsExceptionsQuery.eq(
        "week_start_date",
        weekStartDate
      );
    }

    const { data: studentsExceptions, error: studentsExceptionsError } =
      await studentsExceptionsQuery;

    if (studentsExceptionsError) {
      console.error(
        "Students exceptions fetch error:",
        studentsExceptionsError
      );
    }

    return NextResponse.json({
      data: classes,
      compositionsExceptions: compositionsExceptions || [],
      studentsExceptions: studentsExceptions || [],
    });
  } catch (error) {
    console.error("Classroom schedule API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
