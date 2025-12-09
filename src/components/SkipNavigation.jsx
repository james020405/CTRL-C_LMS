import React from 'react';

/**
 * Skip Navigation Component
 * Provides a keyboard-accessible link to skip to main content
 * This is an important accessibility feature for screen reader users
 */
export default function SkipNavigation() {
    return (
        <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[9999] 
                       focus:bg-blue-600 focus:text-white focus:px-4 focus:py-2 focus:rounded-lg 
                       focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-300
                       transition-all"
            aria-label="Skip to main content"
        >
            Skip to main content
        </a>
    );
}
