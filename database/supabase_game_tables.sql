-- =============================================
-- GAME TABLES SCHEMA
-- Run this in Supabase SQL Editor
-- These tables track student game progress
-- =============================================

-- 1. Game Scores Table (tracks highest scores per game)
CREATE TABLE IF NOT EXISTS game_scores (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    game_type TEXT NOT NULL, -- 'fault_roulette', 'service_writer', 'cross_system', 'tool_selection'
    difficulty TEXT NOT NULL DEFAULT 'easy', -- 'easy', 'medium', 'hard'
    score INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Game Plays Table (tracks each game session)
CREATE TABLE IF NOT EXISTS game_plays (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    game_type TEXT NOT NULL,
    difficulty TEXT NOT NULL DEFAULT 'easy',
    completed BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_game_scores_user ON game_scores(user_id);
CREATE INDEX IF NOT EXISTS idx_game_scores_game ON game_scores(game_type);
CREATE INDEX IF NOT EXISTS idx_game_plays_user ON game_plays(user_id);
CREATE INDEX IF NOT EXISTS idx_game_plays_game ON game_plays(game_type);

-- Enable RLS
ALTER TABLE game_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_plays ENABLE ROW LEVEL SECURITY;

-- RLS Policies for game_scores
DROP POLICY IF EXISTS "Users can insert own scores" ON game_scores;
DROP POLICY IF EXISTS "Users can view all scores" ON game_scores;

CREATE POLICY "Users can insert own scores"
ON game_scores FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view all scores"
ON game_scores FOR SELECT TO authenticated
USING (true);

-- RLS Policies for game_plays
DROP POLICY IF EXISTS "Users can insert own plays" ON game_plays;
DROP POLICY IF EXISTS "Users can view all plays" ON game_plays;

CREATE POLICY "Users can insert own plays"
ON game_plays FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view all plays"
ON game_plays FOR SELECT TO authenticated
USING (true);

-- Verify tables were created
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name IN ('game_scores', 'game_plays');
