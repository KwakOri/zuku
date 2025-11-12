import { NextRequest, NextResponse } from 'next/server';
import { RenewalPreview } from '@/types/student-renewal';
import {
  applyStudentsOnly,
  applyClasses,
  applyCompositions,
  applyEnrollments,
  backupStudentsToDatabase
} from '@/services/server/studentRenewalService';
import { createAdminSupabaseClient } from '@/lib/supabase-server';

/**
 * 단계별로 변경사항을 DB에 적용
 * step: 'students' | 'classes' | 'compositions' | 'enrollments'
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const preview: RenewalPreview = body.preview;
    const step: string = body.step || 'students'; // 기본값: students
    const userId: string | undefined = body.userId;

    console.log(`[Apply API] ========== Step: ${step} ==========`);
    console.log(`[Apply API] Preview 데이터:`, {
      newStudents: preview.newStudents.length,
      updatedStudents: preview.updatedStudents.length,
      withdrawnStudents: preview.withdrawnStudents.length,
      classes: preview.classes?.length || 0,
      compositions: preview.compositions?.length || 0,
      enrollments: preview.enrollments?.length || 0,
    });

    if (!preview) {
      return NextResponse.json(
        { success: false, error: 'preview 데이터가 없습니다.' },
        { status: 400 }
      );
    }

    const supabase = createAdminSupabaseClient();

    // 단계별 처리
    switch (step) {
      case 'students': {
        console.log('[Apply API] 1단계: 학생 정보 적용');

        // 백업 생성
        let backupId: string;
        try {
          console.log('[Apply API] 백업 생성 중...');
          backupId = await backupStudentsToDatabase(supabase, userId);
          console.log(`[Apply API] ✓ 백업 생성 완료 (ID: ${backupId})`);
        } catch (error) {
          console.error('[Apply API] 백업 생성 실패:', error);
          return NextResponse.json(
            {
              success: false,
              error: `백업 생성 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`,
            },
            { status: 500 }
          );
        }

        // 학생 정보만 적용
        try {
          await applyStudentsOnly(supabase, preview);
          console.log('[Apply API] ✓ 학생 정보 적용 완료');
        } catch (error) {
          console.error('[Apply API] 학생 정보 적용 실패:', error);
          return NextResponse.json(
            {
              success: false,
              error: `학생 정보 적용 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`,
              backupId,
            },
            { status: 500 }
          );
        }

        return NextResponse.json({
          success: true,
          message: '1단계: 학생 정보가 성공적으로 적용되었습니다.',
          backupId,
          nextStep: 'classes',
        });
      }

      case 'classes': {
        console.log('[Apply API] 2단계: 반 생성');

        try {
          await applyClasses(supabase, preview);
          console.log('[Apply API] ✓ 반 생성 완료');
        } catch (error) {
          console.error('[Apply API] 반 생성 실패:', error);
          return NextResponse.json(
            {
              success: false,
              error: `반 생성 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`,
            },
            { status: 500 }
          );
        }

        return NextResponse.json({
          success: true,
          message: '2단계: 반이 성공적으로 생성되었습니다.',
          nextStep: 'compositions',
        });
      }

      case 'compositions': {
        console.log('[Apply API] 3단계: 수업 구성 생성');

        try {
          await applyCompositions(supabase, preview);
          console.log('[Apply API] ✓ 수업 구성 생성 완료');
        } catch (error) {
          console.error('[Apply API] 수업 구성 생성 실패:', error);
          return NextResponse.json(
            {
              success: false,
              error: `수업 구성 생성 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`,
            },
            { status: 500 }
          );
        }

        return NextResponse.json({
          success: true,
          message: '3단계: 수업 구성이 성공적으로 생성되었습니다.',
          nextStep: 'enrollments',
        });
      }

      case 'enrollments': {
        console.log('[Apply API] 4단계: 수강 정보 생성');

        try {
          await applyEnrollments(supabase, preview);
          console.log('[Apply API] ✓ 수강 정보 생성 완료');
        } catch (error) {
          console.error('[Apply API] 수강 정보 생성 실패:', error);
          return NextResponse.json(
            {
              success: false,
              error: `수강 정보 생성 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`,
            },
            { status: 500 }
          );
        }

        return NextResponse.json({
          success: true,
          message: '4단계: 수강 정보가 성공적으로 생성되었습니다. 모든 단계가 완료되었습니다!',
          nextStep: 'complete',
        });
      }

      default:
        return NextResponse.json(
          { success: false, error: `알 수 없는 단계: ${step}` },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('[Apply API] 오류 발생:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.',
      },
      { status: 500 }
    );
  }
}
