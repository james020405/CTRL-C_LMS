import React, { useState } from 'react';
import { Header } from '../../components/Header';
import CourseManager from './CourseManager';
import TopicManager from './TopicManager';
import StudentProgress from './StudentProgress';
import { BookOpen, Users, TrendingUp } from 'lucide-react';

export default function ProfessorDashboard() {
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [activeTab, setActiveTab] = useState('courses'); // 'courses' or 'progress'

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
            <Header userInitial="P" />

            <main className="max-w-6xl mx-auto px-4 py-8">
                {/* Header with Tabs */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                        {selectedCourse ? 'Manage Course Content' : 'Professor Dashboard'}
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 mb-6">
                        {selectedCourse ? `Editing ${selectedCourse.title}` : 'Manage your courses and track student progress'}
                    </p>

                    {/* Tabs - Only show when not editing a course */}
                    {!selectedCourse && (
                        <div className="flex gap-2 border-b border-slate-200 dark:border-slate-700">
                            <button
                                onClick={() => setActiveTab('courses')}
                                className={`flex items-center gap-2 px-4 py-3 font-medium text-sm transition-colors border-b-2 -mb-px ${activeTab === 'courses'
                                        ? 'border-blue-600 text-blue-600'
                                        : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                                    }`}
                            >
                                <BookOpen size={18} />
                                Course Management
                            </button>
                            <button
                                onClick={() => setActiveTab('progress')}
                                className={`flex items-center gap-2 px-4 py-3 font-medium text-sm transition-colors border-b-2 -mb-px ${activeTab === 'progress'
                                        ? 'border-blue-600 text-blue-600'
                                        : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                                    }`}
                            >
                                <TrendingUp size={18} />
                                Student Progress
                            </button>
                        </div>
                    )}
                </div>

                {/* Content */}
                {selectedCourse ? (
                    <TopicManager
                        course={selectedCourse}
                        onBack={() => setSelectedCourse(null)}
                    />
                ) : activeTab === 'courses' ? (
                    <CourseManager
                        onSelectCourse={setSelectedCourse}
                    />
                ) : (
                    <StudentProgress />
                )}
            </main>
        </div>
    );
}
