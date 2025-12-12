/**
 * SM-2 Spaced Repetition Algorithm
 * Based on the SuperMemo SM-2 algorithm used by Anki
 */

// Quality ratings
export const RATING = {
    AGAIN: 1,  // Complete blackout, reset
    HARD: 2,   // Struggled but got it
    GOOD: 3,   // Correct with some effort
    EASY: 4    // Instant recall
};

// Default values for new cards
export const DEFAULT_EASE = 2.5;
export const MIN_EASE = 1.3;

/**
 * Calculate next review based on SM-2 algorithm
 * @param {Object} card - Current card state
 * @param {number} rating - User rating (1-4)
 * @returns {Object} - Updated card state with next review date
 */
export function calculateNextReview(card, rating) {
    let {
        ease_factor = DEFAULT_EASE,
        interval_days = 0,
        repetitions = 0
    } = card;

    let newInterval;
    let newEase = ease_factor;
    let newReps = repetitions;

    if (rating === RATING.AGAIN) {
        // Failed - reset to beginning
        newInterval = 0.000694; // ~1 minute (1/1440 days)
        newEase = Math.max(MIN_EASE, ease_factor - 0.2);
        newReps = 0;
    } else if (rating === RATING.HARD) {
        // Hard
        if (repetitions === 0) {
            newInterval = 0.00486; // ~7 minutes (7/1440 days) for first review
        } else {
            // For existing, just 1.2x (min 1 day) behavior, or keep it fractional if it was already fractional?
            // Let's stick to days for graduated cards.
            // If current interval is small (<1 day), graduate to 1 day?
            // Anki behavior: Hard on learning card -> avg of steps?
            // Let's keep it simple: Hard on graduated -> 1.2x. Hard on learning (<1 day) -> 1 day (graduate).
            newInterval = Math.max(1, Math.round(interval_days * 1.2));
        }
        newEase = Math.max(MIN_EASE, ease_factor - 0.15);
        newReps = repetitions + 1;
    } else if (rating === RATING.GOOD) {
        // Good - normal interval increase
        if (repetitions === 0) {
            newInterval = 1; // 1 day
        } else if (repetitions === 1) {
            newInterval = 6; // 6 days
        } else {
            newInterval = Math.round(interval_days * ease_factor);
        }
        newReps = repetitions + 1;
    } else if (rating === RATING.EASY) {
        // Easy - larger interval, ease bonus
        if (repetitions === 0) {
            newInterval = 4; // 4 days
        } else {
            newInterval = Math.round(interval_days * ease_factor * 1.3);
        }
        newEase = ease_factor + 0.15;
        newReps = repetitions + 1;
    }

    // Calculate next review date
    const nextReviewDate = new Date();
    // Add interval (in days)
    nextReviewDate.setTime(nextReviewDate.getTime() + (newInterval * 24 * 60 * 60 * 1000));

    return {
        ease_factor: Math.round(newEase * 100) / 100,
        interval_days: newInterval,
        repetitions: newReps,
        next_review_date: nextReviewDate.toISOString()
    };
}

/**
 * Get preview intervals for each rating option
 * @param {Object} card - Current card state
 * @returns {Object} - Intervals for each rating
 */
export function getIntervalPreviews(card) {
    const previews = {};

    Object.entries(RATING).forEach(([name, value]) => {
        const result = calculateNextReview(card, value);
        previews[name.toLowerCase()] = formatInterval(result.interval_days);
    });

    return previews;
}

/**
 * Format interval for display
 */
export function formatInterval(days) {
    if (days < 0.001) return '1 min';        // ~1 min (0.00069)
    if (days < 0.01) return Math.round(days * 24 * 60) + ' min'; // e.g. 7 min
    if (days < 1) return Math.round(days * 24) + ' hr';
    if (days === 1) return '1 day';
    if (days < 30) return `${Math.round(days)} days`;
    if (days < 365) return `${Math.round(days / 30)} mo`;
    return `${Math.round(days / 365)} yr`;
}
