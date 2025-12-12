import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Activity, PlayCircle, LogOut, BrainCircuit, AlertTriangle, FileText, Trophy, Settings, Link2, Wrench, TrendingUp } from 'lucide-react';
import { ThemeToggle } from '../ui/ThemeToggle';
import { Sidebar, SidebarBody, SidebarLink } from '../ui/Sidebar';
import { cn } from '../../lib/utils';
import SkipNavigation from '../SkipNavigation';

import { useAuth } from '../../contexts/AuthContext';

export default function StudentLayout() {
    const navigate = useNavigate();
    const { signOut } = useAuth();
    const [open, setOpen] = useState(false);

    const handleSignOut = async (e) => {
        e.preventDefault();
        try {
            await signOut();
            navigate('/login');
        } catch (error) {
            console.error("Failed to sign out", error);
        }
    };

    // Grouped navigation items
    const navSections = [
        {
            title: 'Learn',
            items: [
                { href: '/student/dashboard', icon: <LayoutDashboard className="text-slate-700 dark:text-slate-200 h-5 w-5 flex-shrink-0" aria-hidden="true" />, label: 'Dashboard' },
                { href: '/student/systems', icon: <Activity className="text-slate-700 dark:text-slate-200 h-5 w-5 flex-shrink-0" aria-hidden="true" />, label: '7 Systems' },
                { href: '/student/flashcards', icon: <BrainCircuit className="text-slate-700 dark:text-slate-200 h-5 w-5 flex-shrink-0" aria-hidden="true" />, label: 'Flashcards' },
            ]
        },
        {
            title: 'Practice',
            items: [
                { href: '/student/simulator', icon: <PlayCircle className="text-slate-700 dark:text-slate-200 h-5 w-5 flex-shrink-0" aria-hidden="true" />, label: 'Simulator' },
            ]
        },
        {
            title: 'Games',
            items: [
                { href: '/student/roulette', icon: <AlertTriangle className="text-slate-700 dark:text-slate-200 h-5 w-5 flex-shrink-0" aria-hidden="true" />, label: 'Fault Roulette' },
                { href: '/student/service-writer', icon: <FileText className="text-slate-700 dark:text-slate-200 h-5 w-5 flex-shrink-0" aria-hidden="true" />, label: 'Service Writer' },
                { href: '/student/cross-system', icon: <Link2 className="text-slate-700 dark:text-slate-200 h-5 w-5 flex-shrink-0" aria-hidden="true" />, label: 'Cross-System' },
                { href: '/student/tool-selection', icon: <Wrench className="text-slate-700 dark:text-slate-200 h-5 w-5 flex-shrink-0" aria-hidden="true" />, label: 'Tool Select' },
                { href: '/student/chain-reaction', icon: <Link2 className="text-slate-700 dark:text-slate-200 h-5 w-5 flex-shrink-0" aria-hidden="true" />, label: 'Chain Reaction' },
            ]
        },
        {
            title: 'Stats',
            items: [
                { href: '/student/progress', icon: <TrendingUp className="text-slate-700 dark:text-slate-200 h-5 w-5 flex-shrink-0" aria-hidden="true" />, label: 'My Progress' },
                { href: '/student/leaderboard', icon: <Trophy className="text-slate-700 dark:text-slate-200 h-5 w-5 flex-shrink-0" aria-hidden="true" />, label: 'Leaderboard' },
            ]
        }
    ];

    return (
        <>
            <SkipNavigation />
            <div className={cn(
                "flex flex-col md:flex-row bg-slate-50 dark:bg-slate-900 w-full flex-1 overflow-hidden",
                "h-screen"
            )}>
                <Sidebar open={open} setOpen={setOpen}>
                    <SidebarBody className="justify-between gap-6" aria-label="Main navigation">
                        <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
                            <Logo />

                            {/* Grouped Navigation */}
                            <nav className={cn("mt-6 flex flex-col", open ? "gap-5" : "gap-1")} role="navigation" aria-label="Student navigation">
                                {navSections.map((section, idx) => (
                                    <div key={idx} role="group" aria-label={section.title}>
                                        {/* Section Header - Only show when sidebar is open */}
                                        {open && (
                                            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-2 mb-2" aria-hidden="true">
                                                {section.title}
                                            </p>
                                        )}
                                        <div className="flex flex-col gap-1">
                                            {section.items.map((link, linkIdx) => (
                                                <SidebarLink key={linkIdx} link={link} />
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </nav>
                        </div>

                        {/* Bottom Section */}
                        <div className="flex flex-col gap-2 border-t border-slate-200 dark:border-slate-800 pt-4" role="group" aria-label="User settings">
                            <SidebarLink
                                link={{
                                    label: "Settings",
                                    href: "/student/profile",
                                    icon: <Settings className="text-slate-700 dark:text-slate-200 h-5 w-5 flex-shrink-0" aria-hidden="true" />,
                                }}
                            />
                            <div className={cn("flex items-center", open ? "justify-between px-2" : "justify-center")}>
                                {open && <span className="text-sm text-slate-500 dark:text-slate-400" id="theme-label">Theme</span>}
                                <ThemeToggle collapsed={!open} aria-labelledby={open ? "theme-label" : undefined} />
                            </div>
                            <SidebarLink
                                link={{
                                    label: "Sign Out",
                                    href: "#",
                                    icon: <LogOut className="text-red-500 h-5 w-5 flex-shrink-0" aria-hidden="true" />,
                                }}
                                onClick={handleSignOut}
                            />
                        </div>
                    </SidebarBody>
                </Sidebar>

                {/* Main Content */}
                <main id="main-content" className="flex-1 p-4 md:p-8 overflow-y-auto bg-slate-50 dark:bg-slate-900" role="main" aria-label="Main content">
                    <Outlet />
                </main>
            </div>
        </>
    );
}

export const Logo = () => {
    return (
        <div className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20">
            <div className="h-6 w-6 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold flex-shrink-0">
                C
            </div>
            <span className="font-bold text-slate-900 dark:text-white whitespace-pre">
                Ctrl C Academy
            </span>
        </div>
    );
};
