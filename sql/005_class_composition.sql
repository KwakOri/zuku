-- Add split_type column to classes table
ALTER TABLE classes
ADD COLUMN IF NOT EXISTS split_type TEXT DEFAULT 'single'
CHECK (split_type IN ('single', 'split'));

-- Remove old time columns from classes table (data will be in class_composition)
ALTER TABLE classes
DROP COLUMN IF EXISTS start_time,
DROP COLUMN IF EXISTS end_time,
DROP COLUMN IF EXISTS day_of_week;

-- Enable uuid extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create class_composition table for managing class time slots
CREATE TABLE IF NOT EXISTS class_composition (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    class_id TEXT NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('class', 'clinic')),
    day_of_week INT NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    UNIQUE(class_id, type, day_of_week, start_time)
);

-- Add composition_id to class_students table to track which time slot a student is enrolled in
ALTER TABLE class_students
ADD COLUMN IF NOT EXISTS composition_id TEXT REFERENCES class_composition(id) ON DELETE SET NULL;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_class_composition_class_id ON class_composition(class_id);
CREATE INDEX IF NOT EXISTS idx_class_composition_day_of_week ON class_composition(day_of_week);
CREATE INDEX IF NOT EXISTS idx_class_students_composition_id ON class_students(composition_id);

-- Add comments for documentation
COMMENT ON TABLE class_composition IS 'Manages class time slots for front/back time configuration';
COMMENT ON COLUMN classes.type IS 'single: 단일 수업, split: 앞/뒤타임으로 나뉜 수업';
COMMENT ON COLUMN class_composition.type IS 'class: 앞타임, clinic: 뒤타임';
COMMENT ON COLUMN class_students.composition_id IS 'Which time slot (composition) the student is enrolled in';
