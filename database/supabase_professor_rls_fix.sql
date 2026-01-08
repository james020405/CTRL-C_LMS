-- =============================================
-- PROFESSOR RLS POLICIES FIX
-- Run this in Supabase SQL Editor
-- =============================================

-- 1. TOPICS TABLE - Allow professors to create topics for their courses
-- First, drop existing policies if they exist (ignore errors if they don't)
DROP POLICY IF EXISTS "Professors can insert topics for their courses" ON topics;
DROP POLICY IF EXISTS "Professors can update topics for their courses" ON topics;
DROP POLICY IF EXISTS "Professors can delete topics for their courses" ON topics;
DROP POLICY IF EXISTS "Anyone can view topics" ON topics;

-- Enable RLS on topics table if not already enabled
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;

-- Professors can insert topics ONLY for courses they own
CREATE POLICY "Professors can insert topics for their courses"
ON topics FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM courses
    WHERE courses.id = topics.course_id
    AND courses.professor_id = auth.uid()
  )
);

-- Professors can update their own course topics
CREATE POLICY "Professors can update topics for their courses"
ON topics FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM courses
    WHERE courses.id = topics.course_id
    AND courses.professor_id = auth.uid()
  )
);

-- Professors can delete their own course topics
CREATE POLICY "Professors can delete topics for their courses"
ON topics FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM courses
    WHERE courses.id = topics.course_id
    AND courses.professor_id = auth.uid()
  )
);

-- Everyone can view topics (students need to see course content)
CREATE POLICY "Anyone can view topics"
ON topics FOR SELECT
TO authenticated
USING (true);


-- =============================================
-- 2. MATERIALS TABLE - Allow professors to manage materials
-- =============================================
DROP POLICY IF EXISTS "Professors can insert materials" ON materials;
DROP POLICY IF EXISTS "Professors can update materials" ON materials;
DROP POLICY IF EXISTS "Professors can delete materials" ON materials;
DROP POLICY IF EXISTS "Anyone can view materials" ON materials;

-- Enable RLS on materials table
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;

-- Professors can insert materials for topics in their courses
CREATE POLICY "Professors can insert materials"
ON materials FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM topics
    JOIN courses ON courses.id = topics.course_id
    WHERE topics.id = materials.topic_id
    AND courses.professor_id = auth.uid()
  )
);

-- Professors can update materials in their courses
CREATE POLICY "Professors can update materials"
ON materials FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM topics
    JOIN courses ON courses.id = topics.course_id
    WHERE topics.id = materials.topic_id
    AND courses.professor_id = auth.uid()
  )
);

-- Professors can delete materials in their courses
CREATE POLICY "Professors can delete materials"
ON materials FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM topics
    JOIN courses ON courses.id = topics.course_id
    WHERE topics.id = materials.topic_id
    AND courses.professor_id = auth.uid()
  )
);

-- Students can view materials
CREATE POLICY "Anyone can view materials"
ON materials FOR SELECT
TO authenticated
USING (true);


-- =============================================
-- 3. COURSES TABLE - Ensure professors can manage their courses
-- =============================================
DROP POLICY IF EXISTS "Professors can insert courses" ON courses;
DROP POLICY IF EXISTS "Professors can update their courses" ON courses;
DROP POLICY IF EXISTS "Professors can delete their courses" ON courses;
DROP POLICY IF EXISTS "Anyone can view courses" ON courses;

-- Enable RLS
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

-- Professors can create courses
CREATE POLICY "Professors can insert courses"
ON courses FOR INSERT
TO authenticated
WITH CHECK (professor_id = auth.uid());

-- Professors can update their own courses
CREATE POLICY "Professors can update their courses"
ON courses FOR UPDATE
TO authenticated
USING (professor_id = auth.uid());

-- Professors can delete their own courses
CREATE POLICY "Professors can delete their courses"
ON courses FOR DELETE
TO authenticated
USING (professor_id = auth.uid());

-- Everyone can view courses
CREATE POLICY "Anyone can view courses"
ON courses FOR SELECT
TO authenticated
USING (true);


-- =============================================
-- VERIFICATION - Run these to check policies
-- =============================================
-- SELECT * FROM pg_policies WHERE tablename IN ('courses', 'topics', 'materials');
