import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase-server";

// POST /api/weekly-report-logs - 주간 보고서 발송 기록 저장
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { week_of, student_id, subject_ids, sent_by } = body;

    // 필수 필드 검증
    if (!week_of || !student_id || !subject_ids || !Array.isArray(subject_ids) || !sent_by) {
      return NextResponse.json(
        { error: "필수 필드가 누락되었습니다." },
        { status: 400 }
      );
    }

    const supabase = createAdminSupabaseClient();

    // 과목별로 발송 기록 생성
    const logsToInsert = subject_ids.map((subject_id: string) => ({
      week_of,
      student_id,
      subject_id,
      sent_by,
      sent_at: new Date().toISOString(),
    }));

    const { data, error } = await supabase
      .from("weekly_report_logs")
      .insert(logsToInsert)
      .select(`
        *,
        student:students(id, name),
        subject:subjects(id, subject_name)
      `);

    if (error) {
      // 중복 오류는 무시 (UNIQUE constraint)
      if (error.code === "23505") {
        return NextResponse.json(
          { message: "이미 발송된 기록이 있습니다.", data: [] },
          { status: 200 }
        );
      }

      console.error("Error creating weekly report logs:", error);
      return NextResponse.json(
        { error: "발송 기록 저장 중 오류가 발생했습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json({ data, message: "발송 기록이 저장되었습니다." });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "예상치 못한 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

// GET /api/weekly-report-logs - 발송 기록 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const weekOf = searchParams.get("week_of");
    const studentId = searchParams.get("student_id");

    const supabase = createAdminSupabaseClient();

    let query = supabase
      .from("weekly_report_logs")
      .select(`
        *,
        student:students(id, name),
        subject:subjects(id, subject_name)
      `)
      .order("sent_at", { ascending: false });

    // 필터 적용
    if (weekOf) {
      query = query.eq("week_of", weekOf);
    }
    if (studentId) {
      query = query.eq("student_id", studentId);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching weekly report logs:", error);
      return NextResponse.json(
        { error: "발송 기록을 불러오는 중 오류가 발생했습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "예상치 못한 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
