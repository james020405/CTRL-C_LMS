import React, { useState, useEffect } from 'react';
import { Wrench, Zap, Activity, Disc, Cog, Thermometer } from 'lucide-react';
import { cn } from '../lib/utils';
import { flashcardData } from '../data/flashcardData';
import { MorphingCardStack } from './ui/morphing-card-stack';

const deckIcons = {
    engine: <Wrench className="w-5 h-5" />,
    brakes: <Disc className="w-5 h-5" />,
    transmission: <Cog className="w-5 h-5" />,
    suspension: <Activity className="w-5 h-5" />,
    steering: <Wrench className="w-5 h-5" />, // Reusing wrench for now
    electrical: <Zap className="w-5 h-5" />,
    cooling: <Thermometer className="w-5 h-5" />,
};

const deckColors = {
    engine: '#eff6ff', // blue-50
    brakes: '#fef2f2', // red-50
    transmission: '#fffbeb', // amber-50
    suspension: '#f0fdf4', // emerald-50
    steering: '#f3e8ff', // purple-50
    electrical: '#fff7ed', // orange-50
    cooling: '#ecfeff', // cyan-50
};

export default function FlashcardViewer() {
    const [currentDeck, setCurrentDeck] = useState('engine');
    const [cards, setCards] = useState([]);

    useEffect(() => {
        const rawCards = flashcardData[currentDeck] || [];
        const mappedCards = rawCards.map(card => ({
            id: card.id,
            title: card.question,
            description: card.answer,
            icon: deckIcons[currentDeck],
            color: deckColors[currentDeck],
        }));
        setCards(mappedCards);
    }, [currentDeck]);

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            {/* Deck Selector */}
            <div className="flex flex-wrap gap-2 justify-center">
                {Object.keys(flashcardData).map((deckKey) => (
                    <button
                        key={deckKey}
                        onClick={() => setCurrentDeck(deckKey)}
                        className={cn(
                            "px-4 py-2 rounded-full text-sm font-medium capitalize transition-all",
                            currentDeck === deckKey
                                ? "bg-blue-600 text-white shadow-lg shadow-blue-200 dark:shadow-blue-900/20"
                                : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700"
                        )}
                    >
                        {deckKey}
                    </button>
                ))}
            </div>

            <div className="flex justify-center py-8">
                <MorphingCardStack cards={cards} />
            </div>
        </div>
    );
}
