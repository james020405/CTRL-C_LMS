-- =============================================
-- PROFILES TABLE & STORAGE SETUP
-- Run this in Supabase SQL Editor
-- =============================================

-- 1. Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    full_name TEXT,
    role TEXT DEFAULT 'student',
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies first
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- Policies for profiles
CREATE POLICY "Users can view all profiles"
ON profiles FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE TO authenticated
USING (id = auth.uid());

CREATE POLICY "Users can insert own profile"
ON profiles FOR INSERT TO authenticated
WITH CHECK (id = auth.uid());

-- 2. Create function to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        CASE 
            WHEN NEW.email LIKE '%@cvsu.edu.ph' THEN 'professor'
            ELSE 'student'
        END
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
        updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Create trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. Backfill existing users into profiles
INSERT INTO profiles (id, email, full_name, role)
SELECT 
    id,
    email,
    COALESCE(raw_user_meta_data->>'full_name', split_part(email, '@', 1)),
    CASE 
        WHEN email LIKE '%@cvsu.edu.ph' THEN 'professor'
        ELSE 'student'
    END
FROM auth.users
ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
    updated_at = NOW();

-- =============================================
-- STORAGE BUCKET SETUP
-- You must also create a storage bucket in the Supabase Dashboard:
-- 1. Go to Storage in Supabase Dashboard
-- 2. Click "New bucket"
-- 3. Name it "materials"
-- 4. Make it PUBLIC (check the box)
-- 5. Click "Create bucket"
-- =============================================

-- Storage policies (run these after creating the bucket)
-- Note: These are for the materials bucket
-- You may need to run these from the Supabase Dashboard -> Storage -> Policies

-- Or run this SQL to set up storage policies:
-- INSERT INTO storage.buckets (id, name, public) 
-- VALUES ('materials', 'materials', true)
-- ON CONFLICT (id) DO NOTHING;

-- =============================================
-- VERIFICATION QUERIES
-- =============================================
-- Check if profiles were created:
-- SELECT * FROM profiles LIMIT 10;

-- Check auth users:
-- SELECT id, email, raw_user_meta_data FROM auth.users LIMIT 10;
