-- Zuku 학원 관리 시스템 데이터베이스 스키마
-- UUID 기반 ID 구조로 변경
-- 중등/고등 숙제 기록 테이블 이름 통일

-- UUID 확장 활성화
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 학생 테이블 (ID를 UUID로 변경)
CREATE TABLE students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    grade INTEGER NOT NULL CHECK (grade >= 1 AND grade <= 12),
    phone VARCHAR(20),
    parent_phone VARCHAR(20),
    email VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 강사 테이블
CREATE TABLE teachers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    subjects TEXT[] NOT NULL DEFAULT '{}',
    phone VARCHAR(20),
    email VARCHAR(255),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 조교 테이블
CREATE TABLE assistants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    teacher_id UUID REFERENCES teachers(id) ON DELETE CASCADE,
    subjects TEXT[] NOT NULL DEFAULT '{}',
    assigned_grades INTEGER[] NOT NULL DEFAULT '{}',
    phone VARCHAR(20),
    email VARCHAR(255),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 수업 테이블
CREATE TABLE classes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(200) NOT NULL,
    subject VARCHAR(100) NOT NULL,
    teacher_id UUID REFERENCES teachers(id) ON DELETE SET NULL,
    teacher_name VARCHAR(100) NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
    color VARCHAR(7) NOT NULL DEFAULT '#3B82F6',
    room VARCHAR(50),
    max_students INTEGER,
    description TEXT,
    rrule TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 수업 예외 테이블
CREATE TABLE class_exceptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('cancel', 'reschedule', 'substitute')),
    reason TEXT,
    new_start_time TIME,
    new_end_time TIME,
    new_room VARCHAR(50),
    substitute_teacher_id UUID REFERENCES teachers(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 수업-학생 관계 테이블
CREATE TABLE class_students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    enrolled_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'withdrawn')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(class_id, student_id)
);

-- 학생 개인 일정 테이블
CREATE TABLE student_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
    color VARCHAR(7) NOT NULL DEFAULT '#EF4444',
    type VARCHAR(20) NOT NULL DEFAULT 'personal' CHECK (type IN ('personal', 'extracurricular', 'study', 'appointment', 'other')),
    location VARCHAR(100),
    recurring BOOLEAN DEFAULT true,
    rrule TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'completed')),
    created_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 중등 기록 테이블 (이름 변경: middle_school_records -> homework_records_middle)
CREATE TABLE homework_records_middle (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    teacher_id UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    week_of DATE NOT NULL,
    attendance VARCHAR(20) NOT NULL CHECK (attendance IN ('present', 'absent', 'late')),
    participation INTEGER NOT NULL CHECK (participation >= 1 AND participation <= 5),
    understanding INTEGER NOT NULL CHECK (understanding >= 1 AND understanding <= 5),
    homework VARCHAR(20) NOT NULL CHECK (homework IN ('excellent', 'good', 'fair', 'poor', 'not_submitted')),
    notes TEXT NOT NULL DEFAULT '',
    created_date DATE NOT NULL DEFAULT CURRENT_DATE,
    last_modified DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(student_id, teacher_id, class_id, week_of)
);

-- 고등 기록 테이블 (이름 변경: high_school_homework_records -> homework_records_high)
CREATE TABLE homework_records_high (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    assistant_id UUID NOT NULL REFERENCES assistants(id) ON DELETE CASCADE,
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    homework_range TEXT NOT NULL,
    achievement VARCHAR(20) NOT NULL CHECK (achievement IN ('excellent', 'good', 'fair', 'poor', 'not_submitted')),
    completion_rate INTEGER NOT NULL CHECK (completion_rate >= 0 AND completion_rate <= 100),
    accuracy INTEGER NOT NULL CHECK (accuracy >= 0 AND accuracy <= 100),
    notes TEXT,
    created_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(student_id, assistant_id, class_id, date)
);

-- 회원가입 초대 테이블
CREATE TABLE signup_invitations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'teacher', 'assistant', 'student', 'parent')),
    token VARCHAR(255) NOT NULL UNIQUE,
    invited_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX idx_students_grade ON students(grade);
CREATE INDEX idx_students_name ON students(name);

CREATE INDEX idx_teachers_subjects ON teachers USING GIN(subjects);

CREATE INDEX idx_assistants_teacher_id ON assistants(teacher_id);
CREATE INDEX idx_assistants_subjects ON assistants USING GIN(subjects);

CREATE INDEX idx_classes_teacher_id ON classes(teacher_id);
CREATE INDEX idx_classes_day_of_week ON classes(day_of_week);
CREATE INDEX idx_classes_subject ON classes(subject);

CREATE INDEX idx_class_exceptions_class_id ON class_exceptions(class_id);
CREATE INDEX idx_class_exceptions_date ON class_exceptions(date);

CREATE INDEX idx_class_students_class_id ON class_students(class_id);
CREATE INDEX idx_class_students_student_id ON class_students(student_id);
CREATE INDEX idx_class_students_status ON class_students(status);

CREATE INDEX idx_student_schedules_student_id ON student_schedules(student_id);
CREATE INDEX idx_student_schedules_day_of_week ON student_schedules(day_of_week);

CREATE INDEX idx_homework_records_middle_student_id ON homework_records_middle(student_id);
CREATE INDEX idx_homework_records_middle_teacher_id ON homework_records_middle(teacher_id);
CREATE INDEX idx_homework_records_middle_week_of ON homework_records_middle(week_of);

CREATE INDEX idx_homework_records_high_student_id ON homework_records_high(student_id);
CREATE INDEX idx_homework_records_high_assistant_id ON homework_records_high(assistant_id);
CREATE INDEX idx_homework_records_high_date ON homework_records_high(date);

CREATE INDEX idx_signup_invitations_email ON signup_invitations(email);
CREATE INDEX idx_signup_invitations_token ON signup_invitations(token);
CREATE INDEX idx_signup_invitations_expires_at ON signup_invitations(expires_at);


