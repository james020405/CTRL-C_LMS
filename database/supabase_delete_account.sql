-- ============================================
-- SECURE ACCOUNT DELETION - COMPLETE
-- Run this in Supabase SQL Editor
-- ============================================
-- Tables with FK to auth.users (based on codebase analysis):
-- 1. daily_plays (user_id)
-- 2. game_scores (user_id)  
-- 3. game_plays (user_id)
-- 4. student_flashcards (user_id)
-- 5. activity_submissions (user_id or student_id)
-- 6. enrollments (student_id)
-- 7. courses (professor_id) - only for professors
-- 8. profiles (id)
-- ============================================

-- Drop existing function first
DROP FUNCTION IF EXISTS delete_user_account();

CREATE OR REPLACE FUNCTION delete_user_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    current_user_id uuid;
BEGIN
    -- Get the current user's ID
    current_user_id := auth.uid();
    
    IF current_user_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;
    
    -- Delete from ALL tables with FK to auth.users
    -- Each in its own block to handle missing tables gracefully
    
    -- 1. daily_plays
    BEGIN
        DELETE FROM daily_plays WHERE user_id = current_user_id;
    EXCEPTION WHEN undefined_table OR undefined_column THEN NULL;
    END;
    
    -- 2. game_scores
    BEGIN
        DELETE FROM game_scores WHERE user_id = current_user_id;
    EXCEPTION WHEN undefined_table OR undefined_column THEN NULL;
    END;
    
    -- 3. game_plays
    BEGIN
        DELETE FROM game_plays WHERE user_id = current_user_id;
    EXCEPTION WHEN undefined_table OR undefined_column THEN NULL;
    END;
    
    -- 4. student_flashcards
    BEGIN
        DELETE FROM student_flashcards WHERE user_id = current_user_id;
    EXCEPTION WHEN undefined_table OR undefined_column THEN NULL;
    END;
    
    -- 5. activity_submissions (might use user_id or student_id)
    BEGIN
        DELETE FROM activity_submissions WHERE user_id = current_user_id;
    EXCEPTION WHEN undefined_table OR undefined_column THEN NULL;
    END;
    BEGIN
        DELETE FROM activity_submissions WHERE student_id = current_user_id;
    EXCEPTION WHEN undefined_table OR undefined_column THEN NULL;
    END;
    
    -- 6. enrollments
    BEGIN
        DELETE FROM enrollments WHERE student_id = current_user_id;
    EXCEPTION WHEN undefined_table OR undefined_column THEN NULL;
    END;
    
    -- 7. courses (for professors)
    BEGIN
        DELETE FROM courses WHERE professor_id = current_user_id;
    EXCEPTION WHEN undefined_table OR undefined_column THEN NULL;
    END;
    
    -- 8. activities (for professors)
    BEGIN
        DELETE FROM activities WHERE professor_id = current_user_id;
    EXCEPTION WHEN undefined_table OR undefined_column THEN NULL;
    END;
    
    -- Delete profile
    DELETE FROM profiles WHERE id = current_user_id;
    
    -- Finally delete auth user
    DELETE FROM auth.users WHERE id = current_user_id;
    
END;
$$;

-- Permissions
GRANT EXECUTE ON FUNCTION delete_user_account() TO authenticated;
REVOKE EXECUTE ON FUNCTION delete_user_account() FROM anon;
REVOKE EXECUTE ON FUNCTION delete_user_account() FROM public;

SELECT 'delete_user_account() created - includes daily_plays!' as status;
