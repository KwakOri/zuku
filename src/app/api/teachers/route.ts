import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase-server";
import { TablesInsert } from "@/types/supabase";

export async function GET() {
  try {
    const supabase = createAdminSupabaseClient();
    
    const { data: teachers, error } = await supabase
      .from("teachers")
      .select("*")
      .order("name");

    if (error) {
      console.error("Teachers fetch error:", error);
      return NextResponse.json(
        { error: "Failed to fetch teachers" },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: teachers });
  } catch (error) {
    console.error("Teachers API error:", error);
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
    const teacherData: TablesInsert<"teachers"> = {
      id: body.id,
      name: body.name,
      phone: body.phone || null,
      email: body.email || null,
    };

    const { data: teacher, error } = await supabase
      .from("teachers")
      .insert([teacherData])
      .select()
      .single();

    if (error) {
      console.error("Teacher creation error:", error);
      return NextResponse.json(
        { error: "Failed to create teacher" },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: teacher }, { status: 201 });
  } catch (error) {
    console.error("Teacher creation API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}