import { supabase } from './supabase';

// =============================================
// PROFESSOR FUNCTIONS
// =============================================

/**
 * Create a new activity for a course
 */
export const createActivity = async (courseId, activityData) => {
    const { data, error } = await supabase
        .from('activities')
        .insert({
            course_id: courseId,
            title: activityData.title,
            description: activityData.description,
            type: activityData.type || 'assignment',
            max_score: activityData.maxScore || 100,
            deadline: activityData.deadline,
            allow_late: activityData.allowLate || false,
            attachment_url: activityData.attachmentUrl || null
        })
        .select()
        .single();

    if (error) throw error;
    return data;
};

/**
 * Update an existing activity
 */
export const updateActivity = async (activityId, updates) => {
    const { data, error } = await supabase
        .from('activities')
        .update({
            title: updates.title,
            description: updates.description,
            type: updates.type,
            max_score: updates.maxScore,
            deadline: updates.deadline,
            allow_late: updates.allowLate,
            attachment_url: updates.attachmentUrl || null,
            updated_at: new Date().toISOString()
        })
        .eq('id', activityId)
        .select()
        .single();

    if (error) throw error;
    return data;
};

/**
 * Delete an activity
 */
export const deleteActivity = async (activityId) => {
    const { error } = await supabase
        .from('activities')
        .delete()
        .eq('id', activityId);

    if (error) throw error;
    return true;
};

/**
 * Get all activities for a course (professor view)
 */
export const getActivitiesForCourse = async (courseId) => {
    const { data, error } = await supabase
        .from('activities')
        .select('*')
        .eq('course_id', courseId)
        .order('deadline', { ascending: true });

    if (error) throw error;
    return data || [];
};

/**
 * Get activity with submission stats
 */
export const getActivityWithStats = async (activityId, enrolledCount) => {
    const { data: activity, error: actError } = await supabase
        .from('activities')
        .select('*')
        .eq('id', activityId)
        .single();

    if (actError) throw actError;

    const { data: submissions, error: subError } = await supabase
        .from('activity_submissions')
        .select('id, status, score')
        .eq('activity_id', activityId);

    if (subError) throw subError;

    const submissionCount = submissions?.length || 0;
    const gradedCount = submissions?.filter(s => s.status === 'graded').length || 0;
    const avgScore = gradedCount > 0
        ? Math.round(submissions.filter(s => s.score !== null).reduce((sum, s) => sum + s.score, 0) / gradedCount)
        : null;

    return {
        ...activity,
        submissionCount,
        gradedCount,
        averageScore: avgScore,
        enrolledCount: enrolledCount || 0
    };
};

/**
 * Get all submissions for an activity (professor)
 */
export const getActivitySubmissions = async (activityId) => {
    // Get submissions first
    const { data: submissions, error: subError } = await supabase
        .from('activity_submissions')
        .select('*')
        .eq('activity_id', activityId)
        .order('submitted_at', { ascending: false });

    if (subError) throw subError;
    if (!submissions || submissions.length === 0) return [];

    // Get unique student IDs
    const studentIds = [...new Set(submissions.map(s => s.student_id))];

    // Fetch profiles for these students
    const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .in('id', studentIds);

    if (profileError) {
        console.error('Error fetching profiles:', profileError);
        // Return submissions without profile info if profile fetch fails
        return submissions.map(s => ({ ...s, profiles: null }));
    }

    // Merge profiles into submissions
    return submissions.map(sub => {
        const profile = profiles?.find(p => p.id === sub.student_id);
        return {
            ...sub,
            profiles: profile || null
        };
    });
};

/**
 * Grade a submission
 */
export const gradeSubmission = async (submissionId, score, feedback) => {
    const { data, error } = await supabase
        .from('activity_submissions')
        .update({
            score,
            feedback,
            status: 'graded',
            graded_at: new Date().toISOString()
        })
        .eq('id', submissionId)
        .select()
        .single();

    if (error) throw error;
    return data;
};

// =============================================
// STUDENT FUNCTIONS
// =============================================

/**
 * Get activities for an enrolled course (student view)
 */
export const getStudentActivities = async (courseId, studentId) => {
    // Get all activities for the course
    const { data: activities, error: actError } = await supabase
        .from('activities')
        .select('*')
        .eq('course_id', courseId)
        .order('deadline', { ascending: true });

    if (actError) throw actError;

    // Get student's submissions for these activities
    const activityIds = activities?.map(a => a.id) || [];

    if (activityIds.length === 0) return [];

    const { data: submissions, error: subError } = await supabase
        .from('activity_submissions')
        .select('*')
        .eq('student_id', studentId)
        .in('activity_id', activityIds);

    if (subError) throw subError;

    // Merge activities with submission status
    return activities.map(activity => {
        const submission = submissions?.find(s => s.activity_id === activity.id);
        const now = new Date();
        const deadline = new Date(activity.deadline);
        const isOverdue = now > deadline;

        return {
            ...activity,
            submission: submission || null,
            isOverdue,
            canSubmit: !isOverdue || activity.allow_late,
            status: submission
                ? submission.status
                : isOverdue
                    ? 'overdue'
                    : 'pending'
        };
    });
};

/**
 * Submit to an activity
 */
export const submitActivity = async (activityId, studentId, content, fileUrl = null) => {
    // Check if activity allows late submission
    const { data: activity, error: actError } = await supabase
        .from('activities')
        .select('deadline, allow_late')
        .eq('id', activityId)
        .single();

    if (actError) throw actError;

    const now = new Date();
    const deadline = new Date(activity.deadline);
    const isLate = now > deadline;

    if (isLate && !activity.allow_late) {
        throw new Error('This activity no longer accepts submissions.');
    }

    const { data, error } = await supabase
        .from('activity_submissions')
        .upsert({
            activity_id: activityId,
            student_id: studentId,
            content,
            file_url: fileUrl,
            status: isLate ? 'late' : 'submitted',
            submitted_at: new Date().toISOString()
        }, {
            onConflict: 'activity_id,student_id'
        })
        .select()
        .single();

    if (error) throw error;
    return data;
};

/**
 * Get student's submission for an activity
 */
export const getMySubmission = async (activityId, studentId) => {
    const { data, error } = await supabase
        .from('activity_submissions')
        .select('*')
        .eq('activity_id', activityId)
        .eq('student_id', studentId)
        .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
};

/**
 * Get activity details
 */
export const getActivityById = async (activityId) => {
    const { data, error } = await supabase
        .from('activities')
        .select(`
            *,
            courses (
                title,
                professor_id
            )
        `)
        .eq('id', activityId)
        .single();

    if (error) throw error;
    return data;
};
