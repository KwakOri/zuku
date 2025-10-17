-- Migration: Add year, semester, and exam_round to exam_periods table
-- Description: 내신 기간에 연도, 학기, 차수 정보 추가
-- Created: 2025-01-16

-- Add new columns to exam_periods table
ALTER TABLE exam_periods
ADD COLUMN year INTEGER NOT NULL DEFAULT EXTRACT(YEAR FROM CURRENT_DATE),
ADD COLUMN semester INTEGER NOT NULL DEFAULT 1 CHECK (semester IN (1, 2)),
ADD COLUMN exam_round INTEGER NOT NULL DEFAULT 1 CHECK (exam_round IN (1, 2));

-- Remove default values after adding columns
ALTER TABLE exam_periods
ALTER COLUMN year DROP DEFAULT,
ALTER COLUMN semester DROP DEFAULT,
ALTER COLUMN exam_round DROP DEFAULT;

-- Add comment to columns for documentation
COMMENT ON COLUMN exam_periods.year IS '내신 기간 연도';
COMMENT ON COLUMN exam_periods.semester IS '학기 (1: 1학기, 2: 2학기)';
COMMENT ON COLUMN exam_periods.exam_round IS '지필평가 차수 (1: 1차, 2: 2차)';

-- Create index for common queries
CREATE INDEX idx_exam_periods_year_semester_round ON exam_periods(year, semester, exam_round);
CREATE INDEX idx_exam_periods_school_year_semester ON exam_periods(school_id, year, semester);
