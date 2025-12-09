import { describe, it, expect } from 'vitest';
import {
    calculateNextReview,
    getIntervalPreviews,
    formatInterval,
    RATING,
    DEFAULT_EASE,
    MIN_EASE
} from '../spacedRepetition';

describe('Spaced Repetition Algorithm (SM-2)', () => {
    describe('RATING constants', () => {
        it('should have correct rating values', () => {
            expect(RATING.AGAIN).toBe(1);
            expect(RATING.HARD).toBe(2);
            expect(RATING.GOOD).toBe(3);
            expect(RATING.EASY).toBe(4);
        });
    });

    describe('DEFAULT_EASE and MIN_EASE', () => {
        it('should have correct default values', () => {
            expect(DEFAULT_EASE).toBe(2.5);
            expect(MIN_EASE).toBe(1.3);
        });
    });

    describe('calculateNextReview', () => {
        const newCard = {
            ease_factor: DEFAULT_EASE,
            interval_days: 0,
            repetitions: 0
        };

        describe('AGAIN rating', () => {
            it('should reset interval and reduce ease', () => {
                const result = calculateNextReview(newCard, RATING.AGAIN);

                expect(result.interval_days).toBe(0);
                expect(result.repetitions).toBe(0);
                expect(result.ease_factor).toBe(2.3); // 2.5 - 0.2
                expect(result.next_review_date).toBeDefined();
            });

            it('should not reduce ease below MIN_EASE', () => {
                const lowEaseCard = { ...newCard, ease_factor: 1.4 };
                const result = calculateNextReview(lowEaseCard, RATING.AGAIN);

                expect(result.ease_factor).toBe(MIN_EASE);
            });
        });

        describe('HARD rating', () => {
            it('should set 1 day interval for new card', () => {
                const result = calculateNextReview(newCard, RATING.HARD);

                expect(result.interval_days).toBe(1);
                expect(result.repetitions).toBe(1);
                expect(result.ease_factor).toBe(2.35); // 2.5 - 0.15
            });

            it('should increase interval by 1.2x for reviewed card', () => {
                const reviewedCard = { ...newCard, interval_days: 10, repetitions: 2 };
                const result = calculateNextReview(reviewedCard, RATING.HARD);

                expect(result.interval_days).toBe(12); // 10 * 1.2
            });
        });

        describe('GOOD rating', () => {
            it('should set 1 day interval for new card', () => {
                const result = calculateNextReview(newCard, RATING.GOOD);

                expect(result.interval_days).toBe(1);
                expect(result.repetitions).toBe(1);
                expect(result.ease_factor).toBe(DEFAULT_EASE); // unchanged
            });

            it('should set 6 days for second review', () => {
                const secondReview = { ...newCard, interval_days: 1, repetitions: 1 };
                const result = calculateNextReview(secondReview, RATING.GOOD);

                expect(result.interval_days).toBe(6);
            });

            it('should multiply interval by ease for subsequent reviews', () => {
                const laterReview = { ...newCard, interval_days: 6, repetitions: 2 };
                const result = calculateNextReview(laterReview, RATING.GOOD);

                expect(result.interval_days).toBe(15); // 6 * 2.5 = 15
            });
        });

        describe('EASY rating', () => {
            it('should set 4 days interval for new card with ease bonus', () => {
                const result = calculateNextReview(newCard, RATING.EASY);

                expect(result.interval_days).toBe(4);
                expect(result.repetitions).toBe(1);
                expect(result.ease_factor).toBe(2.65); // 2.5 + 0.15
            });

            it('should multiply interval by ease * 1.3 for reviewed cards', () => {
                const reviewedCard = { ...newCard, interval_days: 10, repetitions: 2 };
                const result = calculateNextReview(reviewedCard, RATING.EASY);

                expect(result.interval_days).toBe(33); // 10 * 2.5 * 1.3 = 32.5 rounded
            });
        });

        describe('next_review_date', () => {
            it('should set review date to 10 minutes for AGAIN', () => {
                const result = calculateNextReview(newCard, RATING.AGAIN);
                const reviewDate = new Date(result.next_review_date);
                const now = new Date();

                // Should be within 11 minutes (10 min + test execution time)
                const diffMs = reviewDate - now;
                expect(diffMs).toBeGreaterThan(9 * 60 * 1000);
                expect(diffMs).toBeLessThan(11 * 60 * 1000);
            });

            it('should set review date to future days for other ratings', () => {
                const result = calculateNextReview(newCard, RATING.EASY);
                const reviewDate = new Date(result.next_review_date);
                const now = new Date();

                const diffDays = (reviewDate - now) / (1000 * 60 * 60 * 24);
                expect(Math.round(diffDays)).toBe(4);
            });
        });
    });

    describe('formatInterval', () => {
        it('should format 0 days as "10 min"', () => {
            expect(formatInterval(0)).toBe('10 min');
        });

        it('should format 1 day correctly', () => {
            expect(formatInterval(1)).toBe('1 day');
        });

        it('should format days correctly', () => {
            expect(formatInterval(5)).toBe('5 days');
            expect(formatInterval(29)).toBe('29 days');
        });

        it('should format months correctly', () => {
            expect(formatInterval(30)).toBe('1 mo');
            expect(formatInterval(90)).toBe('3 mo');
        });

        it('should format years correctly', () => {
            expect(formatInterval(365)).toBe('1 yr');
            expect(formatInterval(730)).toBe('2 yr');
        });
    });

    describe('getIntervalPreviews', () => {
        it('should return previews for all rating options', () => {
            const card = { ease_factor: 2.5, interval_days: 0, repetitions: 0 };
            const previews = getIntervalPreviews(card);

            expect(previews).toHaveProperty('again');
            expect(previews).toHaveProperty('hard');
            expect(previews).toHaveProperty('good');
            expect(previews).toHaveProperty('easy');
        });

        it('should return formatted interval strings', () => {
            const card = { ease_factor: 2.5, interval_days: 0, repetitions: 0 };
            const previews = getIntervalPreviews(card);

            expect(previews.again).toBe('10 min');
            expect(previews.hard).toBe('1 day');
            expect(previews.good).toBe('1 day');
            expect(previews.easy).toBe('4 days');
        });
    });
});
