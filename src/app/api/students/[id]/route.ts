import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase-server";
import { TablesUpdate } from "@/types/supabase";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  try {
    const supabase = createAdminSupabaseClient();

    const { data: student, error } = await supabase
      .from("students")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json(
          { error: "Student not found" },
          { status: 404 }
        );
      }
      console.error("Student fetch error:", error);
      return NextResponse.json(
        { error: "Failed to fetch student" },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: student });
  } catch (error) {
    console.error("Student API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  try {
    const body = await request.json();
    const supabase = createAdminSupabaseClient();

    const updateData: TablesUpdate<"students"> = {
      name: body.name,
      grade: body.grade,
      phone: body.phone || null,
      parent_phone: body.parent_phone || null,
      email: body.email || null,
    };

    const { data: student, error } = await supabase
      .from("students")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Student update error:", error);
      return NextResponse.json(
        { error: "Failed to update student" },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: student });
  } catch (error) {
    console.error("Student update API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = createAdminSupabaseClient();
    const studentId = parseInt(params.id);

    if (isNaN(studentId)) {
      return NextResponse.json(
        { error: "Invalid student ID" },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("students")
      .delete()
      .eq("id", studentId);

    if (error) {
      console.error("Student delete error:", error);
      return NextResponse.json(
        { error: "Failed to delete student" },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "Student deleted successfully" });
  } catch (error) {
    console.error("Student delete API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}