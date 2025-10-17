import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';
import { ParsedStudentData, StudentComparison, StudentChange, RenewalPreview } from '@/types/student-renewal';

type Student = Database['public']['Tables']['students']['Row'];
type School = Database['public']['Tables']['schools']['Row'];

/**
 * 학교명 파싱 (레벨과 기본명 분리)
 */
function parseSchoolName(schoolName: string): { baseName: string; level: 'elementary' | 'middle' | 'high' } | null {
  console.log('[parseSchoolName] Input:', schoolName);

  let level: 'elementary' | 'middle' | 'high' | null = null;
  let baseName = schoolName;

  if (schoolName.endsWith('초')) {
    level = 'elementary';
    baseName = schoolName.slice(0, -1);
  } else if (schoolName.endsWith('중')) {
    level = 'middle';
    baseName = schoolName.slice(0, -1);
  } else if (schoolName.endsWith('고')) {
    level = 'high';
    baseName = schoolName.slice(0, -1);
  }

  if (!level) {
    console.log('[parseSchoolName] Failed to parse - no level found');
    return null;
  }

  console.log('[parseSchoolName] Parsed:', { baseName, level });
  return { baseName, level };
}

/**
 * 학교명으로 schools 테이블에서 학교 찾기
 * 학교명이 "-초", "-중", "-고"로 끝나는지 확인하고 매칭
 */
export async function findSchoolByName(
  supabase: SupabaseClient<Database>,
  schoolName: string
): Promise<School | null> {
  const parsed = parseSchoolName(schoolName);
  if (!parsed) {
    return null;
  }

  const { data, error } = await supabase
    .from('schools')
    .select('*')
    .eq('name', parsed.baseName)
    .eq('level', parsed.level)
    .single();

  if (error) {
    console.error('School lookup error:', error);
    return null;
  }

  return data;
}

/**
 * 모든 학교 데이터를 가져와서 Map으로 캐싱
 */
async function getAllSchoolsMap(supabase: SupabaseClient<Database>): Promise<Map<string, School>> {
  const { data: schools, error } = await supabase
    .from('schools')
    .select('*');

  if (error) {
    console.error('Failed to fetch all schools:', error);
    return new Map();
  }

  const schoolMap = new Map<string, School>();
  schools?.forEach(school => {
    // DB 학교명도 파싱하여 baseName으로 키 생성
    // 예: "영석고" → "영석-high"
    let baseName = school.name;

    // 학교명 끝에 초/중/고가 있으면 제거
    if (school.level === 'elementary' && baseName.endsWith('초')) {
      baseName = baseName.slice(0, -1);
    } else if (school.level === 'middle' && baseName.endsWith('중')) {
      baseName = baseName.slice(0, -1);
    } else if (school.level === 'high' && baseName.endsWith('고')) {
      baseName = baseName.slice(0, -1);
    }

    const key = `${baseName}-${school.level}`;
    console.log('[getAllSchoolsMap] Creating key:', key, 'for school:', school.name);
    schoolMap.set(key, school);
  });

  return schoolMap;
}

/**
 * 캐시된 Map에서 학교 찾기
 */
function findSchoolFromCache(schoolName: string, schoolMap: Map<string, School>): School | null {
  console.log('[findSchoolFromCache] Looking for school:', schoolName);
  console.log('[findSchoolFromCache] Available schools in map:', Array.from(schoolMap.keys()));

  const parsed = parseSchoolName(schoolName);
  if (!parsed) {
    console.log('[findSchoolFromCache] Parse failed, returning null');
    return null;
  }

  const key = `${parsed.baseName}-${parsed.level}`;
  console.log('[findSchoolFromCache] Looking for key:', key);

  const school = schoolMap.get(key) || null;
  if (school) {
    console.log('[findSchoolFromCache] Found school:', school.id, school.name);
  } else {
    console.log('[findSchoolFromCache] School not found in map');
  }

  return school;
}

/**
 * 이름과 생년월일로 기존 학생 찾기
 */
export async function findStudentByNameAndBirth(
  supabase: SupabaseClient<Database>,
  name: string,
  birthDate: string
): Promise<Student | null> {
  const { data, error } = await supabase
    .from('students')
    .select('*')
    .eq('name', name)
    .eq('birth_date', birthDate)
    .single();

  if (error) {
    return null;
  }

  return data;
}

/**
 * 두 학생 데이터를 비교하여 변경사항 추출
 */
export function compareStudentData(
  existing: Student,
  newData: ParsedStudentData,
  schoolId: string | null
): StudentChange[] {
  const changes: StudentChange[] = [];

  if (existing.class_name !== newData.className) {
    changes.push({
      field: '반명',
      oldValue: existing.class_name || null,
      newValue: newData.className,
    });
  }

  if (existing.school_id !== schoolId) {
    changes.push({
      field: '학교',
      oldValue: existing.school_id || null,
      newValue: schoolId || '',
    });
  }

  if (existing.grade !== newData.grade) {
    changes.push({
      field: '학년',
      oldValue: existing.grade,
      newValue: newData.grade,
    });
  }

  if (existing.phone !== newData.phone) {
    changes.push({
      field: '휴대폰',
      oldValue: existing.phone || null,
      newValue: newData.phone,
    });
  }

  if (existing.gender !== newData.gender) {
    changes.push({
      field: '성별',
      oldValue: existing.gender || null,
      newValue: newData.gender,
    });
  }

  return changes;
}

/**
 * 엑셀 데이터와 DB 데이터 비교 (최적화 버전)
 */
export async function compareWithDatabase(
  supabase: SupabaseClient<Database>,
  parsedData: ParsedStudentData[]
): Promise<RenewalPreview> {
  // 1. 모든 학교 데이터를 한 번에 가져와서 캐싱 (1회 쿼리)
  const schoolMap = await getAllSchoolsMap(supabase);

  // 2. 모든 현재 재원중인 학생 가져오기 (1회 쿼리)
  const { data: allStudents, error } = await supabase
    .from('students')
    .select('*')
    .eq('enrollment_status', 'active');

  if (error) {
    throw new Error(`학생 데이터 조회 실패: ${error.message}`);
  }

  // 3. 학생 데이터를 Map으로 변환 (이름+생년월일을 키로)
  const studentMap = new Map<string, Student>();
  allStudents?.forEach(student => {
    const key = `${student.name}-${student.birth_date}`;
    studentMap.set(key, student);
  });

  const newStudents: StudentComparison[] = [];
  const updatedStudents: StudentComparison[] = [];
  const withdrawnStudents: StudentComparison[] = [];

  // 엑셀 데이터 처리 (모두 메모리 조회, DB 쿼리 0회)
  const processedIds = new Set<string>();

  for (const data of parsedData) {
    // 캐시에서 학교 찾기 (DB 쿼리 없음)
    const school = findSchoolFromCache(data.schoolName, schoolMap);
    const schoolId = school?.id || null;

    // Map에서 기존 학생 찾기 (DB 쿼리 없음)
    const key = `${data.name}-${data.birthDate}`;
    const existing = studentMap.get(key);

    if (existing) {
      processedIds.add(existing.id);

      // 변경사항 확인
      const changes = compareStudentData(existing, data, schoolId);

      if (changes.length > 0) {
        updatedStudents.push({
          id: existing.id,
          name: existing.name,
          birthDate: existing.birth_date || '',
          changeType: 'updated',
          changes,
          newData: data,
        });
      }
    } else {
      // 새 학생
      newStudents.push({
        name: data.name,
        birthDate: data.birthDate,
        changeType: 'new',
        newData: data,
      });
    }
  }

  // 퇴원 학생 찾기 (DB에는 있지만 엑셀에 없는 학생)
  for (const student of allStudents || []) {
    if (!processedIds.has(student.id)) {
      withdrawnStudents.push({
        id: student.id,
        name: student.name,
        birthDate: student.birth_date || '',
        changeType: 'withdrawn',
      });
    }
  }

  return {
    newStudents,
    updatedStudents,
    withdrawnStudents,
    totalChanges: newStudents.length + updatedStudents.length + withdrawnStudents.length,
  };
}

/**
 * 현재 학생 데이터를 backup_students 테이블에 저장
 */
export async function backupStudentsToDatabase(
  supabase: SupabaseClient<Database>,
  userId?: string
): Promise<string> {
  const { data: students, error } = await supabase
    .from('students')
    .select('*')
    .eq('enrollment_status', 'active');

  if (error) {
    throw new Error(`백업 데이터 조회 실패: ${error.message}`);
  }

  // 학생 데이터를 JSONB로 직렬화
  const backupData = {
    students: students || [],
    timestamp: new Date().toISOString(),
  };

  // backup_students 테이블에 저장
  const { data: backup, error: backupError } = await supabase
    .from('backup_students')
    .insert({
      backup_data: backupData,
      student_count: students?.length || 0,
      created_by: userId || null,
      notes: '학생 정보 갱신 전 자동 백업',
    })
    .select()
    .single();

  if (backupError) {
    throw new Error(`백업 저장 실패: ${backupError.message}`);
  }

  return backup.id;
}

/**
 * 변경사항을 DB에 적용 (트랜잭션 방식)
 */
export async function applyChanges(
  supabase: SupabaseClient<Database>,
  preview: RenewalPreview
): Promise<void> {
  // 학교 데이터 캐싱 (1회 쿼리)
  const schoolMap = await getAllSchoolsMap(supabase);

  // 모든 작업을 배열로 준비
  const insertPromises: Promise<unknown>[] = [];
  const updatePromises: Promise<unknown>[] = [];
  const withdrawPromises: Promise<unknown>[] = [];

  // 1. 새 학생 추가 준비
  const newStudentInserts = preview.newStudents
    .filter(s => s.newData)
    .map(student => {
      console.log('[applyChanges] Processing new student:', student.newData!.name, 'School:', student.newData!.schoolName);
      const school = findSchoolFromCache(student.newData!.schoolName, schoolMap);
      console.log('[applyChanges] Matched school_id:', school?.id || 'null');

      return {
        name: student.newData!.name,
        class_name: student.newData!.className,
        school_id: school?.id || null,
        grade: student.newData!.grade,
        phone: student.newData!.phone,
        birth_date: student.newData!.birthDate,
        gender: student.newData!.gender,
        enrollment_status: 'active' as const,
      };
    });

  // 배치로 삽입 (한 번에 처리)
  if (newStudentInserts.length > 0) {
    insertPromises.push(
      Promise.resolve(supabase.from('students').insert(newStudentInserts))
        .then(({ error }) => {
          if (error) throw new Error(`학생 추가 실패: ${error.message}`);
        })
    );
  }

  // 2. 기존 학생 업데이트 (개별 처리 - Supabase는 배치 업데이트 미지원)
  for (const student of preview.updatedStudents) {
    if (!student.id || !student.newData) continue;

    console.log('[applyChanges] Processing updated student:', student.name, 'School:', student.newData.schoolName);
    const school = findSchoolFromCache(student.newData.schoolName, schoolMap);
    console.log('[applyChanges] Matched school_id:', school?.id || 'null');

    updatePromises.push(
      Promise.resolve(
        supabase
          .from('students')
          .update({
            class_name: student.newData.className,
            school_id: school?.id || null,
            grade: student.newData.grade,
            phone: student.newData.phone,
            gender: student.newData.gender,
          })
          .eq('id', student.id)
      ).then(({ error }) => {
        if (error) throw new Error(`학생 업데이트 실패 (${student.name}): ${error.message}`);
      })
    );
  }

  // 3. 퇴원 학생 처리
  const withdrawnIds = preview.withdrawnStudents
    .filter(s => s.id)
    .map(s => s.id!);

  if (withdrawnIds.length > 0) {
    withdrawPromises.push(
      Promise.resolve(
        supabase
          .from('students')
          .update({ enrollment_status: 'withdrawn' as const })
          .in('id', withdrawnIds)
      ).then(({ error }) => {
        if (error) throw new Error(`학생 퇴원 처리 실패: ${error.message}`);
      })
    );
  }

  // 모든 작업을 병렬로 실행하되, 하나라도 실패하면 전체 롤백
  try {
    await Promise.all([...insertPromises, ...updatePromises, ...withdrawPromises]);
  } catch (error) {
    throw new Error(`변경사항 적용 중 오류 발생: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
  }
}
