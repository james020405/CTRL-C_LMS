-- =============================================
-- COURSE ENROLLMENT FUNCTIONS AND POLICIES
-- Run this in Supabase SQL Editor
-- =============================================

-- Increment student count when joining
CREATE OR REPLACE FUNCTION increment_student_count(course_uuid UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE courses
    SET student_count = student_count + 1
    WHERE id = course_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Decrement student count when leaving
CREATE OR REPLACE FUNCTION decrement_student_count(course_uuid UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE courses
    SET student_count = GREATEST(0, student_count - 1)
    WHERE id = course_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION increment_student_count(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION decrement_student_count(UUID) TO authenticated;

-- =============================================
-- RLS POLICY FOR DELETING ENROLLMENTS
-- =============================================

-- Students can leave courses (delete their own enrollment)
DROP POLICY IF EXISTS "Students can leave courses" ON course_enrollments;
CREATE POLICY "Students can leave courses"
ON course_enrollments FOR DELETE TO authenticated
USING (user_id = auth.uid());

-- Professors can remove students from their courses
DROP POLICY IF EXISTS "Professors can remove students" ON course_enrollments;
CREATE POLICY "Professors can remove students"
ON course_enrollments FOR DELETE TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM courses
        WHERE courses.id = course_enrollments.course_id
        AND courses.professor_id = auth.uid()
    )
);

-- =============================================
-- SELECT POLICIES (Required for DELETE to work)
-- =============================================

-- Students can see their own enrollments
DROP POLICY IF EXISTS "Students can view own enrollments" ON course_enrollments;
CREATE POLICY "Students can view own enrollments"
ON course_enrollments FOR SELECT TO authenticated
USING (user_id = auth.uid());

-- Professors can see enrollments in their courses
DROP POLICY IF EXISTS "Professors can view course enrollments" ON course_enrollments;
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
-- INSERT POLICY  
-- =============================================

-- Students can enroll themselves
DROP POLICY IF EXISTS "Students can enroll in courses" ON course_enrollments;
CREATE POLICY "Students can enroll in courses"
ON course_enrollments FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

-- Verify
SELECT 'All enrollment policies created!' AS status;
