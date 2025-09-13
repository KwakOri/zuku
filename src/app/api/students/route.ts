import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase-server";
import { TablesInsert } from "@/types/supabase";

export async function GET() {
  try {
    const supabase = createAdminSupabaseClient();
    
    const { data: students, error } = await supabase
      .from("students")
      .select("*")
      .order("name");

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