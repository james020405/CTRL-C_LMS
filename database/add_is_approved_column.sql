-- Fix Missing Column in Profiles Table

-- 1. Add the is_approved column which is missing
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT FALSE;

-- 2. Optional: Auto-approve existing admins to prevent lockout
UPDATE profiles 
SET is_approved = TRUE 
WHERE role = 'admin';

-- 3. Force PostgREST to reload its schema cache so it sees the new column
NOTIFY pgrst, 'reload config';
