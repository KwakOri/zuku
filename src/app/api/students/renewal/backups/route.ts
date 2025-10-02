import { NextRequest, NextResponse } from 'next/server';
import { createAdminSupabaseClient } from '@/lib/supabase-server';

/**
 * 백업 기록 조회 API
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminSupabaseClient();

    // 최근 백업 기록 조회 (최대 20개)
    const { data: backups, error } = await supabase
      .from('backup_students')
      .select('*')
      .order('backup_date', { ascending: false })
      .limit(20);

    if (error) {
      throw new Error(`백업 기록 조회 실패: ${error.message}`);
    }

    return NextResponse.json({
      success: true,
      backups: backups || [],
    });
  } catch (error) {
    console.error('백업 기록 조회 에러:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '백업 기록 조회 중 오류가 발생했습니다.',
      },
      { status: 500 }
    );
  }
}
