/**
 * 학교 메타 정보 API
 * @route /api/class-school-meta
 */

import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase-server";
import { ClassSchoolMetaInsert } from "@/types/middle-school";

/**
 * GET /api/class-school-meta?class_id={class_id}
 * @description 특정 수업의 학교 메타 정보 조회
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const classId = searchParams.get("class_id");

    if (!classId) {
      return NextResponse.json(
        { error: "class_id is required" },
        { status: 400 }
      );
    }

    const supabase = createAdminSupabaseClient();

    const { data, error } = await supabase
      .from("class_school_meta")
      .select("*")
      .eq("class_id", classId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // 데이터 없음
        return NextResponse.json({ data: null });
      }
      throw error;
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Error fetching class school meta:", error);
    return NextResponse.json(
      { error: "Failed to fetch class school meta" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/class-school-meta
 * @description 학교 메타 정보 생성
 */
export async function POST(request: NextRequest) {
  try {
    const body: ClassSchoolMetaInsert = await request.json();

    if (!body.class_id) {
      return NextResponse.json(
        { error: "class_id is required" },
        { status: 400 }
      );
    }

    const supabase = createAdminSupabaseClient();

    const { data, error } = await supabase
      .from("class_school_meta")
      .insert(body)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    console.error("Error creating class school meta:", error);
    return NextResponse.json(
      { error: "Failed to create class school meta" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/class-school-meta?class_id={class_id}
 * @description 학교 메타 정보 업데이트
 */
export async function PATCH(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const classId = searchParams.get("class_id");

    if (!classId) {
      return NextResponse.json(
        { error: "class_id is required" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const supabase = createAdminSupabaseClient();

    const { data, error } = await supabase
      .from("class_school_meta")
      .update(body)
      .eq("class_id", classId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Error updating class school meta:", error);
    return NextResponse.json(
      { error: "Failed to update class school meta" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/class-school-meta?class_id={class_id}
 * @description 학교 메타 정보 삭제
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const classId = searchParams.get("class_id");

    if (!classId) {
      return NextResponse.json(
        { error: "class_id is required" },
        { status: 400 }
      );
    }

    const supabase = createAdminSupabaseClient();

    const { error } = await supabase
      .from("class_school_meta")
      .delete()
      .eq("class_id", classId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting class school meta:", error);
    return NextResponse.json(
      { error: "Failed to delete class school meta" },
      { status: 500 }
    );
  }
}
