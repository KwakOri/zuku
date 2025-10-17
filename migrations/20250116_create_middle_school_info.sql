-- 내신 정보 전용 테이블 생성
-- 2025-01-16: classes 테이블에서 내신 관련 정보 분리

-- 1. class_school_meta 테이블 생성
CREATE TABLE IF NOT EXISTS class_school_meta (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,

  -- 학교 태그 (여러 학교 선택 가능)
  school_tags UUID[] DEFAULT '{}',

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT unique_class_school_meta UNIQUE (class_id)
);

-- 2. 인덱스 생성
CREATE INDEX idx_class_school_meta_class ON class_school_meta(class_id);
CREATE INDEX idx_class_school_meta_schools ON class_school_meta USING GIN(school_tags);

-- 3. 자동 업데이트 트리거 (updated_at 컬럼 자동 갱신)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_class_school_meta_updated_at
  BEFORE UPDATE ON class_school_meta
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 5. 주석 추가
COMMENT ON TABLE class_school_meta IS '중등(내신) 수업 전용 정보 테이블 - classes 테이블의 내신 관련 정보를 분리하여 관리';
COMMENT ON COLUMN class_school_meta.school_tags IS '해당 수업이 관리하는 학교 ID 배열 (schools 테이블 참조)';
