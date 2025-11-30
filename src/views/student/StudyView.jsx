import React from 'react';
import { Header } from '../../components/Header';
import FlashcardViewer from '../../components/FlashcardViewer';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';

export default function StudyView() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
            <Header userInitial="S" />

            <main className="max-w-4xl mx-auto px-4 py-8">
                <div className="mb-8 flex items-center gap-4">
                    <Button variant="secondary" onClick={() => navigate('/student/dashboard')} className="p-2">
                        <ArrowLeft size={20} />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Flashcards</h1>
                        <p className="text-slate-600 dark:text-slate-400">Master terminology with spaced repetition</p>
                    </div>
                </div>

                <FlashcardViewer />
            </main>
        </div>
    );
}
