-- Fix Admin Permissions and RLS

-- 1. Promote James Abrau to Admin (Super User)
-- This is necessary because Row Level Security (RLS) likely prevents non-admins from approving users.
UPDATE profiles
SET role = 'admin', is_approved = true
WHERE email = 'james.abrau@cvsu.edu.ph';

-- 2. Enable RLS on profiles if not already enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 3. Create/Update Policy for Admins to manage all profiles
-- We use a DO block to avoid errors if policy already exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'profiles' 
        AND policyname = 'Admins can update all profiles'
    ) THEN
        CREATE POLICY "Admins can update all profiles"
        ON profiles
        FOR UPDATE
        USING (
            -- The user performing the action must be an admin
            (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
        );
    END IF;
END $$;

-- 4. Ensure Admins can also SELECT (view) all profiles (if not already allowed)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'profiles' 
        AND policyname = 'Admins can view all profiles'
    ) THEN
        CREATE POLICY "Admins can view all profiles"
        ON profiles
        FOR SELECT
        USING (
            (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
        );
    END IF;
END $$;

-- 5. Reload Schema Cache
NOTIFY pgrst, 'reload config';
