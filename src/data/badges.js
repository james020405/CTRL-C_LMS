import {
    Trophy, Star, Crown, Zap, Gamepad2, Flame, BookOpen, Medal,
    Target, Award, Heart, Shield, Sparkles, TrendingUp, Users
} from 'lucide-react';

/**
 * Badge definitions for achievements - using Lucide icons
 */
export const BADGES = {
    // Points badges
    first_century: {
        id: 'first_century',
        name: 'First Century',
        description: 'Earn 100 points',
        Icon: Trophy,
        color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
        iconColor: 'text-green-600',
        requirement: 100
    },
    half_thousand: {
        id: 'half_thousand',
        name: 'Rising Star',
        description: 'Earn 500 points',
        Icon: Star,
        color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
        iconColor: 'text-yellow-600',
        requirement: 500
    },
    thousand_club: {
        id: 'thousand_club',
        name: 'Thousand Club',
        description: 'Earn 1,000 points',
        Icon: Award,
        color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
        iconColor: 'text-amber-600',
        requirement: 1000
    },
    five_thousand: {
        id: 'five_thousand',
        name: 'Point Master',
        description: 'Earn 5,000 points',
        Icon: Crown,
        color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
        iconColor: 'text-purple-600',
        requirement: 5000
    },

    // Games played badges
    first_game: {
        id: 'first_game',
        name: 'First Steps',
        description: 'Complete your first game',
        Icon: Gamepad2,
        color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
        iconColor: 'text-blue-600',
        requirement: 1
    },
    ten_games: {
        id: 'ten_games',
        name: 'Getting Warmed Up',
        description: 'Play 10 games',
        Icon: Flame,
        color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
        iconColor: 'text-orange-600',
        requirement: 10
    },
    fifty_games: {
        id: 'fifty_games',
        name: 'Dedicated Learner',
        description: 'Play 50 games',
        Icon: BookOpen,
        color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
        iconColor: 'text-indigo-600',
        requirement: 50
    },
    hundred_games: {
        id: 'hundred_games',
        name: 'Game Veteran',
        description: 'Play 100 games',
        Icon: Medal,
        color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
        iconColor: 'text-slate-600',
        requirement: 100
    },

    // Difficulty badges
    first_hard: {
        id: 'first_hard',
        name: 'Brave Heart',
        description: 'Complete a hard difficulty game',
        Icon: Heart,
        color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
        iconColor: 'text-red-600',
        requirement: 'hard'
    },
    hard_challenger: {
        id: 'hard_challenger',
        name: 'Hard Challenger',
        description: 'Complete 10 hard games',
        Icon: Target,
        color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
        iconColor: 'text-red-600',
        requirement: 10
    },
    medium_master: {
        id: 'medium_master',
        name: 'Medium Master',
        description: 'Complete 10 medium games',
        Icon: Shield,
        color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
        iconColor: 'text-yellow-600',
        requirement: 10
    },

    // Rank badges
    top_student: {
        id: 'top_student',
        name: 'Top Student',
        description: 'Rank #1 in the class',
        Icon: Crown,
        color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
        iconColor: 'text-yellow-600',
        requirement: 1
    },
    podium_finish: {
        id: 'podium_finish',
        name: 'Podium Finish',
        description: 'Rank top 3 in the class',
        Icon: Medal,
        color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
        iconColor: 'text-amber-600',
        requirement: 3
    },
    top_ten_percent: {
        id: 'top_ten_percent',
        name: 'Elite Performer',
        description: 'Top 10% of class',
        Icon: Sparkles,
        color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
        iconColor: 'text-purple-600',
        requirement: '10%'
    },

    // Variety badges
    multi_game: {
        id: 'multi_game',
        name: 'Multi-Talented',
        description: 'Score points in 2+ different games',
        Icon: TrendingUp,
        color: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
        iconColor: 'text-teal-600',
        requirement: 2
    },
    all_rounder: {
        id: 'all_rounder',
        name: 'All-Rounder',
        description: 'Score points in all 4 games',
        Icon: Users,
        color: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
        iconColor: 'text-pink-600',
        requirement: 4
    }
};

export const BADGE_CATEGORIES = {
    points: ['first_century', 'half_thousand', 'thousand_club', 'five_thousand'],
    games: ['first_game', 'ten_games', 'fifty_games', 'hundred_games'],
    difficulty: ['first_hard', 'hard_challenger', 'medium_master'],
    rank: ['top_student', 'podium_finish', 'top_ten_percent'],
    variety: ['multi_game', 'all_rounder']
};
