import React from 'react';
import { cn } from '../../lib/utils';

/**
 * Skeleton loader component for loading states
 * Provides consistent loading UI across the application
 */
export function Skeleton({ className, ...props }) {
    return (
        <div
            className={cn(
                "animate-pulse rounded-md bg-slate-200 dark:bg-slate-700",
                className
            )}
            {...props}
        />
    );
}

/**
 * Card skeleton for dashboard cards
 */
export function CardSkeleton({ className }) {
    return (
        <div className={cn("p-6 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700", className)}>
            <Skeleton className="h-4 w-24 mb-3" />
            <Skeleton className="h-8 w-32 mb-2" />
            <Skeleton className="h-3 w-20" />
        </div>
    );
}

/**
 * Table row skeleton for lists
 */
export function TableRowSkeleton({ columns = 4 }) {
    return (
        <div className="flex items-center gap-4 p-4 border-b border-slate-200 dark:border-slate-700">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
            </div>
            {Array.from({ length: columns - 1 }).map((_, i) => (
                <Skeleton key={i} className="h-4 w-16" />
            ))}
        </div>
    );
}

/**
 * Student list skeleton
 */
export function StudentListSkeleton({ count = 5 }) {
    return (
        <div className="space-y-2">
            {Array.from({ length: count }).map((_, i) => (
                <TableRowSkeleton key={i} columns={3} />
            ))}
        </div>
    );
}

/**
 * Stats grid skeleton
 */
export function StatsGridSkeleton({ count = 4 }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: count }).map((_, i) => (
                <CardSkeleton key={i} />
            ))}
        </div>
    );
}

/**
 * Course card skeleton
 */
export function CourseCardSkeleton() {
    return (
        <div className="p-6 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="flex items-start gap-4">
                <Skeleton className="h-16 w-16 rounded-xl" />
                <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-3 w-24" />
                    <div className="flex gap-4 mt-3">
                        <Skeleton className="h-3 w-16" />
                        <Skeleton className="h-3 w-20" />
                    </div>
                </div>
            </div>
        </div>
    );
}

/**
 * Insights card skeleton
 */
export function InsightsCardSkeleton() {
    return (
        <div className="p-6 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-4">
            <Skeleton className="h-5 w-32" />
            <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
            </div>
        </div>
    );
}
