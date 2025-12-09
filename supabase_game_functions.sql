-- Run this in Supabase SQL Editor

-- Function to get current PH date
CREATE OR REPLACE FUNCTION get_ph_date()
RETURNS DATE AS $$
BEGIN
  RETURN (NOW() AT TIME ZONE 'Asia/Manila')::DATE;
END;
$$ LANGUAGE plpgsql;

-- Function to increment play count (upsert)
CREATE OR REPLACE FUNCTION increment_play_count(
  p_user_id UUID,
  p_game_type TEXT,
  p_difficulty TEXT,
  p_play_date DATE
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO daily_plays (user_id, game_type, difficulty, play_date, play_count)
  VALUES (p_user_id, p_game_type, p_difficulty, p_play_date, 1)
  ON CONFLICT (user_id, game_type, difficulty, play_date)
  DO UPDATE SET play_count = daily_plays.play_count + 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_ph_date() TO authenticated;
GRANT EXECUTE ON FUNCTION increment_play_count(UUID, TEXT, TEXT, DATE) TO authenticated;
