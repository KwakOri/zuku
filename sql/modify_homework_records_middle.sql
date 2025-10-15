-- homework_records_middle 테이블 구조 변경
-- teacher_id 제거하고 class_id 추가

BEGIN;

-- 1. teacher_id 컬럼 삭제
ALTER TABLE homework_records_middle
DROP COLUMN IF EXISTS teacher_id;

-- 2. class_id 컬럼 추가 (classes 테이블 참조)
ALTER TABLE homework_records_middle
ADD COLUMN class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE;

-- 3. 인덱스 추가 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_homework_records_middle_class_id
ON homework_records_middle(class_id);

CREATE INDEX IF NOT EXISTS idx_homework_records_middle_week_of
ON homework_records_middle(week_of);

-- 4. 복합 인덱스 추가 (특정 수업의 특정 주차 기록 조회 최적화)
CREATE INDEX IF NOT EXISTS idx_homework_records_middle_class_week
ON homework_records_middle(class_id, week_of);

-- 5. 변경 사항 확인용 쿼리
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'homework_records_middle'
ORDER BY ordinal_position;

COMMIT;

-- 롤백이 필요한 경우:
-- BEGIN;
-- ALTER TABLE homework_records_middle DROP COLUMN IF EXISTS class_id;
-- ALTER TABLE homework_records_middle ADD COLUMN teacher_id UUID REFERENCES teachers(id) ON DELETE SET NULL;
-- COMMIT;
