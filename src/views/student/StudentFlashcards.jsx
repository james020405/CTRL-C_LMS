import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/input';
import { calculateNextReview, getIntervalPreviews, RATING, formatInterval } from '../../lib/spacedRepetition';
import { Plus, Trash2, RotateCw, CheckCircle, BrainCircuit, Loader2, Layers, FolderPlus, RotateCcw, ThumbsDown, ThumbsUp, Zap } from 'lucide-react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';

export default function StudentFlashcards() {
    const { user } = useAuth();
    const [cards, setCards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [studyMode, setStudyMode] = useState(false);
    const [dueCards, setDueCards] = useState([]);
    const [currentCardIndex, setCurrentCardIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [showForm, setShowForm] = useState(false);

    // Decks State
    const [decks, setDecks] = useState([]);
    const [selectedDeck, setSelectedDeck] = useState('All');

    // New Card Form
    const [newFront, setNewFront] = useState('');
    const [newBack, setNewBack] = useState('');
    const [newDeck, setNewDeck] = useState('');
    const [creating, setCreating] = useState(false);

    // Stats
    const [sessionStats, setSessionStats] = useState({ again: 0, hard: 0, good: 0, easy: 0 });

    useEffect(() => {
        if (user) fetchCards();
    }, [user]);

    const fetchCards = async () => {
        try {
            const { data, error } = await supabase
                .from('student_flashcards')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setCards(data || []);

            const uniqueDecks = [...new Set(data.map(c => c.deck_name).filter(Boolean))];
            setDecks(uniqueDecks);
        } catch (error) {
            console.error('Error fetching cards:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateCard = async (e) => {
        e.preventDefault();

        // Trim and sanitize inputs
        const front = newFront.trim().slice(0, 500);
        const back = newBack.trim().slice(0, 500);
        const deck = newDeck.trim().slice(0, 100);

        // Validation
        if (!front || !back || !deck) {
            alert('Please fill in all fields.');
            return;
        }

        if (front.length < 3 || back.length < 3) {
            alert('Question and answer must be at least 3 characters.');
            return;
        }

        setCreating(true);
        try {
            const { data, error } = await supabase
                .from('student_flashcards')
                .insert([{
                    user_id: user.id,
                    front: front,
                    back: back,
                    deck_name: deck,
                    ease_factor: 2.5,
                    interval_days: 0,
                    repetitions: 0,
                    next_review_date: new Date().toISOString()
                }])
                .select()
                .single();

            if (error) throw error;

            setCards([data, ...cards]);
            if (!decks.includes(deck)) {
                setDecks([...decks, deck]);
            }
            setNewFront('');
            setNewBack('');
            setShowForm(false);
        } catch (error) {
            alert('Failed to create card. Please try again.');
        } finally {
            setCreating(false);
        }
    };

    const handleDeleteCard = async (id) => {
        if (!window.confirm('Delete this flashcard?')) return;
        try {
            const { error } = await supabase.from('student_flashcards').delete().eq('id', id);
            if (error) throw error;
            setCards(cards.filter(c => c.id !== id));
        } catch (error) {
            console.error('Error deleting card:', error);
        }
    };

    const startStudy = () => {
        let cardsToStudy = selectedDeck === 'All' ? cards : cards.filter(c => c.deck_name === selectedDeck);
        const due = cardsToStudy.filter(card => new Date(card.next_review_date) <= new Date());

        if (due.length === 0) {
            alert("No cards due for review in this deck!");
            return;
        }

        // Shuffle due cards and create learning queue
        const shuffled = [...due].sort(() => Math.random() - 0.5);
        setDueCards(shuffled);
        setCurrentCardIndex(0);
        setIsFlipped(false);
        setSessionStats({ again: 0, hard: 0, good: 0, easy: 0 });
        setStudyMode(true);
    };

    const handleRating = async (rating) => {
        const currentCard = dueCards[currentCardIndex];
        const updates = calculateNextReview(currentCard, rating);

        // Update stats
        const ratingName = Object.keys(RATING).find(key => RATING[key] === rating).toLowerCase();
        setSessionStats(prev => ({ ...prev, [ratingName]: prev[ratingName] + 1 }));

        // Update local state
        const updatedCard = { ...currentCard, ...updates };
        setCards(cards.map(c => c.id === currentCard.id ? updatedCard : c));

        // Background DB update
        supabase
            .from('student_flashcards')
            .update(updates)
            .eq('id', currentCard.id)
            .then(({ error }) => {
                if (error) console.error('Error updating card:', error);
            });

        // Anki-style learning queue logic:
        // If interval_days = 0 (Again was pressed), re-queue the card
        // If interval_days >= 1, card has "graduated" and leaves the session

        setIsFlipped(false);

        setTimeout(() => {
            if (updates.interval_days === 0) {
                // Card needs to be re-studied - move it to the end of the queue
                const newQueue = [...dueCards];
                // Remove current card from its position
                newQueue.splice(currentCardIndex, 1);
                // Add updated card to the end
                newQueue.push(updatedCard);
                setDueCards(newQueue);

                // If we're at end of queue after removal, we're done
                // But we just pushed a card, so keep at same index (it will show next card)
                if (currentCardIndex >= newQueue.length) {
                    // Rare edge case - wrap to start
                    setCurrentCardIndex(0);
                }
                // Otherwise stay at same index (next card slides in)
            } else {
                // Card graduated (interval >= 1 day) - remove it from queue
                const newQueue = dueCards.filter((_, idx) => idx !== currentCardIndex);
                setDueCards(newQueue);

                if (newQueue.length === 0) {
                    // All cards graduated - session complete!
                    setCurrentCardIndex(-1);
                } else if (currentCardIndex >= newQueue.length) {
                    // Wrap to start if we were at end
                    setCurrentCardIndex(0);
                }
                // Otherwise stay at same index (next card slides in)
            }
        }, 200);
    };

    if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin" /></div>;

    // Study Mode UI
    if (studyMode) {
        const currentCard = currentCardIndex >= 0 ? dueCards[currentCardIndex] : null;
        // Show cards remaining instead of position-based progress
        const cardsRemaining = dueCards.length;
        const totalReviewed = sessionStats.again + sessionStats.hard + sessionStats.good + sessionStats.easy;

        return (
            <div className="max-w-lg mx-auto py-8 px-4 min-h-[calc(100vh-100px)] flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Study Session</h2>
                        <p className="text-sm text-slate-500">{selectedDeck === 'All' ? 'All Decks' : selectedDeck}</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-slate-500">
                            {cardsRemaining} cards left
                        </span>
                        <button onClick={() => setStudyMode(false)} className="text-slate-400 hover:text-slate-600 text-sm">
                            Exit
                        </button>
                    </div>
                </div>

                {/* Progress Bar - shows reviewed vs remaining */}
                <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full mb-6 overflow-hidden">
                    <motion.div
                        className="h-full bg-purple-600"
                        animate={{ width: totalReviewed > 0 ? `${Math.min(100, (totalReviewed / (totalReviewed + cardsRemaining)) * 100)}%` : '0%' }}
                    />
                </div>

                {/* Card Area */}
                <div className="flex-1 flex items-center justify-center">
                    <AnimatePresence mode="wait">
                        {currentCard ? (
                            <motion.div
                                key={currentCard.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, x: -100 }}
                                className="w-full"
                            >
                                {/* Flashcard */}
                                <div
                                    onClick={() => setIsFlipped(!isFlipped)}
                                    className="cursor-pointer"
                                    style={{ perspective: '1000px' }}
                                >
                                    <motion.div
                                        className="relative w-full aspect-[4/3]"
                                        style={{
                                            transformStyle: 'preserve-3d',
                                            transformOrigin: 'center center'
                                        }}
                                        animate={{ rotateY: isFlipped ? 180 : 0 }}
                                        transition={{ duration: 0.5, ease: 'easeInOut' }}
                                    >
                                        {/* Front */}
                                        <Card
                                            className="absolute w-full h-full flex flex-col items-center justify-center p-8 text-center border-2 border-purple-200 dark:border-purple-800 bg-white dark:bg-slate-800 shadow-xl rounded-xl"
                                            style={{
                                                backfaceVisibility: 'hidden',
                                                WebkitBackfaceVisibility: 'hidden'
                                            }}
                                        >
                                            <span className="absolute top-4 left-4 text-xs bg-purple-100 dark:bg-purple-900/50 text-purple-600 px-2 py-1 rounded">
                                                {currentCard.deck_name}
                                            </span>
                                            <p className="text-xs text-slate-400 mb-4">QUESTION</p>
                                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">{currentCard.front}</h3>
                                            <p className="absolute bottom-4 text-xs text-slate-400">Tap to reveal answer</p>
                                        </Card>

                                        {/* Back */}
                                        <Card
                                            className="absolute w-full h-full flex flex-col items-center justify-center p-8 text-center border-2 border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 shadow-xl rounded-xl"
                                            style={{
                                                backfaceVisibility: 'hidden',
                                                WebkitBackfaceVisibility: 'hidden',
                                                transform: 'rotateY(180deg)'
                                            }}
                                        >
                                            <p className="text-xs text-green-600 mb-4">ANSWER</p>
                                            <h3 className="text-lg font-medium text-slate-900 dark:text-white">{currentCard.back}</h3>
                                        </Card>
                                    </motion.div>
                                </div>

                                {/* Rating Buttons - Show after flip */}
                                <AnimatePresence>
                                    {isFlipped && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="mt-6"
                                        >
                                            <p className="text-center text-sm text-slate-500 mb-3">How well did you know this?</p>
                                            <div className="grid grid-cols-4 gap-2">
                                                {(() => {
                                                    const previews = getIntervalPreviews(currentCard);
                                                    return (
                                                        <>
                                                            <RatingButton
                                                                onClick={() => handleRating(RATING.AGAIN)}
                                                                label="Again"
                                                                interval={previews.again}
                                                                color="red"
                                                                icon={<RotateCcw size={18} />}
                                                            />
                                                            <RatingButton
                                                                onClick={() => handleRating(RATING.HARD)}
                                                                label="Hard"
                                                                interval={previews.hard}
                                                                color="orange"
                                                                icon={<ThumbsDown size={18} />}
                                                            />
                                                            <RatingButton
                                                                onClick={() => handleRating(RATING.GOOD)}
                                                                label="Good"
                                                                interval={previews.good}
                                                                color="green"
                                                                icon={<ThumbsUp size={18} />}
                                                            />
                                                            <RatingButton
                                                                onClick={() => handleRating(RATING.EASY)}
                                                                label="Easy"
                                                                interval={previews.easy}
                                                                color="blue"
                                                                icon={<Zap size={18} />}
                                                            />
                                                        </>
                                                    );
                                                })()}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        ) : (
                            // Session Complete
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center p-8 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border w-full"
                            >
                                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Session Complete!</h3>
                                <p className="text-slate-500 mb-6">You reviewed {dueCards.length} cards</p>

                                {/* Stats */}
                                <div className="grid grid-cols-4 gap-2 mb-6 text-center">
                                    <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                                        <div className="text-2xl font-bold text-red-600">{sessionStats.again}</div>
                                        <div className="text-xs text-red-500">Again</div>
                                    </div>
                                    <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-lg">
                                        <div className="text-2xl font-bold text-orange-600">{sessionStats.hard}</div>
                                        <div className="text-xs text-orange-500">Hard</div>
                                    </div>
                                    <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                                        <div className="text-2xl font-bold text-green-600">{sessionStats.good}</div>
                                        <div className="text-xs text-green-500">Good</div>
                                    </div>
                                    <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                                        <div className="text-2xl font-bold text-blue-600">{sessionStats.easy}</div>
                                        <div className="text-xs text-blue-500">Easy</div>
                                    </div>
                                </div>

                                <Button onClick={() => setStudyMode(false)} className="w-full">
                                    Back to Dashboard
                                </Button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        );
    }

    // Dashboard View
    const filteredCards = selectedDeck === 'All' ? cards : cards.filter(c => c.deck_name === selectedDeck);
    const dueCount = filteredCards.filter(card => new Date(card.next_review_date) <= new Date()).length;

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                        <BrainCircuit className="text-purple-600" />
                        My Flashcards
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400">
                        Master your knowledge with spaced repetition.
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button onClick={() => setShowForm(!showForm)} variant="outline">
                        <Plus size={20} className="mr-2" /> New Card
                    </Button>
                    <Button
                        onClick={startStudy}
                        disabled={dueCount === 0}
                        className={dueCount > 0 ? "bg-purple-600 hover:bg-purple-700 text-white" : ""}
                    >
                        <RotateCw size={20} className="mr-2" />
                        Study ({dueCount} due)
                    </Button>
                </div>
            </div>

            {/* Deck Selector */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
                <button
                    onClick={() => setSelectedDeck('All')}
                    className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${selectedDeck === 'All'
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400'
                        }`}
                >
                    All Decks ({cards.length})
                </button>
                {decks.map(deck => {
                    const deckCount = cards.filter(c => c.deck_name === deck).length;
                    return (
                        <button
                            key={deck}
                            onClick={() => setSelectedDeck(deck)}
                            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${selectedDeck === deck
                                ? 'bg-purple-600 text-white'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400'
                                }`}
                        >
                            {deck} ({deckCount})
                        </button>
                    );
                })}
            </div>

            {/* New Card Form */}
            {showForm && (
                <Card className="p-6 border-purple-200 dark:border-purple-900/50 bg-purple-50/50 dark:bg-purple-900/10">
                    <form onSubmit={handleCreateCard} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Deck</label>
                                <div className="relative">
                                    <FolderPlus className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <Input
                                        value={newDeck}
                                        onChange={(e) => setNewDeck(e.target.value)}
                                        placeholder="e.g. Engine Parts"
                                        className="pl-10"
                                        list="deck-suggestions"
                                        required
                                    />
                                    <datalist id="deck-suggestions">
                                        {decks.map(d => <option key={d} value={d} />)}
                                    </datalist>
                                </div>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Front (Question)</label>
                                <Input
                                    value={newFront}
                                    onChange={(e) => setNewFront(e.target.value)}
                                    placeholder="What is the function of the alternator?"
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Back (Answer)</label>
                            <textarea
                                value={newBack}
                                onChange={(e) => setNewBack(e.target.value)}
                                placeholder="Charges the battery and powers the electrical system while the engine is running."
                                className="w-full p-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white h-24 resize-none"
                                required
                            />
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
                            <Button type="submit" disabled={creating}>
                                {creating ? 'Creating...' : 'Add Flashcard'}
                            </Button>
                        </div>
                    </form>
                </Card>
            )}

            {/* Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCards.map((card) => {
                    const isDue = new Date(card.next_review_date) <= new Date();
                    return (
                        <Card key={card.id} className={`p-5 relative group hover:shadow-md transition-shadow ${isDue ? 'ring-2 ring-purple-500' : ''}`}>
                            <div className="absolute top-3 right-3 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-slate-500">
                                    {card.deck_name}
                                </span>
                                <button
                                    onClick={() => handleDeleteCard(card.id)}
                                    className="text-slate-400 hover:text-red-500 transition-colors"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                            <h3 className="font-medium text-slate-900 dark:text-white line-clamp-2 pr-16">{card.front}</h3>
                            <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                                <p className="text-sm text-slate-500 line-clamp-2">{card.back}</p>
                            </div>
                            <div className="mt-3 flex items-center justify-between text-xs">
                                <span className={`px-2 py-1 rounded ${isDue ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300' : 'text-slate-400'}`}>
                                    {isDue ? 'Due now' : `Due: ${new Date(card.next_review_date).toLocaleDateString()}`}
                                </span>
                                <span className="text-slate-400">
                                    {card.interval_days > 0 ? formatInterval(card.interval_days) : 'New'}
                                </span>
                            </div>
                        </Card>
                    );
                })}

                {filteredCards.length === 0 && (
                    <div className="col-span-full text-center py-12 text-slate-500">
                        <Layers className="mx-auto mb-4 opacity-20" size={48} />
                        <p>No flashcards yet. Create your first one!</p>
                        <Button variant="link" onClick={() => setShowForm(true)} className="mt-2">
                            Create Card
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}

// Rating Button Component
function RatingButton({ onClick, label, interval, color, icon }) {
    const colorClasses = {
        red: 'bg-red-50 hover:bg-red-100 text-red-700 dark:bg-red-900/30 dark:hover:bg-red-900/50 dark:text-red-300',
        orange: 'bg-orange-50 hover:bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:hover:bg-orange-900/50 dark:text-orange-300',
        green: 'bg-green-50 hover:bg-green-100 text-green-700 dark:bg-green-900/30 dark:hover:bg-green-900/50 dark:text-green-300',
        blue: 'bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 dark:text-blue-300'
    };

    return (
        <button
            onClick={onClick}
            className={`p-3 rounded-xl flex flex-col items-center gap-1 transition-colors ${colorClasses[color]}`}
        >
            {icon}
            <span className="text-xs font-bold">{label}</span>
            <span className="text-[10px] opacity-70">{interval}</span>
        </button>
    );
}
