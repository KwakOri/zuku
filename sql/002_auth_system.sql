-- 사용자 인증 시스템 추가
-- 실행 순서: 2 (기존 스키마 이후 실행)

-- 사용자 인증 정보 테이블
CREATE TABLE users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'manager', 'teacher', 'assistant')),
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 회원가입 초대 테이블
CREATE TABLE signup_invitations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT NOT NULL,
    token TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'manager', 'teacher', 'assistant')),
    invited_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at TIMESTAMPTZ NOT NULL,
    used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 기존 테이블에 user_id 컬럼 추가
ALTER TABLE teachers ADD COLUMN user_id UUID REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE assistants ADD COLUMN user_id UUID REFERENCES users(id) ON DELETE SET NULL;

-- 인덱스 생성 (성능 최적화)
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_signup_invitations_token ON signup_invitations(token);
CREATE INDEX idx_signup_invitations_email ON signup_invitations(email);
CREATE INDEX idx_signup_invitations_expires_at ON signup_invitations(expires_at);
CREATE INDEX idx_teachers_user_id ON teachers(user_id);
CREATE INDEX idx_assistants_user_id ON assistants(user_id);

-- updated_at 자동 업데이트를 위한 함수 및 트리거
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- users 테이블에 updated_at 자동 업데이트 트리거 적용
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();