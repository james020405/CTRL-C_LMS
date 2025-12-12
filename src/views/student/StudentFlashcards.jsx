import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/input';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { useToast } from '../../components/ui/Toast';
import { calculateNextReview, getIntervalPreviews, RATING, formatInterval } from '../../lib/spacedRepetition';
import { Plus, Trash2, RotateCw, CheckCircle, BrainCircuit, Loader2, Layers, FolderPlus, RotateCcw, ThumbsDown, ThumbsUp, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function StudentFlashcards() {
    const { user } = useAuth();
    const { toast } = useToast();
    const [cards, setCards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [studyMode, setStudyMode] = useState(false);
    const [dueCards, setDueCards] = useState([]);
    const [currentCardIndex, setCurrentCardIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [showForm, setShowForm] = useState(false);

    // Dialog State
    const [showResetConfirm, setShowResetConfirm] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [cardToDelete, setCardToDelete] = useState(null);

    // Decks State
    const [decks, setDecks] = useState([]);
    const [selectedDeck, setSelectedDeck] = useState('All');

    // New Card Form
    const [newFront, setNewFront] = useState('');
    const [newBack, setNewBack] = useState('');
    const [newDeck, setNewDeck] = useState('');
    const [creating, setCreating] = useState(false);

    // Deck Selector State
    const [isCreatingDeck, setIsCreatingDeck] = useState(false);

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
            toast.error('Failed to load flashcards');
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
            toast.error('Please fill in all fields.');
            return;
        }

        if (front.length < 3 || back.length < 3) {
            toast.error('Question and answer must be at least 3 characters.');
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
            // Don't reset deck if user might add more to same deck, but reset custom toggle if desired?
            // Let's keep deck selected for convenience
            setShowForm(false);
            toast.success('Flashcard created!');
        } catch (error) {
            toast.error('Failed to create card. Please try again.');
        } finally {
            setCreating(false);
        }
    };

    const handleDeleteClick = (id) => {
        setCardToDelete(id);
        setShowDeleteConfirm(true);
    };

    const confirmDeleteCard = async () => {
        if (!cardToDelete) return;
        try {
            const { error } = await supabase.from('student_flashcards').delete().eq('id', cardToDelete);
            if (error) throw error;
            setCards(cards.filter(c => c.id !== cardToDelete));
            toast.success('Flashcard deleted');
        } catch (error) {
            console.error('Error deleting card:', error);
            toast.error('Failed to delete card');
        } finally {
            setShowDeleteConfirm(false);
            setCardToDelete(null);
        }
    };

    const handleResetDeck = () => {
        setShowResetConfirm(true);
    };

    const confirmResetDeck = async () => {
        const cardsToReset = selectedDeck === 'All' ? cards : cards.filter(c => c.deck_name === selectedDeck);
        const ids = cardsToReset.map(c => c.id);

        try {
            const updates = {
                ease_factor: 2.5,
                interval_days: 0,
                repetitions: 0,
                next_review_date: new Date().toISOString()
            };

            const { error } = await supabase
                .from('student_flashcards')
                .update(updates)
                .in('id', ids);

            if (error) throw error;

            // Update local state
            setCards(cards.map(c => ids.includes(c.id) ? { ...c, ...updates } : c));
            toast.success("Deck progress reset successfully");
        } catch (error) {
            console.error('Error resetting deck:', error);
            toast.error("Failed to reset deck.");
        } finally {
            setShowResetConfirm(false);
        }
    };

    const startStudy = () => {
        let cardsToStudy = selectedDeck === 'All' ? cards : cards.filter(c => c.deck_name === selectedDeck);
        const due = cardsToStudy.filter(card => new Date(card.next_review_date) <= new Date());

        if (due.length === 0) {
            toast.info("No cards due for review in this deck!");
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
        // If interval_days < 1 (Still in learning steps like 1 min, 7 mins), re-queue the card
        // If interval_days >= 1, card has "graduated" and leaves the session

        setIsFlipped(false);

        setTimeout(() => {
            if (updates.interval_days < 1) {
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
                <div className="flex-1 flex items-center justify-center relative mb-8">
                    <AnimatePresence mode="popLayout">
                        {currentCard ? (
                            // Render a stack of up to 3 cards
                            dueCards.slice(currentCardIndex, currentCardIndex + 3).map((card, index) => {
                                // index 0 is active card, 1 is next, 2 is after that
                                const isTop = index === 0;

                                return (
                                    <motion.div
                                        key={card.id}
                                        layout // Use layout animation for smooth stacking
                                        initial={{
                                            opacity: 0,
                                            scale: 0.9 - (index * 0.05),
                                            y: 20 + (index * 15),
                                            rotate: (Math.random() - 0.5) * 2 // slight random rotation
                                        }}
                                        animate={{
                                            opacity: 1 - (index * 0.1), // Fade out background cards slightly
                                            scale: 1 - (index * 0.05), // 1, 0.95, 0.9
                                            y: index * 10, // 0, 12, 24
                                            zIndex: 50 - index * 10,
                                            rotate: isTop ? 0 : (index % 2 === 0 ? 1 : -1) // subtle rotation for stack effect
                                        }}
                                        exit={{
                                            opacity: 0,
                                            x: -300,
                                            rotate: -15,
                                            transition: { duration: 0.2 }
                                        }}
                                        transition={{ type: "spring", stiffness: 260, damping: 20 }}
                                        className={`w-full absolute inset-0 m-auto h-fit px-4 ${!isTop ? 'pointer-events-none' : ''}`}
                                    >
                                        {/* Content only interactive if top card */}
                                        <div
                                            onClick={() => isTop && setIsFlipped(!isFlipped)}
                                            className={`cursor-pointer w-full relative ${!isTop ? 'brightness-95' : ''}`} // Darken non-top cards
                                            style={{ perspective: '1000px' }}
                                        >
                                            <motion.div
                                                className="relative w-full aspect-[4/3] max-h-[400px]"
                                                style={{
                                                    transformStyle: 'preserve-3d',
                                                    transformOrigin: 'center center'
                                                }}
                                                animate={{ rotateY: isTop && isFlipped ? 180 : 0 }}
                                                transition={{ duration: 0.4, ease: 'easeOut' }}
                                            >
                                                {/* Front */}
                                                <Card
                                                    className="absolute w-full h-full flex flex-col items-center justify-center p-8 text-center border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-xl rounded-2xl"
                                                    style={{
                                                        backfaceVisibility: 'hidden',
                                                        WebkitBackfaceVisibility: 'hidden'
                                                    }}
                                                >
                                                    <span className="absolute top-4 left-4 text-xs bg-slate-100 dark:bg-slate-700/50 text-slate-500 px-2 py-1 rounded">
                                                        {card.deck_name}
                                                    </span>
                                                    <p className="text-xs text-slate-400 mb-4 font-semibold tracking-wider">QUESTION</p>
                                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white leading-relaxed select-none">
                                                        {card.front}
                                                    </h3>
                                                    {isTop && <p className="absolute bottom-4 text-xs text-slate-300 dark:text-slate-600 animate-pulse">Tap to flip</p>}
                                                </Card>

                                                {/* Back */}
                                                <Card
                                                    className="absolute w-full h-full flex flex-col items-center justify-center p-8 text-center border-2 border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-900/10 shadow-xl rounded-2xl"
                                                    style={{
                                                        backfaceVisibility: 'hidden',
                                                        WebkitBackfaceVisibility: 'hidden',
                                                        transform: 'rotateY(180deg)'
                                                    }}
                                                >
                                                    <p className="text-xs text-purple-600 dark:text-purple-400 mb-4 font-semibold tracking-wider">ANSWER</p>
                                                    <h3 className="text-lg font-medium text-slate-900 dark:text-white leading-relaxed select-none">
                                                        {card.back}
                                                    </h3>
                                                </Card>
                                            </motion.div>
                                        </div>
                                    </motion.div>
                                );
                            })
                        ) : (
                            // Session Complete
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center p-8 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 w-full max-w-md mx-auto relative z-50"
                            >
                                <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
                                </div>
                                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Session Complete!</h3>
                                <p className="text-slate-500 mb-8">You reviewed {dueCards.length + (sessionStats.again + sessionStats.hard + sessionStats.good + sessionStats.easy)} cards</p>

                                {/* Stats */}
                                <div className="grid grid-cols-4 gap-3 mb-8 text-center">
                                    <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                                        <div className="text-xl font-bold text-red-500">{sessionStats.again}</div>
                                        <div className="text-[10px] uppercase tracking-wider text-slate-400 mt-1">Again</div>
                                    </div>
                                    <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                                        <div className="text-xl font-bold text-orange-500">{sessionStats.hard}</div>
                                        <div className="text-[10px] uppercase tracking-wider text-slate-400 mt-1">Hard</div>
                                    </div>
                                    <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                                        <div className="text-xl font-bold text-green-500">{sessionStats.good}</div>
                                        <div className="text-[10px] uppercase tracking-wider text-slate-400 mt-1">Good</div>
                                    </div>
                                    <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                                        <div className="text-xl font-bold text-blue-500">{sessionStats.easy}</div>
                                        <div className="text-[10px] uppercase tracking-wider text-slate-400 mt-1">Easy</div>
                                    </div>
                                </div>

                                <Button onClick={() => setStudyMode(false)} className="w-full bg-slate-900 text-white hover:bg-slate-800">
                                    Back to Dashboard
                                </Button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Fixed Action Area - Prevents overlap */}
                <div className="h-32 flex flex-col justify-end pb-4">
                    <AnimatePresence>
                        {isFlipped && currentCard && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 20 }}
                                className="w-full"
                            >
                                <p className="text-center text-xs text-slate-400 mb-2 uppercase tracking-wide font-medium">How well did you know this?</p>
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
                                                    icon={<RotateCcw size={16} />}
                                                />
                                                <RatingButton
                                                    onClick={() => handleRating(RATING.HARD)}
                                                    label="Hard"
                                                    interval={previews.hard}
                                                    color="orange"
                                                    icon={<ThumbsDown size={16} />}
                                                />
                                                <RatingButton
                                                    onClick={() => handleRating(RATING.GOOD)}
                                                    label="Good"
                                                    interval={previews.good}
                                                    color="green"
                                                    icon={<ThumbsUp size={16} />}
                                                />
                                                <RatingButton
                                                    onClick={() => handleRating(RATING.EASY)}
                                                    label="Easy"
                                                    interval={previews.easy}
                                                    color="blue"
                                                    icon={<Zap size={16} />}
                                                />
                                            </>
                                        );
                                    })()}
                                </div>
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
                    {dueCount < filteredCards.length && (
                        <Button onClick={handleResetDeck} variant="ghost" size="icon" title="Reset Progress (Study All)">
                            <RotateCcw size={20} className="text-slate-400 hover:text-slate-600" />
                        </Button>
                    )}
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

                                    {!isCreatingDeck ? (
                                        <select
                                            value={newDeck}
                                            onChange={(e) => {
                                                if (e.target.value === 'NEW_DECK_OPTION') {
                                                    setIsCreatingDeck(true);
                                                    setNewDeck('');
                                                } else {
                                                    setNewDeck(e.target.value);
                                                }
                                            }}
                                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white appearance-none cursor-pointer"
                                            required
                                        >
                                            <option value="" disabled>Select a deck...</option>
                                            {decks.map(d => <option key={d} value={d}>{d}</option>)}
                                            <option value="NEW_DECK_OPTION" className="font-bold text-purple-600">+ Create New Deck</option>
                                        </select>
                                    ) : (
                                        <div className="flex gap-2">
                                            <Input
                                                value={newDeck}
                                                onChange={(e) => setNewDeck(e.target.value)}
                                                placeholder="Enter deck name..."
                                                className="pl-10 flex-1"
                                                required
                                                autoFocus
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                className="px-3"
                                                onClick={() => {
                                                    setIsCreatingDeck(false);
                                                    setNewDeck('');
                                                }}
                                            >
                                                Cancel
                                            </Button>
                                        </div>
                                    )}
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
                                    onClick={() => handleDeleteClick(card.id)}
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

            <ConfirmDialog
                isOpen={showResetConfirm}
                onClose={() => setShowResetConfirm(false)}
                onConfirm={confirmResetDeck}
                title="Reset Deck Progress?"
                description="This will reset the interval and learning progress for all cards in the current view. They will all become 'New' cards."
                confirmText="Yes, Reset All"
                cancelText="Cancel"
                variant="warning"
            />

            <ConfirmDialog
                isOpen={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                onConfirm={confirmDeleteCard}
                title="Delete Flashcard?"
                description="Are you sure you want to delete this flashcard? This action cannot be undone."
                confirmText="Delete"
                cancelText="Cancel"
                variant="danger"
            />
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
