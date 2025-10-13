# Database Migration Instructions

## Issue: Student Enrollment Constraint Error

**Problem**: Students cannot enroll in multiple time slots (compositions) of the same class due to a database constraint that only checks `(class_id, student_id)`.

**Error Message**:
```
duplicate key value violates unique constraint "class_students_class_id_student_id_key"
```

## Solution

Apply the SQL migration to fix the unique constraint.

### Option 1: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Click **New Query**
4. Copy and paste the contents of `migration_fix_class_students_constraint.sql`
5. Click **Run** to execute the migration

### Option 2: Using Supabase CLI

```bash
# If you have Supabase CLI installed
supabase db execute -f migration_fix_class_students_constraint.sql
```

### Option 3: Manual SQL Execution

Connect to your PostgreSQL database and execute:

```sql
-- Step 1: Drop the old constraint
ALTER TABLE class_students
DROP CONSTRAINT IF EXISTS class_students_class_id_student_id_key;

-- Step 2: Create new partial unique index
CREATE UNIQUE INDEX class_students_unique_enrollment
ON class_students (class_id, student_id, composition_id, status)
WHERE status = 'active';
```

## What This Changes

### Before
- **Constraint**: Unique on `(class_id, student_id)`
- **Effect**: Student could only enroll in ONE time slot per class
- **Problem**: Prevented "앞/뒤타임" (split class) enrollments

### After
- **Constraint**: Unique on `(class_id, student_id, composition_id, status)` where `status = 'active'`
- **Effect**: Student can enroll in MULTIPLE time slots of the same class
- **Benefit**:
  - ✅ Allows enrollment in both "앞타임" (class) and "뒤타임" (clinic)
  - ✅ Prevents duplicate enrollment in the same composition
  - ✅ Allows multiple inactive records for enrollment history

## Verification

After applying the migration, test by:

1. Opening the student detail page
2. Clicking "수업 등록" (Enroll in Class)
3. Selecting a split class (앞/뒤타임)
4. Clicking both time slots in the schedule
5. Clicking "등록" (Enroll)

**Expected Result**: Both enrollments should succeed without errors.

## Rollback (if needed)

If you need to revert this change:

```sql
-- Remove the new index
DROP INDEX IF EXISTS class_students_unique_enrollment;

-- Restore the old constraint
ALTER TABLE class_students
ADD CONSTRAINT class_students_class_id_student_id_key
UNIQUE (class_id, student_id);
```

⚠️ **Warning**: Rollback will fail if there are students enrolled in multiple compositions of the same class.
