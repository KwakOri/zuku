import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { ExcelStudentData, ParsedStudentData } from '@/types/student-renewal';
import { compareWithDatabase } from '@/services/server/studentRenewalService';
import { createAdminSupabaseClient } from '@/lib/supabase-server';
import { parseClassName } from '@/lib/classNameParser';

// 필수 컬럼 목록
const REQUIRED_COLUMNS = ['반명', '학생명', '학교명', '학년', '학생핸드폰', '생년월일', '성별'];

/**
 * 엑셀/CSV 파일을 파싱하고 DB 데이터와 비교
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: '파일이 없습니다.' },
        { status: 400 }
      );
    }

    // 파일 형식 확인
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    if (!['xlsx', 'xls', 'csv'].includes(fileExtension || '')) {
      return NextResponse.json(
        { success: false, error: 'Excel 파일(.xlsx, .xls) 또는 CSV 파일만 업로드 가능합니다.' },
        { status: 400 }
      );
    }

    // 파일 읽기
    const buffer = Buffer.from(await file.arrayBuffer());
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
    const rawData = XLSX.utils.sheet_to_json<ExcelStudentData>(firstSheet);

    if (rawData.length === 0) {
      return NextResponse.json(
        { success: false, error: '파일에 데이터가 없습니다.' },
        { status: 400 }
      );
    }

    // 필수 컬럼 확인
    const firstRow = rawData[0];
    const missingColumns = REQUIRED_COLUMNS.filter((col) => !(col in firstRow));

    if (missingColumns.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `필수 컬럼이 누락되었습니다: ${missingColumns.join(', ')}`,
        },
        { status: 400 }
      );
    }

    // 데이터 검증 및 파싱
    const parsedData: ParsedStudentData[] = [];
    const validationErrors: string[] = [];

    rawData.forEach((row, index) => {
      const rowNumber = index + 2; // Excel 행 번호 (헤더 포함)

      try {
        // 필수 필드 검증
        if (!row.학생명 || String(row.학생명).trim() === '') {
          validationErrors.push(`${rowNumber}행: 학생명이 누락되었습니다.`);
          return;
        }

        const studentName = String(row.학생명).trim();

        // 생년월일 검증 및 변환
        let birthDate = '';
        const birthDateRaw = row.생년월일;

        if (!birthDateRaw || birthDateRaw === '' || String(birthDateRaw).trim() === '' || String(birthDateRaw) === 'undefined') {
          validationErrors.push(`${rowNumber}행 (${studentName}): 생년월일이 누락되었습니다.`);
          return;
        }

        // Excel 날짜를 숫자로 읽어온 경우 (예: 40545)
        if (typeof birthDateRaw === 'number') {
          const excelEpoch = new Date(1900, 0, 1);
          const date = new Date(excelEpoch.getTime() + (birthDateRaw - 2) * 24 * 60 * 60 * 1000);
          // 타임존 문제를 방지하기 위해 로컬 날짜를 사용
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          birthDate = `${year}-${month}-${day}`;
        } else {
          birthDate = String(birthDateRaw).trim();
          if (birthDate.includes('/')) {
            birthDate = birthDate.replace(/\//g, '-');
          }
          if (birthDate.length === 8 && !birthDate.includes('-')) {
            birthDate = `${birthDate.slice(0, 4)}-${birthDate.slice(4, 6)}-${birthDate.slice(6, 8)}`;
          }
        }

        // 날짜 형식 최종 검증
        if (!/^\d{4}-\d{2}-\d{2}$/.test(birthDate)) {
          validationErrors.push(`${rowNumber}행 (${studentName}): 생년월일 형식이 올바르지 않습니다 (${birthDate})`);
          return;
        }

        // 성별 변환
        let gender: 'male' | 'female' = 'male';
        const genderStr = String(row.성별).trim();
        if (genderStr === '여' || genderStr === 'F' || genderStr === 'female') {
          gender = 'female';
        }

        // 전화번호 포맷 정리
        let phone = String(row.학생핸드폰 || '').trim();
        phone = phone.replace(/[^0-9]/g, '');
        if (phone.length === 11) {
          phone = `${phone.slice(0, 3)}-${phone.slice(3, 7)}-${phone.slice(7)}`;
        } else if (phone.length === 10) {
          phone = `${phone.slice(0, 3)}-${phone.slice(3, 6)}-${phone.slice(6)}`;
        }

        // 학교명에서 학교 레벨 추출 및 학년 변환 (1-12 통합 학년)
        const schoolName = String(row.학교명 || '').trim();
        let unifiedGrade = Number(row.학년) || 0;

        if (schoolName.endsWith('초')) {
          // 초등학교: 1-6학년 → 1-6
          unifiedGrade = Number(row.학년);
        } else if (schoolName.endsWith('중')) {
          // 중학교: 1-3학년 → 7-9
          unifiedGrade = Number(row.학년) + 6;
        } else if (schoolName.endsWith('고')) {
          // 고등학교: 1-3학년 → 10-12
          unifiedGrade = Number(row.학년) + 9;
        }

        // 반명 파싱
        const classNameRaw = String(row.반명 || '').trim();
        const classInfo = parseClassName(classNameRaw, unifiedGrade);

        if (!classInfo) {
          validationErrors.push(`${rowNumber}행 (${studentName}): 반명 형식이 올바르지 않습니다 (${classNameRaw})`);
          return;
        }

        parsedData.push({
          className: classNameRaw,
          classInfo,
          name: studentName,
          schoolName,
          grade: unifiedGrade,
          phone,
          birthDate,
          gender,
        });
      } catch (error) {
        validationErrors.push(`${rowNumber}행 (${row.학생명 || '알 수 없음'}): ${error instanceof Error ? error.message : '데이터 처리 오류'}`);
      }
    });

    // 검증 오류가 있으면 처리 중단
    if (validationErrors.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `데이터 검증 실패:\n${validationErrors.join('\n')}`,
        },
        { status: 400 }
      );
    }

    // DB 데이터와 비교
    const supabase = createAdminSupabaseClient();
    const preview = await compareWithDatabase(supabase, parsedData);

    return NextResponse.json({
      success: true,
      preview,
      message: '파일 분석 완료',
    });
  } catch (error) {
    console.error('파일 파싱 에러:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '파일 처리 중 오류가 발생했습니다.',
      },
      { status: 500 }
    );
  }
}
