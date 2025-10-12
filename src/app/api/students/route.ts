import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase-server";
import { TablesInsert } from "@/types/supabase";

export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminSupabaseClient();
    const { searchParams } = new URL(request.url);

    // 검색 필터 파라미터
    const search = searchParams.get("search");
    const grade = searchParams.get("grade");
    const school = searchParams.get("school");

    let query = supabase
      .from("students")
      .select(`
        *,
        school:schools(id, name, level)
      `);

    // 검색어 필터링 (이름, 연락처, 이메일)
    if (search) {
      query = query.or(
        `name.ilike.%${search}%,phone.ilike.%${search}%,email.ilike.%${search}%`
      );
    }

    // 학년 필터링
    if (grade) {
      query = query.eq("grade", parseInt(grade));
    }

    // 학교 필터링 (만약 students 테이블에 school 컬럼이 있다면)
    if (school) {
      query = query.ilike("school", `%${school}%`);
    }

    const { data: students, error } = await query.order("name");

    if (error) {
      console.error("Students fetch error:", error);
      return NextResponse.json(
        { error: "Failed to fetch students" },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: students });
  } catch (error) {
    console.error("Students API error:", error);
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
    const studentData: TablesInsert<"students"> = {
      name: body.name,
      grade: body.grade,
      phone: body.phone || null,
      parent_phone: body.parent_phone || null,
      email: body.email || null,
    };

    const { data: student, error } = await supabase
      .from("students")
      .insert([studentData])
      .select()
      .single();

    if (error) {
      console.error("Student creation error:", error);
      return NextResponse.json(
        { error: "Failed to create student" },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: student }, { status: 201 });
  } catch (error) {
    console.error("Student creation API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}