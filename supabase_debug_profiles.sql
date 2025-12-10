-- =============================================
-- DIAGNOSTIC: Check why profiles aren't visible
-- Run each section separately and share results
-- =============================================

-- STEP 1: Check if profiles table has any data
SELECT COUNT(*) as profile_count FROM profiles;

-- STEP 2: Check all RLS policies on profiles table
SELECT 
    policyname, 
    permissive, 
    roles, 
    cmd, 
    qual, 
    with_check
FROM pg_policies 
WHERE tablename = 'profiles';

-- STEP 3: Check if RLS is enabled on profiles
SELECT 
    relname as table_name,
    relrowsecurity as rls_enabled,
    relforcerowsecurity as rls_forced
FROM pg_class 
WHERE relname = 'profiles';

-- STEP 4: Try selecting as the service role (bypasses RLS)
-- This shows if data exists but RLS is blocking
SELECT id, email, full_name, role FROM profiles LIMIT 5;

-- =============================================
-- FIX: If the above shows RLS issues, run this:
-- =============================================

-- Drop ALL existing policies on profiles (clean slate)
DO $$
DECLARE
    policy_name TEXT;
BEGIN
    FOR policy_name IN 
        SELECT policyname FROM pg_policies WHERE tablename = 'profiles'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON profiles', policy_name);
    END LOOP;
END $$;

-- Recreate the correct policies
CREATE POLICY "Enable read access for all authenticated users"
ON profiles FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Enable insert for users based on user_id"
ON profiles FOR INSERT
TO authenticated
WITH CHECK (id = auth.uid());

CREATE POLICY "Enable update for users based on user_id"
ON profiles FOR UPDATE
TO authenticated
USING (id = auth.uid());

-- Verify policies were created
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'profiles';

-- Test: This should now return data
SELECT id, email, full_name, role FROM profiles LIMIT 5;
