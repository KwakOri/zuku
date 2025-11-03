import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase-server";
import { TablesInsert } from "@/types/supabase";

export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminSupabaseClient();
    const { searchParams } = new URL(request.url);
    const classId = searchParams.get("class_id");
    const compositionId = searchParams.get("composition_id");
    const studentId = searchParams.get("student_id");

    let query = supabase
      .from("relations_compositions_students")
      .select(`
        *,
        class:classes(
          id,
          title,
          subject:subjects(id, subject_name),
          teacher:teachers(id, name)
        ),
        student:students(
          id,
          name,
          grade,
          phone,
          email,
          school:schools(id, name)
        ),
        composition:class_compositions(
          id,
          day_of_week,
          start_time,
          end_time,
          type,
          class_id
        )
      `)
      .eq("status", "active");

    // 특정 수업의 compositions만 조회
    if (classId) {
      query = query.eq("class_id", classId);
    }

    // 특정 composition만 조회
    if (compositionId) {
      query = query.eq("composition_id", compositionId);
    }

    // 특정 학생의 모든 compositions 조회
    if (studentId) {
      query = query.eq("student_id", studentId);
    }

    const { data: studentCompositions, error } = await query.order("enrolled_date", { ascending: false });

    if (error) {
      console.error("Student compositions fetch error:", error);
      return NextResponse.json(
        { error: "Failed to fetch student compositions" },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: studentCompositions });
  } catch (error) {
    console.error("Student compositions API error:", error);
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
    const studentCompositionData: TablesInsert<"relations_compositions_students"> = {
      class_id: body.class_id,
      student_id: body.student_id,
      composition_id: body.composition_id,
      enrolled_date: body.enrolled_date || new Date().toISOString().split('T')[0],
      status: body.status || "active",
    };

    // 중복 등록 체크
    const { data: existing } = await supabase
      .from("relations_compositions_students")
      .select("id")
      .eq("class_id", body.class_id)
      .eq("student_id", body.student_id)
      .eq("composition_id", body.composition_id)
      .eq("status", "active")
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { error: "Student is already enrolled in this composition" },
        { status: 400 }
      );
    }

    const { data: studentComposition, error } = await supabase
      .from("relations_compositions_students")
      .insert([studentCompositionData])
      .select(`
        *,
        class:classes(
          id,
          title,
          subject:subjects(id, subject_name),
          teacher:teachers(id, name)
        ),
        student:students(
          id,
          name,
          grade,
          phone,
          email,
          school:schools(id, name)
        ),
        composition:class_compositions(
          id,
          day_of_week,
          start_time,
          end_time,
          type,
          class_id
        )
      `)
      .single();

    if (error) {
      console.error("Student composition creation error:", error);

      // Handle database constraint violations
      if (error.code === '23505') {
        return NextResponse.json(
          { error: "Student is already enrolled in this composition" },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { error: "Failed to enroll student in composition" },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: studentComposition }, { status: 201 });
  } catch (error) {
    console.error("Student composition creation API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Composition ID is required" },
        { status: 400 }
      );
    }

    const supabase = createAdminSupabaseClient();

    // soft delete: status를 inactive로 변경
    const { data: studentComposition, error } = await supabase
      .from("relations_compositions_students")
      .update({ status: "inactive" })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Student composition deletion error:", error);
      return NextResponse.json(
        { error: "Failed to remove student from composition" },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: studentComposition });
  } catch (error) {
    console.error("Student composition deletion API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
