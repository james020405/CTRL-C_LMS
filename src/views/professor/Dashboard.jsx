import React, { useState } from 'react';
import { Header } from '../../components/Header';
import CourseManager from './CourseManager';
import TopicManager from './TopicManager';

export default function ProfessorDashboard() {
    const [selectedCourse, setSelectedCourse] = useState(null);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
            <Header userInitial="P" />

            <main className="max-w-6xl mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                        {selectedCourse ? 'Manage Course Content' : 'Professor Dashboard'}
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400">
                        {selectedCourse ? `Editing ${selectedCourse.title}` : 'Manage your courses and students'}
                    </p>
                </div>

                {selectedCourse ? (
                    <TopicManager
                        course={selectedCourse}
                        onBack={() => setSelectedCourse(null)}
                    />
                ) : (
                    <CourseManager
                        onSelectCourse={setSelectedCourse}
                    />
                )}
            </main>
        </div>
    );
}
