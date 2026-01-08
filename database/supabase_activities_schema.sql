-- =============================================
-- CTRL C ACADEMY - ACTIVITIES SCHEMA
-- Run this in Supabase SQL Editor
-- =============================================

-- 1. ACTIVITIES TABLE
CREATE TABLE IF NOT EXISTS activities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL DEFAULT 'assignment', -- 'assignment', 'quiz', 'discussion'
    max_score INTEGER NOT NULL DEFAULT 100,
    deadline TIMESTAMPTZ NOT NULL,
    allow_late BOOLEAN DEFAULT false,
    attachment_url TEXT, -- Link to instruction files (Google Drive, Dropbox, etc.)
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. ACTIVITY SUBMISSIONS TABLE
CREATE TABLE IF NOT EXISTS activity_submissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    activity_id UUID NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT, -- Text submission
    file_url TEXT, -- Optional file attachment
    score INTEGER, -- Null until graded
    feedback TEXT, -- Professor feedback
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    graded_at TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'submitted', -- 'submitted', 'late', 'graded'
    UNIQUE(activity_id, student_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_activities_course ON activities(course_id);
CREATE INDEX IF NOT EXISTS idx_activities_deadline ON activities(deadline);
CREATE INDEX IF NOT EXISTS idx_submissions_activity ON activity_submissions(activity_id);
CREATE INDEX IF NOT EXISTS idx_submissions_student ON activity_submissions(student_id);

-- =============================================
-- ENABLE RLS
-- =============================================
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_submissions ENABLE ROW LEVEL SECURITY;

-- =============================================
-- ACTIVITIES POLICIES
-- =============================================
DROP POLICY IF EXISTS "Professors can insert activities" ON activities;
DROP POLICY IF EXISTS "Professors can update activities" ON activities;
DROP POLICY IF EXISTS "Professors can delete activities" ON activities;
DROP POLICY IF EXISTS "Users can view course activities" ON activities;

-- Professors can create activities for their courses
CREATE POLICY "Professors can insert activities"
ON activities FOR INSERT TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM courses
        WHERE courses.id = activities.course_id
        AND courses.professor_id = auth.uid()
    )
);

-- Professors can update their activities
CREATE POLICY "Professors can update activities"
ON activities FOR UPDATE TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM courses
        WHERE courses.id = activities.course_id
        AND courses.professor_id = auth.uid()
    )
);

-- Professors can delete their activities
CREATE POLICY "Professors can delete activities"
ON activities FOR DELETE TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM courses
        WHERE courses.id = activities.course_id
        AND courses.professor_id = auth.uid()
    )
);

-- Users can view activities for courses they're enrolled in or own
CREATE POLICY "Users can view course activities"
ON activities FOR SELECT TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM courses
        WHERE courses.id = activities.course_id
        AND (
            courses.professor_id = auth.uid()
            OR EXISTS (
                SELECT 1 FROM course_enrollments
                WHERE course_enrollments.course_id = activities.course_id
                AND course_enrollments.user_id = auth.uid()
            )
        )
    )
);

-- =============================================
-- SUBMISSIONS POLICIES
-- =============================================
DROP POLICY IF EXISTS "Students can submit to activities" ON activity_submissions;
DROP POLICY IF EXISTS "Students can view own submissions" ON activity_submissions;
DROP POLICY IF EXISTS "Students can update own submissions" ON activity_submissions;
DROP POLICY IF EXISTS "Professors can view course submissions" ON activity_submissions;
DROP POLICY IF EXISTS "Professors can grade submissions" ON activity_submissions;

-- Students can submit to activities in their enrolled courses
CREATE POLICY "Students can submit to activities"
ON activity_submissions FOR INSERT TO authenticated
WITH CHECK (
    student_id = auth.uid()
    AND EXISTS (
        SELECT 1 FROM activities
        JOIN courses ON courses.id = activities.course_id
        JOIN course_enrollments ON course_enrollments.course_id = courses.id
        WHERE activities.id = activity_submissions.activity_id
        AND course_enrollments.user_id = auth.uid()
    )
);

-- Students can view their own submissions
CREATE POLICY "Students can view own submissions"
ON activity_submissions FOR SELECT TO authenticated
USING (student_id = auth.uid());

-- Students can update their own ungraded submissions
CREATE POLICY "Students can update own submissions"
ON activity_submissions FOR UPDATE TO authenticated
USING (
    student_id = auth.uid()
    AND status != 'graded'
);

-- Professors can view submissions for their course activities
CREATE POLICY "Professors can view course submissions"
ON activity_submissions FOR SELECT TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM activities
        JOIN courses ON courses.id = activities.course_id
        WHERE activities.id = activity_submissions.activity_id
        AND courses.professor_id = auth.uid()
    )
);

-- Professors can update (grade) submissions for their activities
CREATE POLICY "Professors can grade submissions"
ON activity_submissions FOR UPDATE TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM activities
        JOIN courses ON courses.id = activities.course_id
        WHERE activities.id = activity_submissions.activity_id
        AND courses.professor_id = auth.uid()
    )
);

-- =============================================
-- HELPER FUNCTIONS
-- =============================================

-- Function to get activity with submission count
CREATE OR REPLACE FUNCTION get_activity_stats(p_activity_id UUID)
RETURNS TABLE (
    submission_count BIGINT,
    graded_count BIGINT,
    average_score NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::BIGINT as submission_count,
        COUNT(CASE WHEN status = 'graded' THEN 1 END)::BIGINT as graded_count,
        ROUND(AVG(score)::NUMERIC, 1) as average_score
    FROM activity_submissions
    WHERE activity_id = p_activity_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- VERIFICATION
-- =============================================
-- Run this to verify tables were created:
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name LIKE 'activit%';
