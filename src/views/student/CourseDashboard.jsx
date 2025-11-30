import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Activity, PlayCircle } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

export default function StudentDashboard() {
    const navigate = useNavigate();

    return (
        <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Welcome back, Student</h1>
            <p className="text-slate-600 dark:text-slate-400 mb-8">Continue your automotive journey.</p>

            <div className="grid md:grid-cols-3 gap-6">
                {/* 7 Systems Module */}
                <Card className="flex flex-col border-t-4 border-t-blue-500">
                    <div className="mb-4 p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg w-fit">
                        <Activity size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">7 Systems Explorer</h3>
                    <p className="text-slate-600 dark:text-slate-400 mb-6 flex-1">
                        Interactive 3D-style exploration of the major automotive systems.
                    </p>
                    <Button onClick={() => navigate('/student/systems')}>
                        Explore Systems
                    </Button>
                </Card>

                {/* Flashcards */}
                <Card className="flex flex-col border-t-4 border-t-emerald-500">
                    <div className="mb-4 p-3 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg w-fit">
                        <BookOpen size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Flashcards</h3>
                    <p className="text-slate-600 dark:text-slate-400 mb-6 flex-1">
                        Master technical terms with our spaced repetition study tool.
                    </p>
                    <Button onClick={() => navigate('/student/study')} className="bg-emerald-600 hover:bg-emerald-700">
                        Start Studying
                    </Button>
                </Card>

                {/* Simulator */}
                <Card className="flex flex-col border-t-4 border-t-purple-500">
                    <div className="mb-4 p-3 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg w-fit">
                        <PlayCircle size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">3D Simulator</h3>
                    <p className="text-slate-600 dark:text-slate-400 mb-6 flex-1">
                        Interactive 3D disassembly and assembly practice.
                    </p>
                    <Button onClick={() => navigate('/student/simulator')} className="bg-purple-600 hover:bg-purple-700 text-white">
                        Launch Simulator
                    </Button>
                </Card>
            </div>
        </div>
    );
}
