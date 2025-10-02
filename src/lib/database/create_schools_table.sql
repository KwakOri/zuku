-- Migration: Create schools table
-- Description: Create schools table with id, name, and school level (middle/high school)
-- Date: 2025-10-01

-- Create school_level enum type
DO $$ BEGIN
  CREATE TYPE school_level AS ENUM ('middle', 'high');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create schools table
CREATE TABLE IF NOT EXISTS schools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  level school_level NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add comments
COMMENT ON TABLE schools IS '학교 정보 테이블';
COMMENT ON COLUMN schools.name IS '학교 이름';
COMMENT ON COLUMN schools.level IS '학교 구분: middle (중학교) or high (고등학교)';

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_schools_name ON schools(name);
CREATE INDEX IF NOT EXISTS idx_schools_level ON schools(level);

-- Insert initial data (중복 제거)
INSERT INTO schools (name, level) VALUES
  -- 중학교 (middle school)
  ('효자중', 'middle'),
  ('천보중', 'middle'),
  ('금오중', 'middle'),
  ('신곡중', 'middle'),
  ('동암중', 'middle'),
  ('훈민중', 'middle'),

  -- 고등학교 (high school)
  ('영석고', 'high'),
  ('의정부여고', 'high'),
  ('의정부고', 'high'),
  ('송현고', 'high'),
  ('경민고', 'high'),
  ('발곡고', 'high'),
  ('의여고', 'high'),
  ('광동고', 'high'),
  ('효자고', 'high'),
  ('부용고', 'high'),
  ('호원고', 'high'),
  ('송양고', 'high'),
ON CONFLICT (name) DO NOTHING;

