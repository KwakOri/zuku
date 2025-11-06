import { createAdminSupabaseClient } from '@/lib/supabase-server';
import { NextRequest, NextResponse } from 'next/server';

/**
 * 특정 weekly_report와 관련된 중등 숙제 기록 조회
 * GET /api/weekly-reports/[id]
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const reportId = params.id;

    if (!reportId) {
      return NextResponse.json(
        { error: 'Report ID is required' },
        { status: 400 }
      );
    }

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
            school_name
          )
        )
      `)
      .eq('id', reportId)
      .single();

    if (reportError || !weeklyReport) {
      return NextResponse.json(
        { error: 'Weekly report not found' },
        { status: 404 }
      );
    }

    // 2. 만료 확인
    const now = new Date();
    const expiredAt = new Date(weeklyReport.expired_at);
    const isExpired = now > expiredAt;

    // 3. 해당 주의 중등 숙제 기록 조회
    // week_of는 월요일, 일요일까지의 범위로 조회
    const weekStart = new Date(weeklyReport.week_of);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6); // 일요일까지

    const weekStartStr = weekStart.toISOString().split('T')[0];
    const weekEndStr = weekEnd.toISOString().split('T')[0];

    const { data: homeworkRecords, error: homeworkError } = await supabase
      .from('homework_records_middle')
      .select(`
        id,
        student_id,
        subject_id,
        record_date,
        homework_completion,
        test_score,
        notes,
        subjects (
          id,
          subject_name
        )
      `)
      .eq('student_id', weeklyReport.student_id)
      .gte('record_date', weekStartStr)
      .lte('record_date', weekEndStr)
      .order('record_date', { ascending: true })
      .order('subject_id', { ascending: true });

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
        weekStart: weekStartStr,
        weekEnd: weekEndStr,
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
