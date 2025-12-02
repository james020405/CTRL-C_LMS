import React from "react"
import { Moon, Sun } from "lucide-react"
import { cn } from "../../lib/utils"
import { useTheme } from "../../context/ThemeContext"

export function ThemeToggle({ className, collapsed }) {
    const { theme, setTheme } = useTheme()
    const isDark = theme === 'dark'

    const toggleTheme = () => {
        setTheme(isDark ? 'light' : 'dark')
    }

    if (collapsed) {
        return (
            <button
                onClick={toggleTheme}
                className={cn(
                    "w-10 h-10 flex items-center justify-center rounded-lg transition-colors duration-200 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800",
                    className
                )}
                aria-label="Toggle theme"
            >
                {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
        )
    }

    return (
        <div
            className={cn(
                "flex w-16 h-8 p-1 rounded-full cursor-pointer transition-all duration-300",
                isDark
                    ? "bg-slate-950 border border-slate-800"
                    : "bg-white border border-slate-200",
                className
            )}
            onClick={toggleTheme}
            role="button"
            tabIndex={0}
        >
            <div className="flex justify-between items-center w-full">
                <div
                    className={cn(
                        "flex justify-center items-center w-6 h-6 rounded-full transition-transform duration-300",
                        isDark
                            ? "transform translate-x-0 bg-slate-800"
                            : "transform translate-x-8 bg-slate-200"
                    )}
                >
                    {isDark ? (
                        <Moon
                            className="w-4 h-4 text-white"
                            strokeWidth={1.5}
                        />
                    ) : (
                        <Sun
                            className="w-4 h-4 text-slate-700"
                            strokeWidth={1.5}
                        />
                    )}
                </div>
                <div
                    className={cn(
                        "flex justify-center items-center w-6 h-6 rounded-full transition-transform duration-300",
                        isDark
                            ? "bg-transparent"
                            : "transform -translate-x-8"
                    )}
                >
                    {isDark ? (
                        <Sun
                            className="w-4 h-4 text-slate-500"
                            strokeWidth={1.5}
                        />
                    ) : (
                        <Moon
                            className="w-4 h-4 text-black"
                            strokeWidth={1.5}
                        />
                    )}
                </div>
            </div>
        </div>
    )
}
