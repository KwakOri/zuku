-- Migration: Fix class_students unique constraint to support multiple compositions
-- This allows students to enroll in multiple time slots (e.g., 앞타임 + 뒤타임) of the same class

-- Step 1: Drop the existing constraint that only checks (class_id, student_id)
ALTER TABLE class_students
DROP CONSTRAINT IF EXISTS class_students_class_id_student_id_key;

-- Step 2: Create a new unique constraint that includes composition_id and status
-- This allows the same student to be enrolled in multiple compositions of the same class
-- but prevents duplicate enrollments in the same composition
CREATE UNIQUE INDEX class_students_unique_enrollment
ON class_students (class_id, student_id, composition_id, status)
WHERE status = 'active';

-- Note: We use a partial index (WHERE status = 'active') to allow multiple inactive records
-- This is useful for tracking enrollment history
