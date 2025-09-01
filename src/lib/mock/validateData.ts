import { classes } from './classes';
import { classStudents } from './classStudents';
import { students } from './students';
import { teachers } from './teachers';
import { classExceptions } from './classExceptions';
import { studentSchedules } from './studentSchedules';

/**
 * 데이터 무결성 검증 함수
 */
export function validateMockData() {
  const errors: string[] = [];
  const warnings: string[] = [];

  // 1. 기본 데이터 존재 여부 확인
  if (students.length === 0) errors.push("학생 데이터가 없습니다.");
  if (teachers.length === 0) errors.push("강사 데이터가 없습니다.");
  if (classes.length === 0) errors.push("수업 데이터가 없습니다.");

  // 2. 수업-강사 관계 검증
  for (const cls of classes) {
    const teacher = teachers.find(t => t.id === cls.teacherId);
    if (!teacher) {
      errors.push(`수업 ${cls.id}의 강사 ${cls.teacherId}를 찾을 수 없습니다.`);
    } else if (cls.teacherName !== teacher.name) {
      errors.push(`수업 ${cls.id}의 강사명이 일치하지 않습니다. (${cls.teacherName} vs ${teacher.name})`);
    }
  }

  // 3. 수업-학생 관계 검증
  for (const cs of classStudents) {
    const student = students.find(s => s.id === cs.studentId);
    const cls = classes.find(c => c.id === cs.classId);
    
    if (!student) {
      errors.push(`수강생 등록 ${cs.id}의 학생 ${cs.studentId}를 찾을 수 없습니다.`);
    }
    if (!cls) {
      errors.push(`수강생 등록 ${cs.id}의 수업 ${cs.classId}를 찾을 수 없습니다.`);
    }
  }

  // 4. 학생당 수업 수강 제한 검증 (1개만 수강 가능)
  const studentClassCount = new Map<number, number>();
  for (const cs of classStudents.filter(cs => cs.status === 'active')) {
    const count = studentClassCount.get(cs.studentId) || 0;
    studentClassCount.set(cs.studentId, count + 1);
  }
  
  for (const [studentId, count] of studentClassCount) {
    if (count > 1) {
      warnings.push(`학생 ${studentId}가 ${count}개의 수업을 수강하고 있습니다. (제한: 1개)`);
    }
  }

  // 5. 시간 충돌 검증 (수업 시간 vs 개인 일정)
  for (const cs of classStudents.filter(cs => cs.status === 'active')) {
    const student = students.find(s => s.id === cs.studentId);
    const cls = classes.find(c => c.id === cs.classId);
    
    if (!student || !cls) continue;
    
    const studentPersonalSchedules = studentSchedules.filter(
      s => s.studentId === cs.studentId && s.status === 'active'
    );
    
    for (const schedule of studentPersonalSchedules) {
      // 요일이 같은 경우 시간 겹침 확인
      if (schedule.dayOfWeek === cls.dayOfWeek) {
        const classStart = parseTime(cls.startTime);
        const classEnd = parseTime(cls.endTime);
        const scheduleStart = parseTime(schedule.startTime);
        const scheduleEnd = parseTime(schedule.endTime);
        
        // 시간 겹침 확인
        if (isTimeOverlap(classStart, classEnd, scheduleStart, scheduleEnd)) {
          errors.push(
            `학생 ${student.name}(${student.id})의 수업 시간과 개인 일정이 겹칩니다. ` +
            `수업: ${getDayName(cls.dayOfWeek)} ${cls.startTime}-${cls.endTime}, ` +
            `개인일정: ${getDayName(schedule.dayOfWeek)} ${schedule.startTime}-${schedule.endTime} (${schedule.title})`
          );
        }
      }
    }
  }

  // 6. 수업 예외 데이터 검증
  for (const exception of classExceptions) {
    const cls = classes.find(c => c.id === exception.classId);
    if (!cls) {
      errors.push(`예외 ${exception.id}의 수업 ${exception.classId}를 찾을 수 없습니다.`);
    }
    
    // 대체 강사 검증
    if (exception.substituteTeacherId) {
      const substitute = teachers.find(t => t.id === exception.substituteTeacherId);
      if (!substitute) {
        errors.push(`예외 ${exception.id}의 대체 강사 ${exception.substituteTeacherId}를 찾을 수 없습니다.`);
      }
    }
  }

  // 7. 수업 정원 검증
  for (const cls of classes) {
    const enrolledCount = classStudents.filter(
      cs => cs.classId === cls.id && cs.status === 'active'
    ).length;
    
    if (cls.maxStudents && enrolledCount > cls.maxStudents) {
      warnings.push(`수업 ${cls.title}의 등록 인원(${enrolledCount})이 정원(${cls.maxStudents})을 초과했습니다.`);
    }
  }

  return { errors, warnings };
}

// 헬퍼 함수들
function parseTime(timeStr: string): number {
  const [hour, minute] = timeStr.split(':').map(Number);
  return hour * 60 + minute;
}

function isTimeOverlap(start1: number, end1: number, start2: number, end2: number): boolean {
  return start1 < end2 && start2 < end1;
}

function getDayName(dayOfWeek: number): string {
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  return days[dayOfWeek];
}

// 실행 및 결과 출력
export function runValidation() {
  const { errors, warnings } = validateMockData();
  
  console.log('=== 데이터 검증 결과 ===');
  
  if (errors.length === 0) {
    console.log('✅ 데이터 무결성 검증 통과');
  } else {
    console.log(`❌ ${errors.length}개의 오류 발견:`);
    errors.forEach((error, i) => console.log(`  ${i + 1}. ${error}`));
  }
  
  if (warnings.length > 0) {
    console.log(`⚠️  ${warnings.length}개의 경고:`);
    warnings.forEach((warning, i) => console.log(`  ${i + 1}. ${warning}`));
  }
  
  return { errors, warnings };
}