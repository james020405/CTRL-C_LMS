import React from 'react';
import { Link } from 'react-router-dom';
import { User } from 'lucide-react';
import { ThemeToggle } from './ui/ThemeToggle';

export function Header({ userInitial = 'G' }) {
    return (
        <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-transparent px-4 py-3 flex justify-between items-center sticky top-0 z-10 transition-colors duration-300">
            <Link to="/" className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-200 text-lg hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                <img src="/logo.png" alt="CTRL+C" className="h-9 w-9 object-contain" />
                Ctrl C Academy
            </Link>
            <div className="flex items-center gap-3">
                <ThemeToggle />
                <div className="w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold text-xs">
                    {userInitial}
                </div>
            </div>
        </div>
    );
}
