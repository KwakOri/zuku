import { createAdminSupabaseClient } from "@/lib/supabase-server";
import { NextRequest, NextResponse } from "next/server";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// 특정 수업 조회
export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  try {
    const supabase = createAdminSupabaseClient();

    const { data: classData, error } = await supabase
      .from("classes")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Class fetch error:", error);
      return NextResponse.json(
        { error: "수업 정보를 조회할 수 없습니다." },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: classData });
  } catch (error) {
    console.error("Get class error:", error);
    return NextResponse.json(
      { error: "수업 조회 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

// 수업 정보 업데이트
export async function PUT(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  try {
    const supabase = createAdminSupabaseClient();
    const body = await request.json();

    // 업데이트할 필드들 검증
    const allowedFields = [
      'title',
      'description',
      'day_of_week',
      'start_time',
      'end_time',
      'room',
      'color',
      'max_students',
      'subject_id',
      'teacher_id',
      'course_type'
    ];

    const updateData: Record<string, string | number | boolean> = {};

    // 허용된 필드만 추출
    Object.keys(body).forEach(key => {
      if (allowedFields.includes(key) && body[key] !== undefined) {
        updateData[key] = body[key];
      }
    });

    // 업데이트할 데이터가 없는 경우
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "업데이트할 데이터가 없습니다." },
        { status: 400 }
      );
    }

    // 수업 정보 업데이트
    const { data: updatedClass, error } = await supabase
      .from("classes")
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Class update error:", error);
      return NextResponse.json(
        { error: "수업 정보를 업데이트할 수 없습니다." },
        { status: 400 }
      );
    }

    return NextResponse.json({ data: updatedClass });
  } catch (error) {
    console.error("Update class error:", error);
    return NextResponse.json(
      { error: "수업 업데이트 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

// 수업 삭제
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  try {
    const supabase = createAdminSupabaseClient();

    // 먼저 수업에 등록된 학생들이 있는지 확인
    const { data: classStudents, error: studentsCheckError } = await supabase
      .from("relations_classes_students")
      .select("id")
      .eq("class_id", id);

    if (studentsCheckError) {
      console.error("Class students check error:", studentsCheckError);
      return NextResponse.json(
        { error: "수업 학생 정보를 확인할 수 없습니다." },
        { status: 500 }
      );
    }

    // 등록된 학생이 있으면 삭제 방지
    if (classStudents && classStudents.length > 0) {
      return NextResponse.json(
        { error: "등록된 학생이 있는 수업은 삭제할 수 없습니다. 먼저 모든 학생을 수업에서 제거해주세요." },
        { status: 400 }
      );
    }

    // 수업 삭제
    const { error } = await supabase
      .from("classes")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Class delete error:", error);
      return NextResponse.json(
        { error: "수업을 삭제할 수 없습니다." },
        { status: 400 }
      );
    }

    return NextResponse.json({ message: "수업이 성공적으로 삭제되었습니다." });
  } catch (error) {
    console.error("Delete class error:", error);
    return NextResponse.json(
      { error: "수업 삭제 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}