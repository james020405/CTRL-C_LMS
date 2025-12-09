import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SCORE_MULTIPLIERS, DAILY_LIMITS } from '../gameService';

// Note: Full integration tests for gameService would require mocking Supabase
// These tests cover the pure functions and constants

describe('Game Service', () => {
    describe('SCORE_MULTIPLIERS', () => {
        it('should have correct multipliers for each difficulty', () => {
            expect(SCORE_MULTIPLIERS.easy).toBe(1);
            expect(SCORE_MULTIPLIERS.medium).toBe(1.5);
            expect(SCORE_MULTIPLIERS.hard).toBe(2);
        });

        it('should have multipliers that increase with difficulty', () => {
            expect(SCORE_MULTIPLIERS.medium).toBeGreaterThan(SCORE_MULTIPLIERS.easy);
            expect(SCORE_MULTIPLIERS.hard).toBeGreaterThan(SCORE_MULTIPLIERS.medium);
        });
    });

    describe('DAILY_LIMITS', () => {
        it('should have correct daily play limits', () => {
            expect(DAILY_LIMITS.easy).toBe(5);
            expect(DAILY_LIMITS.medium).toBe(5);
            expect(DAILY_LIMITS.hard).toBe(2);
        });

        it('should have hard mode with fewer plays (higher stakes)', () => {
            expect(DAILY_LIMITS.hard).toBeLessThan(DAILY_LIMITS.easy);
            expect(DAILY_LIMITS.hard).toBeLessThan(DAILY_LIMITS.medium);
        });
    });

    describe('Score Calculations', () => {
        it('should calculate correct scores for easy difficulty', () => {
            const baseScore = 100;
            const finalScore = Math.round(baseScore * SCORE_MULTIPLIERS.easy);
            expect(finalScore).toBe(100);
        });

        it('should calculate correct scores for medium difficulty', () => {
            const baseScore = 100;
            const finalScore = Math.round(baseScore * SCORE_MULTIPLIERS.medium);
            expect(finalScore).toBe(150);
        });

        it('should calculate correct scores for hard difficulty', () => {
            const baseScore = 100;
            const finalScore = Math.round(baseScore * SCORE_MULTIPLIERS.hard);
            expect(finalScore).toBe(200);
        });
    });
});
