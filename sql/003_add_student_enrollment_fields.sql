-- 학생 정보 갱신 기능을 위한 컬럼 추가
-- 추가되는 컬럼: 반명, 학교 외래키, 생년월일, 성별, 재원 여부

-- 1. 재원 여부 컬럼 추가
ALTER TABLE students
ADD COLUMN IF NOT EXISTS enrollment_status VARCHAR(20) DEFAULT 'active' CHECK (enrollment_status IN ('active', 'withdrawn'));

-- 2. 반명 컬럼 추가
ALTER TABLE students
ADD COLUMN IF NOT EXISTS class_name VARCHAR(100);

-- 3. 학교 외래키 컬럼 추가 (schools 테이블 참조)
ALTER TABLE students
ADD COLUMN IF NOT EXISTS school_id UUID REFERENCES schools(id) ON DELETE SET NULL;

-- 4. 생년월일 컬럼 추가
ALTER TABLE students
ADD COLUMN IF NOT EXISTS birth_date DATE;

-- 5. 성별 컬럼 추가
ALTER TABLE students
ADD COLUMN IF NOT EXISTS gender VARCHAR(10) CHECK (gender IN ('male', 'female'));

-- 인덱스 추가 (검색 성능 향상)
CREATE INDEX IF NOT EXISTS idx_students_enrollment_status ON students(enrollment_status);
CREATE INDEX IF NOT EXISTS idx_students_school_id ON students(school_id);
CREATE INDEX IF NOT EXISTS idx_students_birth_date ON students(birth_date);
CREATE INDEX IF NOT EXISTS idx_students_name_birth ON students(name, birth_date);

-- 코멘트 추가
COMMENT ON COLUMN students.enrollment_status IS '재원 여부: active(재원중), withdrawn(퇴원)';
COMMENT ON COLUMN students.class_name IS '학생이 소속된 반명';
COMMENT ON COLUMN students.school_id IS '학생이 재학중인 학교 (schools 테이블 참조)';
COMMENT ON COLUMN students.birth_date IS '학생 생년월일';
COMMENT ON COLUMN students.gender IS '성별: male(남), female(여)';
