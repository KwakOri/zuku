import { createAdminSupabaseClient } from '@/lib/supabase-server';
import { NextRequest, NextResponse } from 'next/server';

/**
 * 특정 weekly_report와 관련된 중등 숙제 기록 조회
 * GET /api/weekly-reports/[id]
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: reportId } = await params;

    if (!reportId) {
      return NextResponse.json(
        { error: 'Report ID is required' },
        { status: 400 }
      );
    }

    console.log('[WeeklyReports GET] Fetching report with ID:', reportId);

    const supabase = createAdminSupabaseClient();

    // 1. weekly_report 정보 조회
    const { data: weeklyReport, error: reportError } = await supabase
      .from('weekly_reports')
      .select(`
        id,
        student_id,
        week_of,
        expired_at,
        created_at,
        students (
          id,
          name,
          grade,
          school_id,
          schools (
            id,
            name
          )
        )
      `)
      .eq('id', reportId)
      .single();

    if (reportError || !weeklyReport) {
      console.log('[WeeklyReports GET] Report not found. Error:', reportError);
      console.log('[WeeklyReports GET] This might be an old report_id from homework_records_middle');
      return NextResponse.json(
        { error: 'Weekly report not found. This ID may be from an old notification sent before the system update.' },
        { status: 404 }
      );
    }

    console.log('[WeeklyReports GET] Found report:', weeklyReport);

    // 2. 만료 확인
    const now = new Date();
    const expiredAt = new Date(weeklyReport.expired_at);
    const isExpired = now > expiredAt;

    // 3. 해당 주의 중등 숙제 기록 조회
    // week_of로 조회 (YYYY-MM-DD 형식의 월요일 날짜)
    const { data: homeworkRecords, error: homeworkError } = await supabase
      .from('homework_records_middle')
      .select(`
        id,
        student_id,
        class_id,
        week_of,
        attendance,
        homework,
        participation,
        understanding,
        notes,
        created_date,
        classes (
          id,
          subject_id,
          subjects (
            id,
            subject_name
          )
        )
      `)
      .eq('student_id', weeklyReport.student_id)
      .eq('week_of', weeklyReport.week_of)
      .order('created_date', { ascending: true });

    if (homeworkError) {
      console.error('Homework records fetch error:', homeworkError);
      return NextResponse.json(
        { error: 'Failed to fetch homework records' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        report: weeklyReport,
        isExpired,
        homeworkRecords: homeworkRecords || [],
      },
    });
  } catch (error) {
    console.error('Weekly report API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
