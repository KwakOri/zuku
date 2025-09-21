-- 학원 시간표 관리 앱 - 과목 관계 정규화 마이그레이션
-- 배열 형태의 과목 저장을 조인 테이블로 변경

-- 1. 선생님-과목 연결 테이블 생성
CREATE TABLE teacher_subjects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    teacher_id UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- 중복 방지를 위한 유니크 제약
    UNIQUE(teacher_id, subject_id)
);

-- 2. 조교-과목 연결 테이블 생성
CREATE TABLE assistant_subjects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    assistant_id UUID NOT NULL REFERENCES assistants(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- 중복 방지를 위한 유니크 제약
    UNIQUE(assistant_id, subject_id)
);

-- 3. 인덱스 생성 (성능 최적화)
CREATE INDEX idx_teacher_subjects_teacher_id ON teacher_subjects(teacher_id);
CREATE INDEX idx_teacher_subjects_subject_id ON teacher_subjects(subject_id);
CREATE INDEX idx_assistant_subjects_assistant_id ON assistant_subjects(assistant_id);
CREATE INDEX idx_assistant_subjects_subject_id ON assistant_subjects(subject_id);


