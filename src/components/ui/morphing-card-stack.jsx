import { useState, useEffect } from "react"
import { motion, AnimatePresence, LayoutGroup } from "framer-motion"
import { cn } from "../../lib/utils"
import { Grid3X3, Layers, LayoutList, RotateCw } from "lucide-react"
import { useTheme } from "../../context/ThemeContext"

const layoutIcons = {
    stack: Layers,
    grid: Grid3X3,
    list: LayoutList,
}

const SWIPE_THRESHOLD = 50

export function MorphingCardStack({
    cards = [],
    className,
    defaultLayout = "stack",
    onCardClick,
}) {
    const { theme } = useTheme()
    const [layout, setLayout] = useState(defaultLayout)
    const [activeIndex, setActiveIndex] = useState(0)
    const [isDragging, setIsDragging] = useState(false)
    const [isFlipped, setIsFlipped] = useState(false)

    // Reset flip state when changing cards
    useEffect(() => {
        setIsFlipped(false)
    }, [activeIndex])

    if (!cards || cards.length === 0) {
        return null
    }

    const handleDragEnd = (event, info) => {
        const { offset, velocity } = info
        const swipe = Math.abs(offset.x) * velocity.x

        if (offset.x < -SWIPE_THRESHOLD || swipe < -1000) {
            // Swiped left - go to next card
            setActiveIndex((prev) => (prev + 1) % cards.length)
        } else if (offset.x > SWIPE_THRESHOLD || swipe > 1000) {
            // Swiped right - go to previous card
            setActiveIndex((prev) => (prev - 1 + cards.length) % cards.length)
        }
        setIsDragging(false)
    }

    const getStackOrder = () => {
        const reordered = []
        for (let i = 0; i < cards.length; i++) {
            const index = (activeIndex + i) % cards.length
            reordered.push({ ...cards[index], stackPosition: i })
        }
        return reordered.reverse() // Reverse so top card renders last (on top)
    }

    const getLayoutStyles = (stackPosition) => {
        switch (layout) {
            case "stack":
                return {
                    top: stackPosition * 8,
                    left: stackPosition * 8,
                    zIndex: cards.length - stackPosition,
                    rotate: (stackPosition - 1) * 2,
                    position: "absolute",
                }
            case "grid":
            case "list":
                return {
                    top: "auto",
                    left: "auto",
                    zIndex: 1,
                    rotate: 0,
                    position: "relative",
                }
        }
    }

    const containerStyles = {
        stack: "relative h-[400px] w-[500px]",
        grid: "grid grid-cols-2 gap-4 w-full max-w-4xl",
        list: "flex flex-col gap-4 w-full max-w-3xl",
    }

    const displayCards = layout === "stack" ? getStackOrder() : cards.map((c, i) => ({ ...c, stackPosition: i }))

    return (
        <div className={cn("space-y-6", className)}>
            {/* Layout Toggle */}
            <div className="flex items-center justify-center gap-1 rounded-lg bg-slate-100 dark:bg-slate-800 p-1 w-fit mx-auto">
                {Object.keys(layoutIcons).map((mode) => {
                    const Icon = layoutIcons[mode]
                    return (
                        <button
                            key={mode}
                            onClick={() => setLayout(mode)}
                            className={cn(
                                "rounded-md p-2 transition-all",
                                layout === mode
                                    ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm"
                                    : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700/50",
                            )}
                            aria-label={`Switch to ${mode} layout`}
                        >
                            <Icon className="h-4 w-4" />
                        </button>
                    )
                })}
            </div>

            {/* Cards Container */}
            <LayoutGroup>
                <motion.div layout className={cn(containerStyles[layout], "mx-auto perspective-1000")}>
                    <AnimatePresence mode="popLayout">
                        {displayCards.map((card) => {
                            const styles = getLayoutStyles(card.stackPosition)
                            const isTopCard = layout === "stack" && card.stackPosition === 0
                            const flipped = isTopCard && isFlipped
                            const isDark = theme === 'dark'

                            return (
                                <motion.div
                                    key={card.id}
                                    layoutId={card.id}
                                    initial={layout === 'stack' ? { opacity: 0, scale: 0.8 } : { opacity: 0, y: 20 }}
                                    animate={{
                                        opacity: 1,
                                        scale: 1,
                                        x: 0,
                                        y: 0,
                                        ...styles,
                                        rotateY: flipped ? 180 : 0,
                                    }}
                                    exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
                                    transition={{
                                        type: "spring",
                                        stiffness: 300,
                                        damping: 25,
                                    }}
                                    drag={isTopCard ? "x" : false}
                                    dragConstraints={{ left: 0, right: 0 }}
                                    dragElastic={0.7}
                                    onDragStart={() => setIsDragging(true)}
                                    onDragEnd={handleDragEnd}
                                    whileDrag={{ scale: 1.02, cursor: "grabbing" }}
                                    onClick={() => {
                                        if (isDragging) return
                                        if (isTopCard) {
                                            setIsFlipped(!isFlipped)
                                        }
                                        onCardClick?.(card)
                                    }}
                                    className={cn(
                                        "cursor-pointer rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm",
                                        "hover:border-blue-500/50 transition-colors",
                                        layout === "stack" && "w-[500px] h-[350px]",
                                        layout === "stack" && isTopCard && "cursor-grab active:cursor-grabbing",
                                        layout === "grid" && "w-full aspect-square p-6",
                                        layout === "list" && "w-full p-6",
                                        "preserve-3d"
                                    )}
                                    style={{
                                        backgroundColor: isDark ? undefined : (card.color || undefined),
                                        borderColor: isDark ? (card.color || undefined) : undefined,
                                        borderWidth: isDark && card.color ? '2px' : '1px',
                                        transformStyle: "preserve-3d",
                                    }}
                                >
                                    {/* Front Face */}
                                    <div className={cn(
                                        "absolute inset-0 backface-hidden flex flex-col items-center justify-center text-center overflow-y-auto",
                                        layout !== "stack" ? "relative p-0" : "p-8"
                                    )}>
                                        {card.icon && (
                                            <div
                                                className="mb-4 flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white"
                                                style={{
                                                    backgroundColor: isDark ? undefined : 'rgba(255,255,255,0.5)', // Subtle tint on light mode
                                                    color: isDark ? card.color : undefined // Color the icon in dark mode
                                                }}
                                            >
                                                {card.icon}
                                            </div>
                                        )}
                                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{card.title}</h3>
                                        {layout === "stack" && <p className="text-slate-500 dark:text-slate-400">Click to flip</p>}
                                        {layout !== "stack" && (
                                            <p className="text-slate-600 dark:text-slate-300 mt-2">{card.description}</p>
                                        )}
                                    </div>

                                    {/* Back Face (Only for Stack) */}
                                    {layout === "stack" && (
                                        <div
                                            className="absolute inset-0 backface-hidden p-8 flex flex-col items-center justify-center text-center bg-slate-50 dark:bg-slate-800/50 rounded-xl rotate-y-180 overflow-y-auto"
                                        >
                                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Answer</h3>
                                            <p className="text-xl text-slate-700 dark:text-slate-300 leading-relaxed">
                                                {card.description}
                                            </p>
                                        </div>
                                    )}

                                    {isTopCard && layout === "stack" && (
                                        <div className="absolute bottom-4 left-0 right-0 text-center backface-hidden pointer-events-none">
                                            <div className="flex items-center justify-center gap-2 text-sm text-slate-400 dark:text-slate-500">
                                                <RotateCw size={14} />
                                                <span>Click to flip • Swipe to navigate</span>
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            )
                        })}
                    </AnimatePresence>
                </motion.div>
            </LayoutGroup>

            {layout === "stack" && cards.length > 1 && (
                <div className="flex justify-center gap-1.5">
                    {cards.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setActiveIndex(index)}
                            className={cn(
                                "h-1.5 rounded-full transition-all",
                                index === activeIndex ? "w-4 bg-blue-600" : "w-1.5 bg-slate-300 dark:bg-slate-600 hover:bg-slate-400 dark:hover:bg-slate-500",
                            )}
                            aria-label={`Go to card ${index + 1}`}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}
