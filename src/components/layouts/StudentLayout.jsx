import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Activity, BookOpen, PlayCircle, Stethoscope, LogOut } from 'lucide-react';
import { ThemeToggle } from '../ui/ThemeToggle';
import { cn } from '../../lib/utils';

export default function StudentLayout() {
    const navigate = useNavigate();

    const navItems = [
        { to: '/student/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { to: '/student/systems', icon: Activity, label: '7 Systems' },
        { to: '/student/study', icon: BookOpen, label: 'Flashcards' },
        { to: '/student/simulator', icon: PlayCircle, label: 'Simulator' },
        { to: '/student/diagnostics', icon: Stethoscope, label: 'Diagnostics' },
    ];

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex transition-colors duration-300">
            {/* Sidebar */}
            <aside className="w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col fixed h-full z-20">
                <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                        C
                    </div>
                    <span className="font-bold text-slate-800 dark:text-white text-lg">Ctrl C Academy</span>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            className={({ isActive }) => cn(
                                "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium",
                                isActive
                                    ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50"
                            )}
                        >
                            <item.icon size={20} />
                            {item.label}
                        </NavLink>
                    ))}
                </nav>

                <div className="p-4 border-t border-slate-200 dark:border-slate-700 space-y-4">
                    <div className="flex items-center justify-between px-4">
                        <span className="text-sm text-slate-500 dark:text-slate-400">Theme</span>
                        <ThemeToggle />
                    </div>
                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center gap-3 px-4 py-2 w-full text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors text-sm font-medium"
                    >
                        <LogOut size={18} />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-64 p-8">
                <Outlet />
            </main>
        </div>
    );
}
