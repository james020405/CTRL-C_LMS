-- Fix Admin Dashboard Issues

-- 1. Ensure the 'approved' column is renamed to 'is_approved' if it exists in that old format
-- This aligns the database with the codebase which consistently uses 'is_approved'
DO $$
BEGIN
  IF EXISTS(SELECT *
    FROM information_schema.columns
    WHERE table_name='profiles' AND column_name='approved')
  THEN
      ALTER TABLE profiles RENAME COLUMN approved TO is_approved;
  END IF;
END $$;

-- 2. Force PostgREST to reload its schema cache
-- This fixes the "Could not find the 'approved' column ... in the schema cache" error (PGRST204)
NOTIFY pgrst, 'reload config';
