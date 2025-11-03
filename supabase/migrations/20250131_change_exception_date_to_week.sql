-- compositions_exceptions 테이블 변경
ALTER TABLE compositions_exceptions
  DROP COLUMN date_from,
  DROP COLUMN date_to,
  ADD COLUMN week_start_date DATE NOT NULL;

-- composition_students_exceptions 테이블 변경
ALTER TABLE composition_students_exceptions
  DROP COLUMN date_from,
  DROP COLUMN date_to,
  ADD COLUMN week_start_date DATE NOT NULL;

-- 인덱스 추가 (성능 최적화)
CREATE INDEX idx_compositions_exceptions_week ON compositions_exceptions(composition_id, week_start_date);
CREATE INDEX idx_students_exceptions_week ON composition_students_exceptions(composition_id_from, week_start_date);
