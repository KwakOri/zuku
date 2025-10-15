-- Add school_tags column to classes table
-- This column will store school names as tags for school_exam type classes

ALTER TABLE classes
ADD COLUMN school_tags TEXT;

COMMENT ON COLUMN classes.school_tags IS 'Comma-separated school names for school_exam type classes';
