-- 기존 데이터를 새로운 스키마로 마이그레이션하는 SQL
-- 주요 변경사항:
-- 1. students.id: number -> UUID
-- 2. middle_school_records -> homework_records_middle
-- 3. high_school_homework_records -> homework_records_high
-- 4. 모든 테이블 ID가 UUID로 변경

-- 임시 테이블 생성 (기존 데이터 백업)
CREATE TABLE IF NOT EXISTS students_backup AS SELECT * FROM students;
CREATE TABLE IF NOT EXISTS middle_school_records_backup AS SELECT * FROM middle_school_records;
CREATE TABLE IF NOT EXISTS high_school_homework_records_backup AS SELECT * FROM high_school_homework_records;

-- ID 매핑 테이블 생성 (기존 number ID -> 새 UUID 매핑)
CREATE TABLE id_mapping_students (
    old_id INTEGER PRIMARY KEY,
    new_id UUID NOT NULL UNIQUE
);

-- 기존 students의 number ID를 UUID로 매핑 생성
INSERT INTO id_mapping_students (old_id, new_id)
SELECT id, uuid_generate_v4() FROM students_backup;

-- 기존 테이블 삭제 (외래키 제약 조건 때문에 순서 중요)
DROP TABLE IF EXISTS homework_records_high CASCADE;
DROP TABLE IF EXISTS homework_records_middle CASCADE;
DROP TABLE IF EXISTS high_school_homework_records CASCADE;
DROP TABLE IF EXISTS middle_school_records CASCADE;
DROP TABLE IF EXISTS student_schedules CASCADE;
DROP TABLE IF EXISTS class_students CASCADE;
DROP TABLE IF EXISTS students CASCADE;

-- 새 스키마로 테이블 재생성 (01_schema.sql 실행 필요)

-- 학생 데이터 마이그레이션
INSERT INTO students (id, name, grade, phone, parent_phone, email, created_at, updated_at)
SELECT
    m.new_id,
    s.name,
    s.grade,
    s.phone,
    s.parent_phone,
    s.email,
    NOW(),
    NOW()
FROM students_backup s
JOIN id_mapping_students m ON s.id = m.old_id;

-- 중등 기록 데이터 마이그레이션 (테이블명 변경: middle_school_records -> homework_records_middle)
INSERT INTO homework_records_middle (
    id, student_id, teacher_id, class_id, week_of, attendance,
    participation, understanding, homework, notes, created_date,
    last_modified, created_at, updated_at
)
SELECT
    uuid_generate_v4(),
    m.new_id,
    mr.teacher_id,
    mr.class_id,
    mr.week_of,
    mr.attendance,
    mr.participation,
    mr.understanding,
    mr.homework,
    mr.notes,
    mr.created_date,
    mr.last_modified,
    NOW(),
    NOW()
FROM middle_school_records_backup mr
JOIN id_mapping_students m ON mr.student_id = m.old_id;

-- 고등 기록 데이터 마이그레이션 (테이블명 변경: high_school_homework_records -> homework_records_high)
INSERT INTO homework_records_high (
    id, student_id, assistant_id, class_id, date, homework_range,
    achievement, completion_rate, accuracy, notes, created_date,
    created_at, updated_at
)
SELECT
    uuid_generate_v4(),
    m.new_id,
    hr.assistant_id,
    hr.class_id,
    hr.date,
    hr.homework_range,
    hr.achievement,
    hr.completion_rate,
    hr.accuracy,
    hr.notes,
    hr.created_date,
    NOW(),
    NOW()
FROM high_school_homework_records_backup hr
JOIN id_mapping_students m ON hr.student_id = m.old_id;

-- class_students 테이블 마이그레이션 (student_id를 UUID로 변경)
-- 주의: 기존 class_students 테이블이 있다면 해당 데이터도 마이그레이션 필요
/*
INSERT INTO class_students (id, class_id, student_id, enrolled_date, status, created_at, updated_at)
SELECT
    uuid_generate_v4(),
    cs.class_id,
    m.new_id,
    cs.enrolled_date,
    cs.status,
    NOW(),
    NOW()
FROM class_students_backup cs
JOIN id_mapping_students m ON cs.student_id = m.old_id;
*/

-- student_schedules 테이블 마이그레이션 (student_id를 UUID로 변경)
-- 주의: 기존 student_schedules 테이블이 있다면 해당 데이터도 마이그레이션 필요
/*
INSERT INTO student_schedules (
    id, student_id, title, description, start_time, end_time,
    day_of_week, color, type, location, recurring, rrule,
    status, created_date, created_at, updated_at
)
SELECT
    uuid_generate_v4(),
    m.new_id,
    ss.title,
    ss.description,
    ss.start_time,
    ss.end_time,
    ss.day_of_week,
    ss.color,
    ss.type,
    ss.location,
    ss.recurring,
    ss.rrule,
    ss.status,
    ss.created_date,
    NOW(),
    NOW()
FROM student_schedules_backup ss
JOIN id_mapping_students m ON ss.student_id = m.old_id;
*/

-- 임시 테이블 정리 (마이그레이션 완료 후)
-- DROP TABLE students_backup;
-- DROP TABLE middle_school_records_backup;
-- DROP TABLE high_school_homework_records_backup;
-- DROP TABLE id_mapping_students;

-- 마이그레이션 검증 쿼리
SELECT 'students' as table_name, COUNT(*) as migrated_count FROM students
UNION ALL
SELECT 'homework_records_middle' as table_name, COUNT(*) as migrated_count FROM homework_records_middle
UNION ALL
SELECT 'homework_records_high' as table_name, COUNT(*) as migrated_count FROM homework_records_high;