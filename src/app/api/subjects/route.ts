import { NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase-server";

export async function GET() {
  try {
    const supabase = createAdminSupabaseClient();

    const { data: subjects, error } = await supabase
      .from("subjects")
      .select("*")
      .order("subject_name");

    if (error) {
      console.error("Subjects fetch error:", error);
      return NextResponse.json(
        { error: "Failed to fetch subjects" },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: subjects });
  } catch (error) {
    console.error("Subjects API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}