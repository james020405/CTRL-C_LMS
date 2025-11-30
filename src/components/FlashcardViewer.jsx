import React, { useState, useEffect } from 'react';
import { RefreshCw, Check, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { cn } from '../lib/utils';

// Sample data - in a real app this would come from Supabase
const sampleDeck = [
    { id: 1, front: 'Piston', back: 'A moving component contained by a cylinder and made gas-tight by piston rings.' },
    { id: 2, front: 'Camshaft', back: 'A shaft with one or more cams attached to it, used to operate poppet valves.' },
    { id: 3, front: 'Alternator', back: 'A generator that converts mechanical energy to electrical energy in the form of alternating current.' },
    { id: 4, front: 'Differential', back: 'A gear train with three shafts that has the property that the rotational speed of one shaft is the average of the speeds of the others.' },
    { id: 5, front: 'Catalytic Converter', back: 'An exhaust emission control device that reduces toxic gases and pollutants in exhaust gas.' },
];

export default function FlashcardViewer() {
    const [cards, setCards] = useState(sampleDeck);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [knownCount, setKnownCount] = useState(0);

    const currentCard = cards[currentIndex];

    const handleFlip = () => setIsFlipped(!isFlipped);

    const handleNext = () => {
        setIsFlipped(false);
        setTimeout(() => {
            setCurrentIndex((prev) => (prev + 1) % cards.length);
        }, 200);
    };

    const handlePrev = () => {
        setIsFlipped(false);
        setTimeout(() => {
            setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
        }, 200);
    };

    const handleShuffle = () => {
        setCards([...cards].sort(() => Math.random() - 0.5));
        setCurrentIndex(0);
        setIsFlipped(false);
        setKnownCount(0);
    };

    const markKnown = () => {
        setKnownCount(prev => prev + 1);
        handleNext();
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                <span>Card {currentIndex + 1} of {cards.length}</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">{knownCount} Mastered</span>
            </div>

            <div className="relative h-80 w-full perspective-1000 group cursor-pointer" onClick={handleFlip}>
                <div className={cn(
                    "relative w-full h-full transition-all duration-500 transform-style-3d shadow-xl rounded-2xl",
                    isFlipped ? "rotate-y-180" : ""
                )}>
                    {/* Front */}
                    <div className="absolute inset-0 w-full h-full bg-white dark:bg-slate-800 rounded-2xl p-8 flex flex-col items-center justify-center backface-hidden border-2 border-slate-100 dark:border-slate-700">
                        <span className="text-sm uppercase tracking-widest text-slate-400 mb-4">Term</span>
                        <h3 className="text-3xl font-bold text-slate-900 dark:text-white text-center">{currentCard.front}</h3>
                        <p className="absolute bottom-6 text-slate-400 text-sm">Click to flip</p>
                    </div>

                    {/* Back */}
                    <div className="absolute inset-0 w-full h-full bg-blue-50 dark:bg-slate-800 rounded-2xl p-8 flex flex-col items-center justify-center backface-hidden rotate-y-180 border-2 border-blue-100 dark:border-blue-900">
                        <span className="text-sm uppercase tracking-widest text-blue-500 mb-4">Definition</span>
                        <p className="text-xl text-slate-700 dark:text-slate-200 text-center leading-relaxed">{currentCard.back}</p>
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-between gap-4">
                <Button variant="secondary" onClick={handlePrev} disabled={currentIndex === 0}>
                    <ChevronLeft size={20} />
                </Button>

                <div className="flex gap-3">
                    <Button variant="outline" onClick={handleShuffle} title="Shuffle Deck">
                        <RefreshCw size={20} />
                    </Button>
                    <Button
                        className="bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:hover:bg-amber-900/50 shadow-none"
                        onClick={handleNext}
                    >
                        Study Again
                    </Button>
                    <Button
                        className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:hover:bg-emerald-900/50 shadow-none"
                        onClick={markKnown}
                    >
                        I Know This
                    </Button>
                </div>

                <Button variant="secondary" onClick={handleNext} disabled={currentIndex === cards.length - 1}>
                    <ChevronRight size={20} />
                </Button>
            </div>
        </div>
    );
}
