-- 수업 시간/강의실/날짜 변경 예외 테이블
-- 특정 날짜의 수업이 다른 날짜/시간/강의실로 일시적으로 변경된 경우를 기록
CREATE TABLE compositions_exceptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- 원래 수업 구성
  composition_id UUID NOT NULL REFERENCES class_composition(id) ON DELETE CASCADE,

  -- 원래 날짜 및 시간
  date_from DATE NOT NULL, -- 원래 수업이 예정되어 있던 날짜
  start_time_from TIME, -- 원래 시작 시간 (참조용)
  end_time_from TIME, -- 원래 종료 시간 (참조용)

  -- 변경된 날짜 및 시간/강의실
  date_to DATE NOT NULL, -- 변경된 날짜
  start_time_to TIME, -- 변경된 시작 시간 (null이면 원래 시간 유지)
  end_time_to TIME, -- 변경된 종료 시간 (null이면 원래 시간 유지)
  room TEXT NOT NULL, -- 강의실 (변경이 없어도 원래 강의실 정보 저장)

  -- 사유
  reason TEXT, -- 특별 일정, 시설 문제, 보강 등

  -- 메타 정보
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- 제약 조건: 같은 composition이 같은 원래 날짜에 중복 예외를 가질 수 없음
  UNIQUE(composition_id, date_from)
);

-- 인덱스 생성
CREATE INDEX idx_compositions_exceptions_composition ON compositions_exceptions(composition_id);
CREATE INDEX idx_compositions_exceptions_date_from ON compositions_exceptions(date_from);
CREATE INDEX idx_compositions_exceptions_date_to ON compositions_exceptions(date_to);
CREATE INDEX idx_compositions_exceptions_composition_date_from ON compositions_exceptions(composition_id, date_from);
CREATE INDEX idx_compositions_exceptions_date_range ON compositions_exceptions(date_from, date_to);

-- 코멘트
COMMENT ON TABLE compositions_exceptions IS '수업의 일시적인 날짜/시간/강의실 변경 예외를 기록하는 테이블';
COMMENT ON COLUMN compositions_exceptions.composition_id IS '변경될 수업의 composition ID';
COMMENT ON COLUMN compositions_exceptions.date_from IS '원래 수업이 예정되어 있던 날짜';
COMMENT ON COLUMN compositions_exceptions.start_time_from IS '원래 시작 시간 (참조용)';
COMMENT ON COLUMN compositions_exceptions.end_time_from IS '원래 종료 시간 (참조용)';
COMMENT ON COLUMN compositions_exceptions.date_to IS '변경된 날짜 (같은 날짜면 시간/강의실만 변경)';
COMMENT ON COLUMN compositions_exceptions.start_time_to IS '변경된 시작 시간 (null이면 원래 시간 유지)';
COMMENT ON COLUMN compositions_exceptions.end_time_to IS '변경된 종료 시간 (null이면 원래 시간 유지)';
COMMENT ON COLUMN compositions_exceptions.room IS '강의실 (변경 여부와 관계없이 항상 저장)';
COMMENT ON COLUMN compositions_exceptions.reason IS '변경 사유 (특별 일정, 시설 문제, 보강 등)';
