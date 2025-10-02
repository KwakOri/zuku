-- Migration: Add course_type column to classes table
-- Description: Add course type classification for regular classes and school exam preparation classes
-- Date: 2025-10-01

-- Add course_type column with constraint
ALTER TABLE classes
ADD COLUMN course_type TEXT NOT NULL DEFAULT 'regular'
CHECK (course_type IN ('regular', 'school_exam'));

-- Add column comment
COMMENT ON COLUMN classes.course_type IS 'Type of course: regular (정규수업) or school_exam (학교내신)';

-- Create index for faster queries by course_type
CREATE INDEX idx_classes_course_type ON classes(course_type);
