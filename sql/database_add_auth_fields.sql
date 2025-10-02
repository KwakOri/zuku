-- Add authentication fields to students, teachers, and assistants tables
-- This migration adds is_active and password_hash fields to support role-based authentication

-- Add fields to students table
ALTER TABLE students
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- Add fields to teachers table
ALTER TABLE teachers
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- Add fields to assistants table
ALTER TABLE assistants
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- Update existing records to be active by default
UPDATE students SET is_active = true WHERE is_active IS NULL;
UPDATE teachers SET is_active = true WHERE is_active IS NULL;
UPDATE assistants SET is_active = true WHERE is_active IS NULL;

-- Add constraints to ensure email uniqueness within each table
CREATE UNIQUE INDEX IF NOT EXISTS students_email_unique ON students(email) WHERE email IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS teachers_email_unique ON teachers(email) WHERE email IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS assistants_email_unique ON assistants(email) WHERE email IS NOT NULL;

-- Add indexes for performance on authentication queries
CREATE INDEX IF NOT EXISTS students_email_active_idx ON students(email, is_active) WHERE email IS NOT NULL;
CREATE INDEX IF NOT EXISTS teachers_email_active_idx ON teachers(email, is_active) WHERE email IS NOT NULL;
CREATE INDEX IF NOT EXISTS assistants_email_active_idx ON assistants(email, is_active) WHERE email IS NOT NULL;

-- Remove user_id columns as they are no longer needed
ALTER TABLE teachers DROP COLUMN IF EXISTS user_id;
ALTER TABLE assistants DROP COLUMN IF EXISTS user_id;

COMMENT ON COLUMN students.is_active IS 'Whether the student account is active';
COMMENT ON COLUMN students.password_hash IS 'Hashed password for student authentication';
COMMENT ON COLUMN teachers.is_active IS 'Whether the teacher account is active';
COMMENT ON COLUMN teachers.password_hash IS 'Hashed password for teacher authentication';
COMMENT ON COLUMN assistants.is_active IS 'Whether the assistant account is active';
COMMENT ON COLUMN assistants.password_hash IS 'Hashed password for assistant authentication';