import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';
import {
  ParsedStudentData,
  StudentComparison,
  StudentChange,
  RenewalPreview,
  ParsedClassInfo,
  ClassPreview,
  CompositionPreview,
  EnrollmentPreview
} from '@/types/student-renewal';

type Student = Database['public']['Tables']['students']['Row'];
type School = Database['public']['Tables']['schools']['Row'];
type Subject = Database['public']['Tables']['subjects']['Row'];
type Class = Database['public']['Tables']['classes']['Row'];
type ClassComposition = Database['public']['Tables']['class_compositions']['Row'];

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
 * 반 정보 미리 분석
 */
async function analyzeClasses(
  supabase: SupabaseClient<Database>,
  parsedData: ParsedStudentData[]
): Promise<ClassPreview[]> {
  console.log('[analyzeClasses] 반 정보 분석 시작');

  // 중복 제거: 같은 반은 한 번만 분석
  const uniqueClasses = new Map<string, ParsedClassInfo>();

  for (const data of parsedData) {
    const key = data.classInfo.fullClassName;
    if (!uniqueClasses.has(key)) {
      uniqueClasses.set(key, data.classInfo);
      console.log(`[analyzeClasses] 발견된 반: ${key}, split_type: ${data.classInfo.splitType}`);
    }
  }

  // 기존 반 조회
  const { data: existingClasses, error } = await supabase
    .from('classes')
    .select('id, title, subject_id');

  if (error) {
    console.error('[analyzeClasses] 기존 반 조회 실패:', error);
  }

  const existingClassTitles = new Set(existingClasses?.map(c => c.title) || []);
  console.log(`[analyzeClasses] 기존 반 ${existingClassTitles.size}개 발견`);

  const classPreview: ClassPreview[] = [];

  for (const classInfo of uniqueClasses.values()) {
    const exists = existingClassTitles.has(classInfo.fullClassName);
    classPreview.push({
      subjectName: classInfo.subjectName,
      fullClassName: classInfo.fullClassName,
      splitType: classInfo.splitType,
      courseType: 'regular', // 기본값
      exists,
    });
    console.log(`[analyzeClasses] ${classInfo.fullClassName}: ${exists ? '기존 반' : '새 반'}`);
  }

  console.log(`[analyzeClasses] 총 ${classPreview.length}개 반 분석 완료`);
  return classPreview;
}

/**
 * 수업 구성 정보 미리 분석
 */
async function analyzeCompositions(
  supabase: SupabaseClient<Database>,
  parsedData: ParsedStudentData[]
): Promise<CompositionPreview[]> {
  console.log('[analyzeCompositions] 수업 구성 정보 분석 시작');

  // 중복 제거: 같은 구성은 한 번만 분석
  const uniqueCompositions = new Map<string, CompositionPreview>();

  for (const data of parsedData) {
    for (const schedule of data.classInfo.schedules) {
      const key = `${data.classInfo.fullClassName}-${schedule.dayOfWeek}-${schedule.startTime}-${schedule.endTime}-${schedule.type}`;
      if (!uniqueCompositions.has(key)) {
        uniqueCompositions.set(key, {
          fullClassName: data.classInfo.fullClassName,
          dayOfWeek: schedule.dayOfWeek,
          startTime: schedule.startTime,
          endTime: schedule.endTime,
          type: schedule.type,
          exists: false, // 나중에 확인
        });
        console.log(`[analyzeCompositions] 발견된 구성: ${data.classInfo.fullClassName} - ${schedule.type} (${schedule.dayOfWeek}요일 ${schedule.startTime})`);
      }
    }
  }

  // 기존 구성 조회 (간단히 전체 조회)
  const { data: existingCompositions, error } = await supabase
    .from('class_compositions')
    .select('id, class_id, day_of_week, start_time, end_time, type');

  if (error) {
    console.error('[analyzeCompositions] 기존 구성 조회 실패:', error);
  }

  console.log(`[analyzeCompositions] 기존 구성 ${existingCompositions?.length || 0}개 발견`);

  // 기존 반과 매칭 필요
  const { data: existingClasses } = await supabase
    .from('classes')
    .select('id, title');

  const classIdByTitle = new Map<string, string>();
  existingClasses?.forEach(c => {
    classIdByTitle.set(c.title, c.id);
  });

  const compositionPreview: CompositionPreview[] = Array.from(uniqueCompositions.values()).map(comp => {
    // 해당 반이 존재하는지 확인
    const classId = classIdByTitle.get(comp.fullClassName);
    let exists = false;

    if (classId && existingCompositions) {
      // 시간 비교를 위해 HH:MM 형식으로 정규화
      const normalizeTime = (time: string) => time.substring(0, 5); // HH:MM:SS → HH:MM

      exists = existingCompositions.some(ec =>
        ec.class_id === classId &&
        ec.day_of_week === comp.dayOfWeek &&
        normalizeTime(ec.start_time) === comp.startTime &&
        normalizeTime(ec.end_time) === comp.endTime &&
        ec.type === comp.type
      );
    }

    console.log(`[analyzeCompositions] ${comp.fullClassName} ${comp.type}: ${exists ? '기존 구성' : '새 구성'}`);
    return { ...comp, exists };
  });

  console.log(`[analyzeCompositions] 총 ${compositionPreview.length}개 구성 분석 완료`);
  return compositionPreview;
}

/**
 * 수강 정보 미리 분석
 */
async function analyzeEnrollments(
  supabase: SupabaseClient<Database>,
  parsedData: ParsedStudentData[]
): Promise<EnrollmentPreview[]> {
  console.log('[analyzeEnrollments] 수강 정보 분석 시작');

  // 기존 학생 정보 조회
  const { data: existingStudents } = await supabase
    .from('students')
    .select('id, name, birth_date');

  const studentIdByKey = new Map<string, string>();
  existingStudents?.forEach(s => {
    const key = `${s.name}-${s.birth_date}`;
    studentIdByKey.set(key, s.id);
  });

  // 기존 반 정보 조회
  const { data: existingClasses } = await supabase
    .from('classes')
    .select('id, title');

  const classIdByTitle = new Map<string, string>();
  existingClasses?.forEach(c => {
    classIdByTitle.set(c.title, c.id);
  });

  // 기존 수강 정보 조회 (학생-구성 관계)
  const { data: existingEnrollments } = await supabase
    .from('relations_compositions_students')
    .select(`
      student_id,
      composition_id,
      status,
      class_compositions(
        id,
        class_id,
        day_of_week,
        start_time,
        end_time,
        type
      )
    `)
    .eq('status', 'active');

  console.log(`[analyzeEnrollments] 기존 수강 정보 ${existingEnrollments?.length || 0}개 발견`);

  const enrollments: EnrollmentPreview[] = [];

  for (const data of parsedData) {
    // 학생 ID 찾기
    const studentKey = `${data.name}-${data.birthDate}`;
    const studentId = studentIdByKey.get(studentKey);

    // 반 ID 찾기
    const classId = classIdByTitle.get(data.classInfo.fullClassName);

    let exists = false;

    // 학생과 반이 모두 존재하는 경우에만 기존 수강 정보 확인
    if (studentId && classId && existingEnrollments) {
      // 시간 정규화 함수
      const normalizeTime = (time: string) => time.substring(0, 5); // HH:MM:SS → HH:MM

      // 모든 스케줄이 기존 수강 정보에 있는지 확인
      const allSchedulesExist = data.classInfo.schedules.every(schedule => {
        return existingEnrollments.some(enroll => {
          const comp = enroll.class_compositions as any;
          return (
            enroll.student_id === studentId &&
            comp.class_id === classId &&
            comp.day_of_week === schedule.dayOfWeek &&
            normalizeTime(comp.start_time) === schedule.startTime &&
            normalizeTime(comp.end_time) === schedule.endTime &&
            comp.type === schedule.type
          );
        });
      });

      exists = allSchedulesExist && data.classInfo.schedules.length > 0;
    }

    console.log(`[analyzeEnrollments] 학생 ${data.name} - ${data.classInfo.fullClassName}: ${exists ? '기존 수강' : '신규 수강'}`);

    enrollments.push({
      studentName: data.name,
      fullClassName: data.classInfo.fullClassName,
      schedules: data.classInfo.schedules.map(s => ({
        dayOfWeek: s.dayOfWeek,
        startTime: s.startTime,
        endTime: s.endTime,
        type: s.type,
      })),
      exists,
    });
  }

  console.log(`[analyzeEnrollments] 총 ${enrollments.length}개 수강 정보 분석 완료 (신규: ${enrollments.filter(e => !e.exists).length}개)`);
  return enrollments;
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

  // 반/수업/수강 정보 분석
  console.log('[compareWithDatabase] 반/수업/수강 정보 분석 시작');
  const classes = await analyzeClasses(supabase, parsedData);
  const compositions = await analyzeCompositions(supabase, parsedData);
  const enrollments = await analyzeEnrollments(supabase, parsedData);

  return {
    newStudents,
    updatedStudents,
    withdrawnStudents,
    totalChanges: newStudents.length + updatedStudents.length + withdrawnStudents.length,
    classes,
    compositions,
    enrollments,
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
 * 과목명으로 subject 찾기 또는 생성
 */
async function findOrCreateSubject(
  supabase: SupabaseClient<Database>,
  subjectName: string
): Promise<string> {
  // 먼저 존재하는 과목 찾기
  const { data: existing, error: findError } = await supabase
    .from('subjects')
    .select('id')
    .eq('subject_name', subjectName)
    .single();

  if (existing) {
    return existing.id;
  }

  // 없으면 생성
  const { data: newSubject, error: createError } = await supabase
    .from('subjects')
    .insert({ subject_name: subjectName })
    .select('id')
    .single();

  if (createError || !newSubject) {
    throw new Error(`과목 생성 실패 (${subjectName}): ${createError?.message}`);
  }

  return newSubject.id;
}

/**
 * 반명과 과목으로 class 찾기 또는 생성
 */
async function findOrCreateClass(
  supabase: SupabaseClient<Database>,
  classInfo: ParsedClassInfo,
  subjectId: string
): Promise<string> {
  // 먼저 존재하는 반 찾기 (title로 검색)
  const { data: existing, error: findError } = await supabase
    .from('classes')
    .select('id')
    .eq('title', classInfo.fullClassName)
    .eq('subject_id', subjectId)
    .single();

  if (existing) {
    return existing.id;
  }

  // 없으면 생성
  const { data: newClass, error: createError } = await supabase
    .from('classes')
    .insert({
      title: classInfo.fullClassName,
      subject_id: subjectId,
      color: '#3b82f6', // 기본 색상
      course_type: 'regular', // 기본 수업 타입 (정규)
      split_type: classInfo.splitType, // single 또는 split
    })
    .select('id')
    .single();

  if (createError || !newClass) {
    throw new Error(`반 생성 실패 (${classInfo.fullClassName}): ${createError?.message}`);
  }

  console.log(`[findOrCreateClass] Created class ${classInfo.fullClassName} with split_type: ${classInfo.splitType}`);
  return newClass.id;
}

/**
 * class_id와 schedule 정보로 composition 찾기 또는 생성
 */
async function findOrCreateComposition(
  supabase: SupabaseClient<Database>,
  classId: string,
  dayOfWeek: number,
  startTime: string,
  endTime: string,
  type: 'class' | 'clinic'
): Promise<string> {
  // 시간을 HH:MM:SS 형식으로 정규화
  const formatTime = (time: string) => {
    if (time.length === 5) {
      // HH:MM 형식
      return `${time}:00`;
    }
    return time; // 이미 HH:MM:SS 형식
  };

  const formattedStartTime = formatTime(startTime);
  const formattedEndTime = formatTime(endTime);

  // 먼저 존재하는 구성 찾기
  const { data: existing, error: findError } = await supabase
    .from('class_compositions')
    .select('id')
    .eq('class_id', classId)
    .eq('day_of_week', dayOfWeek)
    .eq('start_time', formattedStartTime)
    .eq('end_time', formattedEndTime)
    .eq('type', type)
    .single();

  if (existing) {
    return existing.id;
  }

  // 없으면 생성
  const { data: newComposition, error: createError } = await supabase
    .from('class_compositions')
    .insert({
      class_id: classId,
      day_of_week: dayOfWeek,
      start_time: formattedStartTime,
      end_time: formattedEndTime,
      type: type,
    })
    .select('id')
    .single();

  if (createError || !newComposition) {
    throw new Error(`수업 구성 생성 실패: ${createError?.message}`);
  }

  return newComposition.id;
}

/**
 * 학생의 수업 수강 정보 업데이트
 */
async function updateStudentEnrollments(
  supabase: SupabaseClient<Database>,
  studentId: string,
  classId: string,
  compositionIds: string[]
): Promise<void> {
  // 1. 먼저 기존 수강 정보 확인
  const { data: existingClassRelation } = await supabase
    .from('relations_classes_students')
    .select('id')
    .eq('student_id', studentId)
    .eq('class_id', classId)
    .single();

  // 2. relations_classes_students에 없으면 추가
  if (!existingClassRelation) {
    const { error: classRelationError } = await supabase
      .from('relations_classes_students')
      .insert({
        student_id: studentId,
        class_id: classId,
        status: 'active',
        enrolled_date: new Date().toISOString().split('T')[0],
      });

    if (classRelationError) {
      throw new Error(`학생-반 관계 생성 실패: ${classRelationError.message}`);
    }
  }

  // 3. 각 composition에 대해 relations_compositions_students 업데이트
  for (const compositionId of compositionIds) {
    const { data: existingCompositionRelation } = await supabase
      .from('relations_compositions_students')
      .select('id')
      .eq('student_id', studentId)
      .eq('composition_id', compositionId)
      .single();

    if (!existingCompositionRelation) {
      const { error: compositionRelationError } = await supabase
        .from('relations_compositions_students')
        .insert({
          student_id: studentId,
          class_id: classId,
          composition_id: compositionId,
          status: 'active',
          enrolled_date: new Date().toISOString().split('T')[0],
        });

      if (compositionRelationError) {
        throw new Error(`학생-구성 관계 생성 실패: ${compositionRelationError.message}`);
      }
    }
  }
}

/**
 * 학생의 기존 수강 정보 모두 삭제 (status를 withdrawn으로 변경)
 */
async function withdrawStudentFromAllClasses(
  supabase: SupabaseClient<Database>,
  studentId: string
): Promise<void> {
  // relations_classes_students status 업데이트
  await supabase
    .from('relations_classes_students')
    .update({ status: 'withdrawn' })
    .eq('student_id', studentId)
    .eq('status', 'active');

  // relations_compositions_students status 업데이트
  await supabase
    .from('relations_compositions_students')
    .update({ status: 'withdrawn' })
    .eq('student_id', studentId)
    .eq('status', 'active');
}

/**
 * 1단계: 학생 정보만 적용 (수강 정보 제외)
 */
export async function applyStudentsOnly(
  supabase: SupabaseClient<Database>,
  preview: RenewalPreview
): Promise<void> {
  console.log('[applyStudentsOnly] ========== 1단계: 학생 정보 적용 시작 (최적화) ==========');

  // 학교 데이터 캐싱 (1회 쿼리)
  const schoolMap = await getAllSchoolsMap(supabase);

  // 1. 새 학생 배치 추가 (1번 쿼리)
  console.log(`[applyStudentsOnly] 새 학생 ${preview.newStudents.length}명 배치 추가 중...`);
  if (preview.newStudents.length > 0) {
    const newStudentsToInsert = preview.newStudents
      .filter(s => s.newData)
      .map(student => {
        const school = findSchoolFromCache(student.newData!.schoolName, schoolMap);
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

    if (newStudentsToInsert.length > 0) {
      const { error: studentError } = await supabase
        .from('students')
        .insert(newStudentsToInsert);

      if (studentError) {
        console.error(`[applyStudentsOnly] 학생 배치 추가 실패:`, studentError);
        throw new Error(`학생 배치 추가 실패: ${studentError.message}`);
      }
      console.log(`[applyStudentsOnly] ✓ ${newStudentsToInsert.length}명 추가 완료`);
    }
  }

  // 2. 기존 학생 업데이트 (개별 처리 - 각 학생마다 다른 값으로 업데이트)
  console.log(`[applyStudentsOnly] 기존 학생 ${preview.updatedStudents.length}명 업데이트 중...`);
  for (const student of preview.updatedStudents) {
    if (!student.id || !student.newData) continue;

    const school = findSchoolFromCache(student.newData.schoolName, schoolMap);

    const { error: updateError } = await supabase
      .from('students')
      .update({
        class_name: student.newData.className,
        school_id: school?.id || null,
        grade: student.newData.grade,
        phone: student.newData.phone,
        gender: student.newData.gender,
      })
      .eq('id', student.id);

    if (updateError) {
      console.error(`[applyStudentsOnly] 학생 업데이트 실패 (${student.name}):`, updateError);
      throw new Error(`학생 업데이트 실패 (${student.name}): ${updateError.message}`);
    }
  }
  if (preview.updatedStudents.length > 0) {
    console.log(`[applyStudentsOnly] ✓ ${preview.updatedStudents.length}명 업데이트 완료`);
  }

  // 3. 퇴원 학생 배치 처리 (1번 쿼리)
  console.log(`[applyStudentsOnly] 퇴원 학생 ${preview.withdrawnStudents.length}명 처리 중...`);
  if (preview.withdrawnStudents.length > 0) {
    const withdrawnIds = preview.withdrawnStudents
      .filter(s => s.id)
      .map(s => s.id!);

    if (withdrawnIds.length > 0) {
      const { error: withdrawError } = await supabase
        .from('students')
        .update({ enrollment_status: 'withdrawn' as const })
        .in('id', withdrawnIds);

      if (withdrawError) {
        console.error(`[applyStudentsOnly] 퇴원 배치 처리 실패:`, withdrawError);
        throw new Error(`퇴원 배치 처리 실패: ${withdrawError.message}`);
      }
      console.log(`[applyStudentsOnly] ✓ ${withdrawnIds.length}명 퇴원 처리 완료`);
    }
  }

  console.log('[applyStudentsOnly] ========== 1단계 완료 (최적화) ==========');
}

/**
 * 2단계: 반 생성
 */
export async function applyClasses(
  supabase: SupabaseClient<Database>,
  preview: RenewalPreview
): Promise<void> {
  console.log('[applyClasses] ========== 2단계: 반 생성 시작 ==========');
  console.log(`[applyClasses] 총 ${preview.classes.length}개 반 처리 중...`);

  for (const classPreview of preview.classes) {
    if (classPreview.exists) {
      console.log(`[applyClasses] ⊙ ${classPreview.fullClassName}: 이미 존재함 (건너뜀)`);
      continue;
    }

    console.log(`[applyClasses] 반 생성 중: ${classPreview.fullClassName}`);

    // 과목 찾기/생성
    const subjectId = await findOrCreateSubject(supabase, classPreview.subjectName);
    console.log(`[applyClasses] - 과목 ID: ${subjectId}`);

    // 반 생성
    const { data: newClass, error } = await supabase
      .from('classes')
      .insert({
        title: classPreview.fullClassName,
        subject_id: subjectId,
        color: '#3b82f6',
        course_type: classPreview.courseType,
        split_type: classPreview.splitType,
      })
      .select('id')
      .single();

    if (error || !newClass) {
      console.error(`[applyClasses] 반 생성 실패 (${classPreview.fullClassName}):`, error);
      throw new Error(`반 생성 실패 (${classPreview.fullClassName}): ${error?.message}`);
    }

    console.log(`[applyClasses] ✓ ${classPreview.fullClassName} 생성 완료 (ID: ${newClass.id}, split_type: ${classPreview.splitType})`);
  }

  console.log('[applyClasses] ========== 2단계 완료 ==========');
}

/**
 * 3단계: 수업 구성 생성
 */
export async function applyCompositions(
  supabase: SupabaseClient<Database>,
  preview: RenewalPreview
): Promise<void> {
  console.log('[applyCompositions] ========== 3단계: 수업 구성 생성 시작 (최적화) ==========');
  console.log(`[applyCompositions] 총 ${preview.compositions.length}개 구성 처리 중...`);

  // 반 ID 매핑 생성
  const { data: classes } = await supabase
    .from('classes')
    .select('id, title');

  const classIdByTitle = new Map<string, string>();
  classes?.forEach(c => {
    classIdByTitle.set(c.title, c.id);
  });

  // 배치 삽입을 위한 데이터 준비
  const compositionsToInsert: Array<{
    class_id: string;
    day_of_week: number;
    start_time: string;
    end_time: string;
    type: string;
  }> = [];

  for (const compPreview of preview.compositions) {
    if (compPreview.exists) {
      console.log(`[applyCompositions] ⊙ ${compPreview.fullClassName} ${compPreview.type} (${compPreview.dayOfWeek}요일): 이미 존재함 (건너뜀)`);
      continue;
    }

    const classId = classIdByTitle.get(compPreview.fullClassName);
    if (!classId) {
      console.warn(`[applyCompositions] ⚠ ${compPreview.fullClassName}: 반을 찾을 수 없음 (건너뜀)`);
      continue;
    }

    compositionsToInsert.push({
      class_id: classId,
      day_of_week: compPreview.dayOfWeek,
      start_time: compPreview.startTime,
      end_time: compPreview.endTime,
      type: compPreview.type,
    });
  }

  // 배치 삽입 (1번 쿼리)
  if (compositionsToInsert.length > 0) {
    console.log(`[applyCompositions] ${compositionsToInsert.length}개 구성 배치 생성 중...`);
    const { error } = await supabase
      .from('class_compositions')
      .insert(compositionsToInsert);

    if (error) {
      console.error(`[applyCompositions] 구성 배치 생성 실패:`, error);
      throw new Error(`구성 배치 생성 실패: ${error.message}`);
    }
    console.log(`[applyCompositions] ✓ ${compositionsToInsert.length}개 구성 생성 완료`);
  }

  console.log('[applyCompositions] ========== 3단계 완료 (최적화) ==========');
}

/**
 * 4단계: 수강 정보 생성
 */
export async function applyEnrollments(
  supabase: SupabaseClient<Database>,
  preview: RenewalPreview
): Promise<void> {
  console.log('[applyEnrollments] ========== 4단계: 수강 정보 생성 시작 (최적화) ==========');
  console.log(`[applyEnrollments] 총 ${preview.enrollments.length}개 수강 정보 처리 중...`);

  // 1. 학생 ID 매핑
  const { data: students } = await supabase
    .from('students')
    .select('id, name, birth_date')
    .eq('enrollment_status', 'active');

  const studentIdByName = new Map<string, string>();
  students?.forEach(s => {
    studentIdByName.set(s.name, s.id);
  });

  const studentIds = Array.from(studentIdByName.values());
  console.log(`[applyEnrollments] 활성 학생 ${studentIds.length}명`);

  // 2. 반 ID 매핑
  const { data: classes } = await supabase
    .from('classes')
    .select('id, title');

  const classIdByTitle = new Map<string, string>();
  classes?.forEach(c => {
    classIdByTitle.set(c.title, c.id);
  });

  // 3. 모든 class_compositions 미리 조회 (1번 쿼리)
  console.log('[applyEnrollments] 모든 수업 구성 조회 중...');
  const { data: allCompositions } = await supabase
    .from('class_compositions')
    .select('id, class_id, day_of_week, start_time, end_time, type');

  // class_id별로 compositions 그룹화
  const compositionsByClassId = new Map<string, typeof allCompositions>();
  allCompositions?.forEach(comp => {
    if (!compositionsByClassId.has(comp.class_id)) {
      compositionsByClassId.set(comp.class_id, []);
    }
    compositionsByClassId.get(comp.class_id)!.push(comp);
  });
  console.log(`[applyEnrollments] ✓ ${allCompositions?.length || 0}개 구성 조회 완료`);

  // 4. 기존 수강 정보 일괄 withdrawn 처리 (2번 쿼리)
  console.log('[applyEnrollments] 기존 수강 정보 일괄 정리 중...');
  if (studentIds.length > 0) {
    await supabase
      .from('relations_classes_students')
      .update({ status: 'withdrawn' })
      .in('student_id', studentIds)
      .eq('status', 'active');

    await supabase
      .from('relations_compositions_students')
      .update({ status: 'withdrawn' })
      .in('student_id', studentIds)
      .eq('status', 'active');
  }
  console.log('[applyEnrollments] ✓ 기존 수강 정보 정리 완료');

  // 5. 새로운 수강 정보 배치 생성
  const classRelationsToInsert: Array<{
    student_id: string;
    class_id: string;
    status: string;
    enrolled_date: string;
  }> = [];

  const compositionRelationsToInsert: Array<{
    student_id: string;
    class_id: string;
    composition_id: string;
    status: string;
    enrolled_date: string;
  }> = [];

  const enrolledDate = new Date().toISOString().split('T')[0];
  const normalizeTime = (time: string) => time.substring(0, 5); // HH:MM:SS → HH:MM

  for (const enrollment of preview.enrollments) {
    const studentId = studentIdByName.get(enrollment.studentName);
    const classId = classIdByTitle.get(enrollment.fullClassName);

    if (!studentId) {
      console.warn(`[applyEnrollments] ⚠ 학생 ${enrollment.studentName}을(를) 찾을 수 없음 (건너뜀)`);
      continue;
    }

    if (!classId) {
      console.warn(`[applyEnrollments] ⚠ 반 ${enrollment.fullClassName}을(를) 찾을 수 없음 (건너뜀)`);
      continue;
    }

    // class relation 추가
    classRelationsToInsert.push({
      student_id: studentId,
      class_id: classId,
      status: 'active',
      enrolled_date: enrolledDate,
    });

    // 캐싱된 compositions에서 찾기
    const compositions = compositionsByClassId.get(classId) || [];

    for (const schedule of enrollment.schedules) {
      const matchingComp = compositions.find(c =>
        c.day_of_week === schedule.dayOfWeek &&
        normalizeTime(c.start_time) === schedule.startTime &&
        normalizeTime(c.end_time) === schedule.endTime &&
        c.type === schedule.type
      );

      if (matchingComp) {
        compositionRelationsToInsert.push({
          student_id: studentId,
          class_id: classId,
          composition_id: matchingComp.id,
          status: 'active',
          enrolled_date: enrolledDate,
        });
      } else {
        console.warn(`[applyEnrollments] ⚠ 구성을 찾을 수 없음: ${enrollment.studentName} - ${schedule.type} (${schedule.dayOfWeek}요일 ${schedule.startTime})`);
      }
    }
  }

  // 6. 배치 삽입 (2번 쿼리)
  console.log(`[applyEnrollments] 배치 삽입 중: ${classRelationsToInsert.length}개 반 등록, ${compositionRelationsToInsert.length}개 구성 등록...`);

  if (classRelationsToInsert.length > 0) {
    const { error: classError } = await supabase
      .from('relations_classes_students')
      .insert(classRelationsToInsert);

    if (classError) {
      console.error('[applyEnrollments] 반 등록 실패:', classError);
      throw new Error(`반 등록 실패: ${classError.message}`);
    }
    console.log(`[applyEnrollments] ✓ ${classRelationsToInsert.length}개 반 등록 완료`);
  }

  if (compositionRelationsToInsert.length > 0) {
    const { error: compError } = await supabase
      .from('relations_compositions_students')
      .insert(compositionRelationsToInsert);

    if (compError) {
      console.error('[applyEnrollments] 구성 등록 실패:', compError);
      throw new Error(`구성 등록 실패: ${compError.message}`);
    }
    console.log(`[applyEnrollments] ✓ ${compositionRelationsToInsert.length}개 구성 등록 완료`);
  }

  console.log('[applyEnrollments] ========== 4단계 완료 (최적화) ==========');
  console.log(`[applyEnrollments] 총 ${preview.enrollments.length}명 학생 등록 완료`);
}

/**
 * [기존 함수] 변경사항을 DB에 적용 (트랜잭션 방식) - 한 번에 모두 처리
 * 이제는 단계별 함수를 사용하는 것을 권장
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

  // 1. 새 학생 추가 및 수강 정보 등록
  for (const student of preview.newStudents) {
    if (!student.newData) continue;

    console.log('[applyChanges] Processing new student:', student.newData.name, 'School:', student.newData.schoolName);
    const school = findSchoolFromCache(student.newData.schoolName, schoolMap);
    console.log('[applyChanges] Matched school_id:', school?.id || 'null');

    // 학생 추가
    const { data: newStudent, error: studentError } = await supabase
      .from('students')
      .insert({
        name: student.newData.name,
        class_name: student.newData.className,
        school_id: school?.id || null,
        grade: student.newData.grade,
        phone: student.newData.phone,
        birth_date: student.newData.birthDate,
        gender: student.newData.gender,
        enrollment_status: 'active' as const,
      })
      .select('id')
      .single();

    if (studentError || !newStudent) {
      throw new Error(`학생 추가 실패 (${student.newData.name}): ${studentError?.message}`);
    }

    // 수강 정보 등록
    try {
      const classInfo = student.newData.classInfo;
      const subjectId = await findOrCreateSubject(supabase, classInfo.subjectName);
      const classId = await findOrCreateClass(supabase, classInfo, subjectId);

      // 각 스케줄에 대해 composition 생성 및 수강 정보 등록
      const compositionIds: string[] = [];
      for (const schedule of classInfo.schedules) {
        const compositionId = await findOrCreateComposition(
          supabase,
          classId,
          schedule.dayOfWeek,
          schedule.startTime,
          schedule.endTime,
          schedule.type
        );
        compositionIds.push(compositionId);
      }

      await updateStudentEnrollments(supabase, newStudent.id, classId, compositionIds);
      console.log(`[applyChanges] Enrolled student ${student.newData.name} in class ${classInfo.fullClassName}`);
    } catch (error) {
      console.error(`[applyChanges] Failed to enroll student ${student.newData.name}:`, error);
      // 수강 정보 등록 실패 시 경고만 출력하고 계속 진행
    }
  }

  // 2. 기존 학생 업데이트 및 수강 정보 갱신
  for (const student of preview.updatedStudents) {
    if (!student.id || !student.newData) continue;

    console.log('[applyChanges] Processing updated student:', student.name, 'School:', student.newData.schoolName);
    const school = findSchoolFromCache(student.newData.schoolName, schoolMap);
    console.log('[applyChanges] Matched school_id:', school?.id || 'null');

    // 학생 정보 업데이트
    const { error: updateError } = await supabase
      .from('students')
      .update({
        class_name: student.newData.className,
        school_id: school?.id || null,
        grade: student.newData.grade,
        phone: student.newData.phone,
        gender: student.newData.gender,
      })
      .eq('id', student.id);

    if (updateError) {
      throw new Error(`학생 업데이트 실패 (${student.name}): ${updateError.message}`);
    }

    // 기존 수강 정보 삭제 (status를 withdrawn으로)
    await withdrawStudentFromAllClasses(supabase, student.id);

    // 새로운 수강 정보 등록
    try {
      const classInfo = student.newData.classInfo;
      const subjectId = await findOrCreateSubject(supabase, classInfo.subjectName);
      const classId = await findOrCreateClass(supabase, classInfo, subjectId);

      // 각 스케줄에 대해 composition 생성 및 수강 정보 등록
      const compositionIds: string[] = [];
      for (const schedule of classInfo.schedules) {
        const compositionId = await findOrCreateComposition(
          supabase,
          classId,
          schedule.dayOfWeek,
          schedule.startTime,
          schedule.endTime,
          schedule.type
        );
        compositionIds.push(compositionId);
      }

      await updateStudentEnrollments(supabase, student.id, classId, compositionIds);
      console.log(`[applyChanges] Updated enrollment for student ${student.name} in class ${classInfo.fullClassName}`);
    } catch (error) {
      console.error(`[applyChanges] Failed to update enrollment for student ${student.name}:`, error);
      // 수강 정보 갱신 실패 시 경고만 출력하고 계속 진행
    }
  }

  // 3. 퇴원 학생 처리
  for (const student of preview.withdrawnStudents) {
    if (!student.id) continue;

    // 학생 상태를 withdrawn으로 변경
    const { error: withdrawError } = await supabase
      .from('students')
      .update({ enrollment_status: 'withdrawn' as const })
      .eq('id', student.id);

    if (withdrawError) {
      throw new Error(`학생 퇴원 처리 실패 (${student.name}): ${withdrawError.message}`);
    }

    // 수강 정보도 모두 withdrawn으로 변경
    await withdrawStudentFromAllClasses(supabase, student.id);
    console.log(`[applyChanges] Withdrew student ${student.name}`);
  }

  console.log('[applyChanges] All changes applied successfully');
}
