import { NextRequest, NextResponse } from 'next/server';
import { RenewalPreview } from '@/types/student-renewal';
import { applyChanges, backupStudentsToDatabase } from '@/services/server/studentRenewalService';
import { createAdminSupabaseClient } from '@/lib/supabase-server';

/**
 * 변경사항을 DB에 적용
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const preview: RenewalPreview = body.preview;
    const userId: string | undefined = body.userId; // 선택적으로 사용자 ID 받기

    if (!preview) {
      return NextResponse.json(
        { success: false, error: 'preview 데이터가 없습니다.' },
        { status: 400 }
      );
    }

    const supabase = createAdminSupabaseClient();

    // 1. 백업 생성 (backup_students 테이블에 저장)
    let backupId: string;
    try {
      backupId = await backupStudentsToDatabase(supabase, userId);
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          error: `백업 생성 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`,
        },
        { status: 500 }
      );
    }

    // 2. 변경사항 적용
    try {
      await applyChanges(supabase, preview);
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          error: `변경사항 적용 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`,
          backupId, // 백업은 성공했으므로 ID 반환
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '학생 정보가 성공적으로 갱신되었습니다.',
      backupId,
      appliedChanges: {
        newStudents: preview.newStudents.length,
        updatedStudents: preview.updatedStudents.length,
        withdrawnStudents: preview.withdrawnStudents.length,
      },
    });
  } catch (error) {
    console.error('학생 정보 갱신 에러:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '학생 정보 갱신 중 오류가 발생했습니다.',
      },
      { status: 500 }
    );
  }
}
