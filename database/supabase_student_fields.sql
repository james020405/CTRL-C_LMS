-- =============================================
-- CTRL C ACADEMY - STUDENT PROFILE EXPANSION
-- Run this in Supabase SQL Editor
-- Adds student-specific fields per client feedback
-- =============================================

-- Add new columns to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS student_number VARCHAR(20),
ADD COLUMN IF NOT EXISTS year_level INTEGER CHECK (year_level >= 1 AND year_level <= 4),
ADD COLUMN IF NOT EXISTS section VARCHAR(20),
ADD COLUMN IF NOT EXISTS semester VARCHAR(10) CHECK (semester IN ('1st', '2nd', 'Summer')),
ADD COLUMN IF NOT EXISTS school_year VARCHAR(10);

-- Create index for efficient querying by class groupings
CREATE INDEX IF NOT EXISTS idx_profiles_student_grouping 
ON profiles(year_level, section, school_year);

-- Create index for student number lookups
CREATE INDEX IF NOT EXISTS idx_profiles_student_number 
ON profiles(student_number);

-- =============================================
-- VERIFICATION
-- =============================================
-- Run this to verify columns were added:
-- SELECT column_name, data_type FROM information_schema.columns 
-- WHERE table_name = 'profiles' AND column_name IN ('student_number', 'year_level', 'section', 'semester', 'school_year');
