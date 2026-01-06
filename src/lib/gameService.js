import { supabase } from './supabase';

// Daily play limits per difficulty
export const DAILY_LIMITS = {
    easy: 5,
    medium: 5,
    hard: 2
};

// Score multipliers per difficulty
export const SCORE_MULTIPLIERS = {
    easy: 1,
    medium: 1.5,
    hard: 2
};

/**
 * Get remaining plays for today (PH timezone via Supabase server time)
 */
export const getRemainingPlays = async (userId, gameType) => {
    try {
        // Get current PH date from Supabase (Asia/Manila)
        const { data: serverTime } = await supabase.rpc('get_ph_date');
        const today = serverTime || new Date().toISOString().split('T')[0];

        const { data, error } = await supabase
            .from('daily_plays')
            .select('difficulty, play_count')
            .eq('user_id', userId)
            .eq('game_type', gameType)
            .eq('play_date', today);

        if (error) throw error;

        // Calculate remaining plays
        const remaining = {
            easy: DAILY_LIMITS.easy,
            medium: DAILY_LIMITS.medium,
            hard: DAILY_LIMITS.hard
        };

        if (data) {
            data.forEach(row => {
                remaining[row.difficulty] = Math.max(0, DAILY_LIMITS[row.difficulty] - row.play_count);
            });
        }

        return remaining;
    } catch (error) {
        console.error('Error getting remaining plays:', error);
        // Return full limits on error (fail-open for playability)
        return { easy: DAILY_LIMITS.easy, medium: DAILY_LIMITS.medium, hard: DAILY_LIMITS.hard };
    }
};

/**
 * Record a play (increment daily counter)
 */
export const recordPlay = async (userId, gameType, difficulty) => {
    try {
        const { data: serverTime } = await supabase.rpc('get_ph_date');
        const today = serverTime || new Date().toISOString().split('T')[0];

        // Try to upsert (insert or increment)
        const { error } = await supabase.rpc('increment_play_count', {
            p_user_id: userId,
            p_game_type: gameType,
            p_difficulty: difficulty,
            p_play_date: today
        });

        if (error) throw error;
        return true;
    } catch (error) {
        console.error('Error recording play:', error);
        return false;
    }
};

/**
 * Submit a game score
 */
export const submitScore = async (userId, gameType, difficulty, score) => {
    console.log('submitScore called with:', { userId, gameType, difficulty, score });

    if (!userId) {
        console.error('submitScore: userId is missing!');
        return false;
    }

    try {
        // Insert into game_scores
        const { data, error } = await supabase
            .from('game_scores')
            .insert({
                user_id: userId,
                game_type: gameType,
                difficulty: difficulty,
                score: Math.round(score)
            })
            .select();

        if (error) {
            console.error('submitScore error:', error);
            throw error;
        }

        console.log('submitScore success:', data);

        // Also insert into game_plays for professor tracking
        try {
            await supabase
                .from('game_plays')
                .insert({
                    user_id: userId,
                    game_type: gameType,
                    difficulty: difficulty
                });
            console.log('game_plays recorded successfully');
        } catch (playError) {
            // Log but don't fail if game_plays insert fails
            console.warn('game_plays insert failed (non-critical):', playError);
        }

        return true;
    } catch (error) {
        console.error('Error submitting score:', error);
        return false;
    }
};

/**
 * Get leaderboard (top 10 + current user's rank) - shows best score per user
 * @param {string} gameType - Game type
 * @param {string} difficulty - Difficulty level
 * @param {string} currentUserId - Current user ID
 * @param {string|null} sectionFilter - If provided, only show users from this section
 */
export const getLeaderboard = async (gameType, difficulty, currentUserId, sectionFilter = null) => {
    try {
        // Get ALL scores for this game/difficulty
        const { data: allScores, error: topError } = await supabase
            .from('game_scores')
            .select('score, created_at, user_id')
            .eq('game_type', gameType)
            .eq('difficulty', difficulty);

        if (topError) throw topError;

        // Aggregate to get TOTAL score per user (sum all their scores)
        const userTotalScores = {};
        allScores?.forEach(entry => {
            const uid = entry.user_id;
            if (!userTotalScores[uid]) {
                userTotalScores[uid] = {
                    user_id: uid,
                    score: 0,
                    gamesPlayed: 0,
                    created_at: entry.created_at
                };
            }
            userTotalScores[uid].score += entry.score;
            userTotalScores[uid].gamesPlayed += 1;
        });

        // Fetch profiles for ALL users (need section info for filtering)
        const userIds = Object.keys(userTotalScores);
        let profilesMap = {};

        if (userIds.length > 0) {
            const { data: profiles } = await supabase
                .from('profiles')
                .select('id, full_name, email, section')
                .in('id', userIds);

            profiles?.forEach(p => {
                profilesMap[p.id] = p;
            });
        }

        // Convert to array with profiles
        let sortedScores = Object.values(userTotalScores)
            .map(score => ({
                ...score,
                profiles: profilesMap[score.user_id] || { full_name: null, email: 'Unknown', section: null }
            }));

        // Apply section filter if provided
        if (sectionFilter) {
            sortedScores = sortedScores.filter(s => s.profiles.section === sectionFilter);
        }

        // Sort by total score descending and take top 10
        sortedScores = sortedScores
            .sort((a, b) => b.score - a.score)
            .slice(0, 10);

        // Get current user's total score and rank (within filtered set)
        let userRank = null;
        let userTotalScore = null;

        if (currentUserId && userTotalScores[currentUserId]) {
            const userSection = profilesMap[currentUserId]?.section;
            // Only calculate rank if user is in same section (or no section filter)
            if (!sectionFilter || userSection === sectionFilter) {
                userTotalScore = userTotalScores[currentUserId].score;

                // Get all users for rank calculation (filtered if section filter active)
                let allForRanking = Object.values(userTotalScores)
                    .map(u => ({
                        ...u,
                        profiles: profilesMap[u.user_id] || { section: null }
                    }));

                if (sectionFilter) {
                    allForRanking = allForRanking.filter(u => u.profiles.section === sectionFilter);
                }

                allForRanking.sort((a, b) => b.score - a.score);
                const userIndex = allForRanking.findIndex(u => u.user_id === currentUserId);
                userRank = userIndex !== -1 ? userIndex + 1 : null;
            }
        }

        return {
            topScores: sortedScores,
            userRank,
            userBestScore: userTotalScore
        };
    } catch (error) {
        console.error('Error getting leaderboard:', error);
        return { topScores: [], userRank: null, userBestScore: null };
    }
};

/**
 * Get overall leaderboard - total points across ALL games
 * @param {string} currentUserId - Current user ID
 * @param {string|null} sectionFilter - If provided, only show users from this section
 */
export const getOverallLeaderboard = async (currentUserId, sectionFilter = null) => {
    try {
        // Get all scores (without profile join)
        const { data: allScores, error } = await supabase
            .from('game_scores')
            .select('user_id, score');

        if (error) throw error;

        // Aggregate scores by user
        const userTotals = {};
        allScores?.forEach(entry => {
            const uid = entry.user_id;
            if (!userTotals[uid]) {
                userTotals[uid] = {
                    user_id: uid,
                    totalScore: 0,
                    gamesPlayed: 0
                };
            }
            userTotals[uid].totalScore += entry.score;
            userTotals[uid].gamesPlayed += 1;
        });

        // Get all unique user IDs
        const userIds = Object.keys(userTotals);
        let profilesMap = {};

        if (userIds.length > 0) {
            const { data: profiles } = await supabase
                .from('profiles')
                .select('id, full_name, email, section')
                .in('id', userIds);

            profiles?.forEach(p => {
                profilesMap[p.id] = p;
            });
        }

        // Convert to array, add profiles, and filter by section if needed
        let sortedUsers = Object.values(userTotals)
            .map(u => ({
                ...u,
                profiles: profilesMap[u.user_id] || { full_name: null, email: 'Unknown', section: null }
            }));

        // Apply section filter if provided
        if (sectionFilter) {
            sortedUsers = sortedUsers.filter(u => u.profiles.section === sectionFilter);
        }

        // Sort by total score
        sortedUsers.sort((a, b) => b.totalScore - a.totalScore);

        // Get top 10
        const topScores = sortedUsers.slice(0, 10).map(u => ({
            user_id: u.user_id,
            score: u.totalScore,
            gamesPlayed: u.gamesPlayed,
            profiles: u.profiles
        }));

        // Get current user's rank and score
        let userRank = null;
        let userBestScore = null;

        if (currentUserId) {
            const userIndex = sortedUsers.findIndex(u => u.user_id === currentUserId);
            if (userIndex !== -1) {
                userRank = userIndex + 1;
                userBestScore = sortedUsers[userIndex].totalScore;
            }
        }

        return {
            topScores,
            userRank,
            userBestScore
        };
    } catch (error) {
        console.error('Error getting overall leaderboard:', error);
        return { topScores: [], userRank: null, userBestScore: null };
    }
};
