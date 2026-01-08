-- =============================================
-- UPDATE SIGNUP TRIGGER (Fix for Missing Student Data)
-- Run this in Supabase SQL Editor
-- =============================================

-- 1. Create improved function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.profiles (
        id, 
        email, 
        full_name, 
        role,
        is_approved,
        student_number,
        year_level,
        section,
        semester,
        school_year
    )
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'role', 'student'),
        COALESCE((NEW.raw_user_meta_data->>'is_approved')::boolean, false),
        NEW.raw_user_meta_data->>'student_number',
        (NEW.raw_user_meta_data->>'year_level')::integer,
        NEW.raw_user_meta_data->>'section',
        NEW.raw_user_meta_data->>'semester',
        NEW.raw_user_meta_data->>'school_year'
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
        role = COALESCE(EXCLUDED.role, profiles.role),
        student_number = COALESCE(EXCLUDED.student_number, profiles.student_number),
        year_level = COALESCE(EXCLUDED.year_level, profiles.year_level),
        section = COALESCE(EXCLUDED.section, profiles.section),
        semester = COALESCE(EXCLUDED.semester, profiles.semester),
        school_year = COALESCE(EXCLUDED.school_year, profiles.school_year);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Verify trigger exists (no change needed here, just ensuring it points to our new function)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Verification Query
-- SELECT * FROM profiles ORDER BY created_at DESC LIMIT 1;
