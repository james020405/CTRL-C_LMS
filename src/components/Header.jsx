import React from 'react';
import { User } from 'lucide-react';
import { ThemeToggle } from './ui/ThemeToggle';

export function Header({ userInitial = 'G' }) {
    return (
        <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-4 py-3 flex justify-between items-center sticky top-0 z-10 transition-colors duration-300">
            <span className="font-bold text-slate-700 dark:text-slate-200 text-lg">Ctrl C Academy</span>
            <div className="flex items-center gap-3">
                <ThemeToggle />
                <div className="w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold text-xs">
                    {userInitial}
                </div>
            </div>
        </div>
    );
}
