-- Migration: Add elementary school level support
-- Date: 2025-01-17
-- Description: Adds 'elementary' to the school_level enum to support elementary schools

-- Step 1: Add 'elementary' to the school_level enum
ALTER TYPE school_level ADD VALUE IF NOT EXISTS 'elementary';

-- Step 2: Update existing records if needed (optional)
-- If you have any schools that should be marked as elementary, update them here
-- Example:
-- UPDATE schools SET level = 'elementary' WHERE name LIKE '%초등학교%';

-- Step 3: Verify the change
-- You can verify the enum values with:
-- SELECT unnest(enum_range(NULL::school_level));
