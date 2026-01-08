-- Fix Admin RLS Policies (Without changing user roles)

-- 1. Enable RLS on profiles to ensure consistent security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 2. Create/Update Policy for Admins to manage all profiles
-- This allows anyone with 'admin' role to UPDATE any profile
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
            -- Check if the current user has the 'admin' role
            (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
        );
    END IF;
END $$;

-- 3. Create/Update Policy for Admins to view all profiles
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

-- 4. Reload Schema Cache to apply changes immediately
NOTIFY pgrst, 'reload config';
