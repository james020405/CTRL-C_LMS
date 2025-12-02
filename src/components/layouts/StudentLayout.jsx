import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Activity, BookOpen, PlayCircle, Stethoscope, LogOut } from 'lucide-react';
import { ThemeToggle } from '../ui/ThemeToggle';
import { Sidebar, SidebarBody, SidebarLink } from '../ui/Sidebar';
import { cn } from '../../lib/utils';

export default function StudentLayout() {
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);

    const navItems = [
        { href: '/student/dashboard', icon: <LayoutDashboard className="text-slate-700 dark:text-slate-200 h-5 w-5 flex-shrink-0" />, label: 'Dashboard' },
        { href: '/student/systems', icon: <Activity className="text-slate-700 dark:text-slate-200 h-5 w-5 flex-shrink-0" />, label: '7 Systems' },
        { href: '/student/study', icon: <BookOpen className="text-slate-700 dark:text-slate-200 h-5 w-5 flex-shrink-0" />, label: 'Flashcards' },
        { href: '/student/simulator', icon: <PlayCircle className="text-slate-700 dark:text-slate-200 h-5 w-5 flex-shrink-0" />, label: 'Simulator' },
        { href: '/student/diagnostics', icon: <Stethoscope className="text-slate-700 dark:text-slate-200 h-5 w-5 flex-shrink-0" />, label: 'Diagnostics' },
    ];

    return (
        <div className={cn(
            "flex flex-col md:flex-row bg-slate-50 dark:bg-slate-900 w-full flex-1 overflow-hidden",
            "h-screen"
        )}>
            <Sidebar open={open} setOpen={setOpen}>
                <SidebarBody className="justify-between gap-10">
                    <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
                        <Logo />
                        <div className="mt-8 flex flex-col gap-2">
                            {navItems.map((link, idx) => (
                                <SidebarLink key={idx} link={link} />
                            ))}
                        </div>
                    </div>
                    <div className="flex flex-col gap-4">
                        <div className={cn("flex items-center", open ? "justify-between px-2" : "justify-center")}>
                            {open && <span className="text-sm text-slate-500 dark:text-slate-400">Theme</span>}
                            <ThemeToggle collapsed={!open} />
                        </div>
                        <SidebarLink
                            link={{
                                label: "Sign Out",
                                href: "#",
                                icon: <LogOut className="text-red-500 h-5 w-5 flex-shrink-0" />,
                            }}
                            onClick={() => navigate('/')}
                        />
                    </div>
                </SidebarBody>
            </Sidebar>

            {/* Main Content */}
            <main className="flex-1 p-8 overflow-y-auto">
                <Outlet />
            </main>
        </div>
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
