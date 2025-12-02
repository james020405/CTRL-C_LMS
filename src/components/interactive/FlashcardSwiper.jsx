import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../../lib/utils";
import { CheckCircle2, XCircle, RotateCcw, Award } from "lucide-react";

const SWIPE_THRESHOLD = 100;
const SWIPE_VELOCITY = 500;

export function FlashcardSwiper({ cards = [], onComplete, systemName }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [stats, setStats] = useState({ known: 0, review: 0 });
    const [swipeDirection, setSwipeDirection] = useState(null);

    const currentCard = cards[currentIndex];
    const isComplete = currentIndex >= cards.length;
    const progress = Math.round((currentIndex / cards.length) * 100);

    useEffect(() => {
        // Reset flip state when moving to next card
        setIsFlipped(false);
    }, [currentIndex]);

    const handleSwipeEnd = (event, info) => {
        const { offset, velocity } = info;
        const swipe = Math.abs(offset.x) * velocity.x;

        // Swipe left - Need to review (Red)
        if (offset.x < -SWIPE_THRESHOLD || swipe < -SWIPE_VELOCITY) {
            handleAnswer('review');
            setSwipeDirection('left');
        }
        // Swipe right - I know it (Green)
        else if (offset.x > SWIPE_THRESHOLD || swipe > SWIPE_VELOCITY) {
            handleAnswer('known');
            setSwipeDirection('right');
        } else {
            setSwipeDirection(null);
        }
    };

    const handleAnswer = (type) => {
        setStats(prev => ({
            ...prev,
            [type]: prev[type] + 1
        }));

        // Move to next card after animation
        setTimeout(() => {
            setCurrentIndex(prev => prev + 1);
            setSwipeDirection(null);
        }, 300);
    };

    const handleReset = () => {
        setCurrentIndex(0);
        setStats({ known: 0, review: 0 });
        setIsFlipped(false);
        setSwipeDirection(null);
    };

    if (isComplete) {
        const accuracy = Math.round((stats.known / cards.length) * 100);

        return (
            <div className="max-w-md mx-auto text-center space-y-6">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200 }}
                    className="bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-2xl p-8 border-2 border-green-500"
                >
                    <Award className="w-16 h-16 text-green-600 mx-auto mb-4" />
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                        Deck Complete!
                    </h2>
                    <p className="text-lg text-slate-600 dark:text-slate-400 mb-6">
                        {systemName} Flashcards
                    </p>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="bg-green-100 dark:bg-green-900/30 rounded-lg p-4">
                            <CheckCircle2 className="w-8 h-8 text-green-600 mx-auto mb-2" />
                            <div className="text-2xl font-bold text-green-700 dark:text-green-400">{stats.known}</div>
                            <div className="text-sm text-green-600 dark:text-green-500">I Know It</div>
                        </div>
                        <div className="bg-red-100 dark:bg-red-900/30 rounded-lg p-4">
                            <XCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
                            <div className="text-2xl font-bold text-red-700 dark:text-red-400">{stats.review}</div>
                            <div className="text-sm text-red-600 dark:text-red-500">Need Review</div>
                        </div>
                    </div>

                    <div className="mb-6">
                        <div className="text-sm text-slate-600 dark:text-slate-400 mb-2">Accuracy</div>
                        <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">{accuracy}%</div>
                    </div>

                    <button
                        onClick={handleReset}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                        <RotateCcw size={20} />
                        Study Again
                    </button>
                </motion.div>
            </div>
        );
    }

    if (!currentCard) return null;

    return (
        <div className="max-w-md mx-auto space-y-6">
            {/* Stats Bar */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                        <span className="text-lg font-semibold text-green-600">{stats.known}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <XCircle className="w-5 h-5 text-red-600" />
                        <span className="text-lg font-semibold text-red-600">{stats.review}</span>
                    </div>
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">
                    {currentIndex + 1} / {cards.length}
                </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                <motion.div
                    className="bg-blue-600 h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3 }}
                />
            </div>

            {/* Card Stack - Show 3 cards */}
            <div className="relative h-96 flex items-center justify-center">
                <AnimatePresence mode="sync">
                    {[0, 1, 2].map((offset) => {
                        const cardIndex = currentIndex + offset;
                        if (cardIndex >= cards.length) return null;

                        const card = cards[cardIndex];
                        const isTop = offset === 0;
                        const zIndex = 3 - offset;
                        const scale = 1 - offset * 0.05;
                        const yOffset = offset * 10;

                        return (
                            <motion.div
                                key={card.id}
                                className={cn(
                                    "absolute w-full max-w-sm",
                                    isTop && "cursor-grab active:cursor-grabbing"
                                )}
                                style={{ zIndex }}
                                initial={{ scale: 0.8, opacity: 0, y: 50 }}
                                animate={{
                                    scale,
                                    y: yOffset,
                                    opacity: 1,
                                    rotate: isTop && swipeDirection === 'left' ? -15 :
                                        isTop && swipeDirection === 'right' ? 15 : 0,
                                    x: isTop && swipeDirection === 'left' ? -300 :
                                        isTop && swipeDirection === 'right' ? 300 : 0,
                                }}
                                exit={{
                                    scale: 0.8,
                                    opacity: 0,
                                    x: swipeDirection === 'left' ? -500 : 500,
                                    rotate: swipeDirection === 'left' ? -30 : 30,
                                }}
                                transition={{
                                    type: "spring",
                                    stiffness: 300,
                                    damping: 30,
                                }}
                                drag={isTop ? "x" : false}
                                dragConstraints={{ left: 0, right: 0 }}
                                dragElastic={0.7}
                                onDragEnd={isTop ? handleSwipeEnd : undefined}
                                onClick={() => isTop && setIsFlipped(!isFlipped)}
                            >
                                {/* Swipe Indicators */}
                                {isTop && (
                                    <>
                                        <motion.div
                                            className="absolute top-4 left-4 bg-red-500 text-white px-4 py-2 rounded-lg font-bold text-lg rotate-12 z-10"
                                            initial={{ opacity: 0, scale: 0.5 }}
                                            animate={{
                                                opacity: swipeDirection === 'left' ? 1 : 0,
                                                scale: swipeDirection === 'left' ? 1 : 0.5
                                            }}
                                        >
                                            REVIEW
                                        </motion.div>
                                        <motion.div
                                            className="absolute top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg font-bold text-lg -rotate-12 z-10"
                                            initial={{ opacity: 0, scale: 0.5 }}
                                            animate={{
                                                opacity: swipeDirection === 'right' ? 1 : 0,
                                                scale: swipeDirection === 'right' ? 1 : 0.5
                                            }}
                                        >
                                            KNOW IT
                                        </motion.div>
                                    </>
                                )}

                                {/* Card Content */}
                                <motion.div
                                    className="relative w-full h-80 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border-2 border-slate-200 dark:border-slate-700"
                                    style={{ transformStyle: "preserve-3d" }}
                                    animate={{ rotateY: isTop && isFlipped ? 180 : 0 }}
                                    transition={{ duration: 0.6 }}
                                >
                                    {/* Front - Question */}
                                    <div
                                        className="absolute inset-0 p-8 flex flex-col items-center justify-center backface-hidden"
                                        style={{ backfaceVisibility: "hidden" }}
                                    >
                                        <div className="text-xs uppercase tracking-wide text-blue-600 dark:text-blue-400 font-semibold mb-4">
                                            Question
                                        </div>
                                        <p className="text-xl font-medium text-slate-900 dark:text-white text-center">
                                            {card.question}
                                        </p>
                                        <div className="absolute bottom-6 text-sm text-slate-500 dark:text-slate-400">
                                            Tap to reveal answer
                                        </div>
                                    </div>

                                    {/* Back - Answer */}
                                    <div
                                        className="absolute inset-0 p-8 flex flex-col items-center justify-center backface-hidden bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20"
                                        style={{
                                            backfaceVisibility: "hidden",
                                            transform: "rotateY(180deg)"
                                        }}
                                    >
                                        <div className="text-xs uppercase tracking-wide text-green-600 dark:text-green-400 font-semibold mb-4">
                                            Answer
                                        </div>
                                        <p className="text-lg text-slate-900 dark:text-white text-center">
                                            {card.answer}
                                        </p>
                                    </div>
                                </motion.div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>

            {/* Swipe Instructions */}
            <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                    <XCircle size={16} />
                    <span>← Swipe left to review</span>
                </div>
                <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                    <span>Swipe right if you know →</span>
                    <CheckCircle2 size={16} />
                </div>
            </div>

            {/* Action Buttons (Desktop fallback) */}
            <div className="grid grid-cols-2 gap-3">
                <button
                    onClick={() => handleAnswer('review')}
                    className="flex items-center justify-center gap-2 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-700 dark:text-red-400 font-medium py-3 px-6 rounded-lg transition-colors"
                >
                    <XCircle size={20} />
                    Need Review
                </button>
                <button
                    onClick={() => handleAnswer('known')}
                    className="flex items-center justify-center gap-2 bg-green-100 hover:bg-green-200 dark:bg-green-900/30 dark:hover:bg-green-900/50 text-green-700 dark:text-green-400 font-medium py-3 px-6 rounded-lg transition-colors"
                >
                    <CheckCircle2 size={20} />
                    I Know It
                </button>
            </div>
        </div>
    );
}
