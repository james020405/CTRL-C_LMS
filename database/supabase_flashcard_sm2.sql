-- Run this in Supabase SQL Editor to add SM-2 columns to student_flashcards

-- Add new SM-2 algorithm columns
ALTER TABLE student_flashcards ADD COLUMN IF NOT EXISTS ease_factor REAL DEFAULT 2.5;
ALTER TABLE student_flashcards ADD COLUMN IF NOT EXISTS interval_days INTEGER DEFAULT 0;
ALTER TABLE student_flashcards ADD COLUMN IF NOT EXISTS repetitions INTEGER DEFAULT 0;

-- Update existing cards to have default values
UPDATE student_flashcards 
SET 
    ease_factor = COALESCE(ease_factor, 2.5),
    interval_days = COALESCE(interval_days, 0),
    repetitions = COALESCE(repetitions, 0)
WHERE ease_factor IS NULL OR interval_days IS NULL OR repetitions IS NULL;

-- Optional: Remove old 'box' column if you want to clean up
-- ALTER TABLE student_flashcards DROP COLUMN IF EXISTS box;
