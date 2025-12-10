-- =============================================
-- CTRL C ACADEMY - PROFESSOR DATABASE SCHEMA
-- Run this in Supabase SQL Editor FIRST
-- Then run supabase_professor_rls_fix.sql
-- =============================================

-- 1. COURSES TABLE
CREATE TABLE IF NOT EXISTS courses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    access_code TEXT NOT NULL UNIQUE,
    professor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    student_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TOPICS TABLE (for course content organization)
CREATE TABLE IF NOT EXISTS topics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. MATERIALS TABLE (PDFs, videos, links for topics)
CREATE TABLE IF NOT EXISTS materials (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'link', -- 'pdf', 'video', 'image', 'link'
    url TEXT,
    content TEXT,
    topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. COURSE ENROLLMENTS (students enrolled in courses)
CREATE TABLE IF NOT EXISTS course_enrollments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    enrolled_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, course_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_courses_professor ON courses(professor_id);
CREATE INDEX IF NOT EXISTS idx_topics_course ON topics(course_id);
CREATE INDEX IF NOT EXISTS idx_materials_topic ON materials(topic_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_user ON course_enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course ON course_enrollments(course_id);

-- =============================================
-- ENABLE RLS ON ALL TABLES
-- =============================================
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_enrollments ENABLE ROW LEVEL SECURITY;

-- =============================================
-- COURSES POLICIES
-- =============================================
DROP POLICY IF EXISTS "Professors can insert courses" ON courses;
DROP POLICY IF EXISTS "Professors can update their courses" ON courses;
DROP POLICY IF EXISTS "Professors can delete their courses" ON courses;
DROP POLICY IF EXISTS "Anyone can view courses" ON courses;

CREATE POLICY "Professors can insert courses"
ON courses FOR INSERT TO authenticated
WITH CHECK (professor_id = auth.uid());

CREATE POLICY "Professors can update their courses"
ON courses FOR UPDATE TO authenticated
USING (professor_id = auth.uid());

CREATE POLICY "Professors can delete their courses"
ON courses FOR DELETE TO authenticated
USING (professor_id = auth.uid());

CREATE POLICY "Anyone can view courses"
ON courses FOR SELECT TO authenticated
USING (true);

-- =============================================
-- TOPICS POLICIES
-- =============================================
DROP POLICY IF EXISTS "Professors can insert topics for their courses" ON topics;
DROP POLICY IF EXISTS "Professors can update topics for their courses" ON topics;
DROP POLICY IF EXISTS "Professors can delete topics for their courses" ON topics;
DROP POLICY IF EXISTS "Anyone can view topics" ON topics;

CREATE POLICY "Professors can insert topics for their courses"
ON topics FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM courses
    WHERE courses.id = topics.course_id
    AND courses.professor_id = auth.uid()
  )
);

CREATE POLICY "Professors can update topics for their courses"
ON topics FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM courses
    WHERE courses.id = topics.course_id
    AND courses.professor_id = auth.uid()
  )
);

CREATE POLICY "Professors can delete topics for their courses"
ON topics FOR DELETE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM courses
    WHERE courses.id = topics.course_id
    AND courses.professor_id = auth.uid()
  )
);

CREATE POLICY "Anyone can view topics"
ON topics FOR SELECT TO authenticated
USING (true);

-- =============================================
-- MATERIALS POLICIES
-- =============================================
DROP POLICY IF EXISTS "Professors can insert materials" ON materials;
DROP POLICY IF EXISTS "Professors can update materials" ON materials;
DROP POLICY IF EXISTS "Professors can delete materials" ON materials;
DROP POLICY IF EXISTS "Anyone can view materials" ON materials;

CREATE POLICY "Professors can insert materials"
ON materials FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM topics
    JOIN courses ON courses.id = topics.course_id
    WHERE topics.id = materials.topic_id
    AND courses.professor_id = auth.uid()
  )
);

CREATE POLICY "Professors can update materials"
ON materials FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM topics
    JOIN courses ON courses.id = topics.course_id
    WHERE topics.id = materials.topic_id
    AND courses.professor_id = auth.uid()
  )
);

CREATE POLICY "Professors can delete materials"
ON materials FOR DELETE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM topics
    JOIN courses ON courses.id = topics.course_id
    WHERE topics.id = materials.topic_id
    AND courses.professor_id = auth.uid()
  )
);

CREATE POLICY "Anyone can view materials"
ON materials FOR SELECT TO authenticated
USING (true);

-- =============================================
-- COURSE ENROLLMENTS POLICIES
-- =============================================
DROP POLICY IF EXISTS "Students can enroll themselves" ON course_enrollments;
DROP POLICY IF EXISTS "Users can view their enrollments" ON course_enrollments;
DROP POLICY IF EXISTS "Professors can view course enrollments" ON course_enrollments;

CREATE POLICY "Students can enroll themselves"
ON course_enrollments FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view their enrollments"
ON course_enrollments FOR SELECT TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Professors can view course enrollments"
ON course_enrollments FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM courses
    WHERE courses.id = course_enrollments.course_id
    AND courses.professor_id = auth.uid()
  )
);

-- =============================================
-- VERIFICATION
-- =============================================
-- Run this to verify tables were created:
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
