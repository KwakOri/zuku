-- Migration: Create student_compositions table
-- 학생이 수업의 어떤 구성(composition)을 선택했는지 관리하는 테이블

-- Step 1: student_compositions 테이블 생성
CREATE TABLE IF NOT EXISTS student_compositions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_student_id UUID NOT NULL REFERENCES class_students(id) ON DELETE CASCADE,
  composition_id UUID NOT NULL REFERENCES class_composition(id) ON DELETE CASCADE,
  enrolled_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- 같은 class_student에 같은 composition을 중복 등록 방지
  CONSTRAINT student_compositions_unique_enrollment
    UNIQUE (class_student_id, composition_id, status)
);

-- Step 2: 인덱스 생성 (조회 성능 향상)
CREATE INDEX idx_student_compositions_class_student
  ON student_compositions(class_student_id);

CREATE INDEX idx_student_compositions_composition
  ON student_compositions(composition_id);

CREATE INDEX idx_student_compositions_status
  ON student_compositions(status);

-- Step 3: updated_at 자동 업데이트 트리거
CREATE OR REPLACE FUNCTION update_student_compositions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_student_compositions_updated_at
  BEFORE UPDATE ON student_compositions
  FOR EACH ROW
  EXECUTE FUNCTION update_student_compositions_updated_at();

-- Step 4: class_students 테이블에서 composition_id 컬럼 제거
-- (기존 데이터가 있다면 먼저 마이그레이션 필요)
ALTER TABLE class_students
DROP COLUMN IF EXISTS composition_id;

-- Step 5: class_students의 기존 unique constraint 복원
-- (학생은 같은 수업에 한 번만 등록, 구성은 student_compositions에서 관리)
ALTER TABLE class_students
DROP CONSTRAINT IF EXISTS class_students_class_id_student_id_key;

CREATE UNIQUE INDEX class_students_unique_enrollment
  ON class_students (class_id, student_id, status)
  WHERE status = 'active';

-- Step 6: RLS (Row Level Security) 정책 설정 (옵션)
ALTER TABLE student_compositions ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 조회 가능
CREATE POLICY "Anyone can view student compositions"
  ON student_compositions FOR SELECT
  USING (true);

-- 인증된 사용자만 삽입 가능
CREATE POLICY "Authenticated users can insert student compositions"
  ON student_compositions FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- 인증된 사용자만 수정 가능
CREATE POLICY "Authenticated users can update student compositions"
  ON student_compositions FOR UPDATE
  USING (auth.role() = 'authenticated');

-- 인증된 사용자만 삭제 가능
CREATE POLICY "Authenticated users can delete student compositions"
  ON student_compositions FOR DELETE
  USING (auth.role() = 'authenticated');

-- Step 7: 기존 데이터 마이그레이션 (만약 class_students에 composition_id 데이터가 있다면)
-- 주의: 이 부분은 실제 데이터 상황에 맞게 조정 필요
/*
INSERT INTO student_compositions (class_student_id, composition_id, enrolled_date, status)
SELECT
  id as class_student_id,
  composition_id,
  enrolled_date,
  status
FROM class_students
WHERE composition_id IS NOT NULL;
*/

-- 완료 메시지
COMMENT ON TABLE student_compositions IS '학생이 선택한 수업 구성(시간대) 정보를 저장하는 테이블';
COMMENT ON COLUMN student_compositions.class_student_id IS 'class_students 테이블 참조';
COMMENT ON COLUMN student_compositions.composition_id IS 'class_composition 테이블 참조 (앞타임/뒤타임 등)';
COMMENT ON COLUMN student_compositions.enrolled_date IS '해당 구성에 등록한 날짜';
COMMENT ON COLUMN student_compositions.status IS 'active: 활성, inactive: 비활성';
