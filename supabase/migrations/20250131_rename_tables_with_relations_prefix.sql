-- 조인 테이블에 relations 접두어 추가
-- Join tables에 relations prefix 추가

-- 1. assistant_subjects -> relations_assistants_subjects
ALTER TABLE assistant_subjects RENAME TO relations_assistants_subjects;

-- 2. teacher_subjects -> relations_teachers_subjects
ALTER TABLE teacher_subjects RENAME TO relations_teachers_subjects;

-- 3. compositions_students -> relations_compositions_students
ALTER TABLE compositions_students RENAME TO relations_compositions_students;

-- 4. class_students -> relations_classes_students
ALTER TABLE class_students RENAME TO relations_classes_students;

-- 5. class_composition -> class_compositions (단수 -> 복수, join table 아님)
ALTER TABLE class_composition RENAME TO class_compositions;

-- 인덱스도 함께 rename (자동으로 rename되지 않는 경우를 위해)
-- Note: PostgreSQL은 테이블 rename 시 연관된 인덱스도 자동으로 rename하지만,
-- 명시적으로 정의된 인덱스는 수동으로 rename 필요할 수 있음

-- relations_compositions_students 관련 인덱스 확인 및 rename
DO $$
BEGIN
    -- compositions_students의 기존 인덱스가 있다면 rename
    IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'compositions_students_pkey') THEN
        ALTER INDEX compositions_students_pkey RENAME TO relations_compositions_students_pkey;
    END IF;

    IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_students_exceptions_week') THEN
        -- 이미 올바른 이름이므로 변경 불필요
        NULL;
    END IF;
END $$;

-- 시퀀스도 함께 rename (id 자동 증가를 위한 시퀀스)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'assistant_subjects_id_seq') THEN
        ALTER SEQUENCE assistant_subjects_id_seq RENAME TO relations_assistants_subjects_id_seq;
    END IF;

    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'teacher_subjects_id_seq') THEN
        ALTER SEQUENCE teacher_subjects_id_seq RENAME TO relations_teachers_subjects_id_seq;
    END IF;

    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'compositions_students_id_seq') THEN
        ALTER SEQUENCE compositions_students_id_seq RENAME TO relations_compositions_students_id_seq;
    END IF;

    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'class_students_id_seq') THEN
        ALTER SEQUENCE class_students_id_seq RENAME TO relations_classes_students_id_seq;
    END IF;

    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'class_composition_id_seq') THEN
        ALTER SEQUENCE class_composition_id_seq RENAME TO class_compositions_id_seq;
    END IF;
END $$;

-- 외래 키 제약조건도 함께 rename
DO $$
BEGIN
    -- assistant_subjects 관련 FK
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname LIKE 'assistant_subjects_%') THEN
        EXECUTE (
            SELECT string_agg('ALTER TABLE relations_assistants_subjects RENAME CONSTRAINT ' || conname || ' TO ' || replace(conname, 'assistant_subjects', 'relations_assistants_subjects') || ';', E'\n')
            FROM pg_constraint
            WHERE conname LIKE 'assistant_subjects_%'
            AND conrelid = 'relations_assistants_subjects'::regclass
        );
    END IF;

    -- teacher_subjects 관련 FK
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname LIKE 'teacher_subjects_%') THEN
        EXECUTE (
            SELECT string_agg('ALTER TABLE relations_teachers_subjects RENAME CONSTRAINT ' || conname || ' TO ' || replace(conname, 'teacher_subjects', 'relations_teachers_subjects') || ';', E'\n')
            FROM pg_constraint
            WHERE conname LIKE 'teacher_subjects_%'
            AND conrelid = 'relations_teachers_subjects'::regclass
        );
    END IF;

    -- compositions_students 관련 FK
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname LIKE 'compositions_students_%') THEN
        EXECUTE (
            SELECT string_agg('ALTER TABLE relations_compositions_students RENAME CONSTRAINT ' || conname || ' TO ' || replace(conname, 'compositions_students', 'relations_compositions_students') || ';', E'\n')
            FROM pg_constraint
            WHERE conname LIKE 'compositions_students_%'
            AND conrelid = 'relations_compositions_students'::regclass
        );
    END IF;

    -- class_students 관련 FK
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname LIKE 'class_students_%') THEN
        EXECUTE (
            SELECT string_agg('ALTER TABLE relations_classes_students RENAME CONSTRAINT ' || conname || ' TO ' || replace(conname, 'class_students', 'relations_classes_students') || ';', E'\n')
            FROM pg_constraint
            WHERE conname LIKE 'class_students_%'
            AND conrelid = 'relations_classes_students'::regclass
        );
    END IF;

    -- class_composition 관련 FK
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname LIKE 'class_composition_%') THEN
        EXECUTE (
            SELECT string_agg('ALTER TABLE class_compositions RENAME CONSTRAINT ' || conname || ' TO ' || replace(conname, 'class_composition', 'class_compositions') || ';', E'\n')
            FROM pg_constraint
            WHERE conname LIKE 'class_composition_%'
            AND conrelid = 'class_compositions'::regclass
        );
    END IF;
END $$;
