-- 학생 정보 백업 테이블 생성
CREATE TABLE IF NOT EXISTS backup_students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  backup_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  backup_data JSONB NOT NULL,
  student_count INTEGER NOT NULL,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_backup_students_backup_date ON backup_students(backup_date);
CREATE INDEX IF NOT EXISTS idx_backup_students_created_by ON backup_students(created_by);

-- 코멘트 추가
COMMENT ON TABLE backup_students IS '학생 정보 갱신 전 백업 데이터';
COMMENT ON COLUMN backup_students.backup_date IS '백업 생성 시각';
COMMENT ON COLUMN backup_students.backup_data IS '직렬화된 학생 데이터 (JSONB)';
COMMENT ON COLUMN backup_students.student_count IS '백업된 학생 수';
COMMENT ON COLUMN backup_students.created_by IS '백업 생성자';
COMMENT ON COLUMN backup_students.notes IS '백업 메모';
