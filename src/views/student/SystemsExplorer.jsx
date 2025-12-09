import React from 'react';
import SevenSystems from '../../components/SevenSystems';
import { Activity, Sparkles } from 'lucide-react';

export default function SystemsExplorer() {
    return (
        <div className="max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl text-white shadow-lg shadow-blue-200 dark:shadow-blue-900/30">
                    <Activity size={28} />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        7 Systems Explorer
                        <Sparkles className="text-yellow-500 w-6 h-6" />
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400">
                        Interactive guide to automotive anatomy
                    </p>
                </div>
            </div>

            {/* Systems Grid */}
            <SevenSystems />
        </div>
    );
}
