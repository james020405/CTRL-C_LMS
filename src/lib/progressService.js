import { supabase } from './supabase';

/**
 * Get comprehensive stats for a student's progress
 */
export const getStudentProgress = async (userId) => {
    try {
        // Get all game scores for this user
        const { data: scores, error } = await supabase
            .from('game_scores')
            .select('game_type, difficulty, score, created_at')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Calculate totals
        const totalPoints = scores?.reduce((sum, s) => sum + s.score, 0) || 0;
        const gamesPlayed = scores?.length || 0;

        // Breakdown by game
        const gameBreakdown = {};
        const gameTypes = ['fault_roulette', 'service_writer', 'cross_system', 'tool_selection'];
        gameTypes.forEach(type => {
            const gameScores = scores?.filter(s => s.game_type === type) || [];
            gameBreakdown[type] = {
                gamesPlayed: gameScores.length,
                totalPoints: gameScores.reduce((sum, s) => sum + s.score, 0),
                bestScore: Math.max(...gameScores.map(s => s.score), 0),
                avgScore: gameScores.length > 0
                    ? Math.round(gameScores.reduce((sum, s) => sum + s.score, 0) / gameScores.length)
                    : 0
            };
        });

        // Last 7 days activity
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const dailyActivity = {};
        for (let i = 0; i < 7; i++) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            dailyActivity[dateStr] = { points: 0, games: 0 };
        }

        scores?.forEach(score => {
            const dateStr = score.created_at.split('T')[0];
            if (dailyActivity[dateStr]) {
                dailyActivity[dateStr].points += score.score;
                dailyActivity[dateStr].games += 1;
            }
        });

        // Convert to array sorted by date
        const activityChart = Object.entries(dailyActivity)
            .map(([date, data]) => ({
                date,
                dayName: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
                ...data
            }))
            .reverse();

        // Difficulty breakdown
        const difficultyStats = {
            easy: scores?.filter(s => s.difficulty === 'easy').length || 0,
            medium: scores?.filter(s => s.difficulty === 'medium').length || 0,
            hard: scores?.filter(s => s.difficulty === 'hard').length || 0
        };

        return {
            totalPoints,
            gamesPlayed,
            gameBreakdown,
            activityChart,
            difficultyStats,
            recentScores: scores?.slice(0, 5) || []
        };
    } catch (error) {
        console.error('Error fetching student progress:', error);
        return {
            totalPoints: 0,
            gamesPlayed: 0,
            gameBreakdown: {},
            activityChart: [],
            difficultyStats: { easy: 0, medium: 0, hard: 0 },
            recentScores: []
        };
    }
};

/**
 * Get class ranking for a student
 */
export const getClassRank = async (userId) => {
    try {
        // Get all users' total scores
        const { data: allScores, error } = await supabase
            .from('game_scores')
            .select('user_id, score');

        if (error) throw error;

        // Aggregate by user
        const userTotals = {};
        allScores?.forEach(score => {
            if (!userTotals[score.user_id]) {
                userTotals[score.user_id] = 0;
            }
            userTotals[score.user_id] += score.score;
        });

        // Sort and find rank
        const sorted = Object.entries(userTotals)
            .sort((a, b) => b[1] - a[1]);

        const userIndex = sorted.findIndex(([uid]) => uid === userId);
        const totalStudents = sorted.length;

        return {
            rank: userIndex !== -1 ? userIndex + 1 : null,
            totalStudents,
            percentile: userIndex !== -1
                ? Math.round((1 - userIndex / totalStudents) * 100)
                : 0
        };
    } catch (error) {
        console.error('Error fetching class rank:', error);
        return { rank: null, totalStudents: 0, percentile: 0 };
    }
};

/**
 * Check which badges a user has earned
 */
export const checkBadges = (progress, classRank) => {
    const earned = [];

    // Points-based badges
    if (progress.totalPoints >= 100) earned.push('first_century');
    if (progress.totalPoints >= 500) earned.push('half_thousand');
    if (progress.totalPoints >= 1000) earned.push('thousand_club');
    if (progress.totalPoints >= 5000) earned.push('five_thousand');

    // Games played badges
    if (progress.gamesPlayed >= 1) earned.push('first_game');
    if (progress.gamesPlayed >= 10) earned.push('ten_games');
    if (progress.gamesPlayed >= 50) earned.push('fifty_games');
    if (progress.gamesPlayed >= 100) earned.push('hundred_games');

    // Difficulty badges
    if (progress.difficultyStats.hard >= 1) earned.push('first_hard');
    if (progress.difficultyStats.hard >= 10) earned.push('hard_challenger');
    if (progress.difficultyStats.medium >= 10) earned.push('medium_master');

    // Rank badges
    if (classRank.rank === 1) earned.push('top_student');
    if (classRank.rank <= 3) earned.push('podium_finish');
    if (classRank.percentile >= 90) earned.push('top_ten_percent');

    // Game variety badges
    const gamesWithScores = Object.values(progress.gameBreakdown)
        .filter(g => g.gamesPlayed > 0).length;
    if (gamesWithScores >= 2) earned.push('multi_game');
    if (gamesWithScores >= 4) earned.push('all_rounder');

    return earned;
};
