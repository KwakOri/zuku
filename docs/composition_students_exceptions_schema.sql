-- 학생 수업 변경 예외 테이블
-- 특정 날짜에 학생이 다른 수업으로 일시적으로 이동한 경우를 기록
CREATE TABLE composition_students_exceptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- 원래 수업 정보
  composition_id_from UUID NOT NULL REFERENCES class_composition(id) ON DELETE CASCADE,
  date_from DATE NOT NULL, -- 원래 수업 날짜

  -- 이동할 수업 정보
  composition_id_to UUID NOT NULL REFERENCES class_composition(id) ON DELETE CASCADE,
  date_to DATE NOT NULL, -- 이동할 수업 날짜

  -- 학생 정보
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,

  -- 사유
  reason TEXT, -- 병원, 상담, 보충 등

  -- 메타 정보
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- 제약 조건: 같은 학생이 같은 날짜에 중복 예외를 가질 수 없음
  UNIQUE(student_id, date_from, composition_id_from)
);

-- 인덱스 생성
CREATE INDEX idx_composition_students_exceptions_from ON composition_students_exceptions(composition_id_from, date_from);
CREATE INDEX idx_composition_students_exceptions_to ON composition_students_exceptions(composition_id_to, date_to);
CREATE INDEX idx_composition_students_exceptions_student ON composition_students_exceptions(student_id);
CREATE INDEX idx_composition_students_exceptions_date_range ON composition_students_exceptions(date_from, date_to);

-- 코멘트
COMMENT ON TABLE composition_students_exceptions IS '학생의 일시적인 수업 변경 예외를 기록하는 테이블';
COMMENT ON COLUMN composition_students_exceptions.composition_id_from IS '원래 듣기로 되어 있던 수업의 composition ID';
COMMENT ON COLUMN composition_students_exceptions.date_from IS '원래 수업의 날짜';
COMMENT ON COLUMN composition_students_exceptions.composition_id_to IS '이동할 수업의 composition ID';
COMMENT ON COLUMN composition_students_exceptions.date_to IS '이동할 수업의 날짜';
COMMENT ON COLUMN composition_students_exceptions.student_id IS '수업을 변경하는 학생의 ID';
COMMENT ON COLUMN composition_students_exceptions.reason IS '변경 사유 (병원, 상담, 보충 등)';
