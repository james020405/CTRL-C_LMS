import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
    plugins: [react()],
    test: {
        // Use jsdom for DOM testing
        environment: 'jsdom',
        // Setup files to run before tests
        setupFiles: ['./src/test/setup.js'],
        // Include test files
        include: ['src/**/*.{test,spec}.{js,jsx}'],
        // Enable global test functions (describe, it, expect)
        globals: true,
        // Coverage configuration
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
            exclude: [
                'node_modules/',
                'src/test/',
                '**/*.d.ts',
                '**/*.config.js',
            ],
        },
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
});
