
import { useState, useEffect } from 'react'
import { useGameLogic } from './hooks/useGameLogic'
import { useFloatingTexts } from './hooks/useFloatingTexts'
import { COLORS } from './constants'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from './lib/utils'

function App() {
    const { grid, score, nextItemValue, dropItem, resetGame, gameOver, mergeEvents, highScore, isProcessing } = useGameLogic()
    const { texts, addText } = useFloatingTexts()

    // React to merge events to trigger floating text and sounds
    useEffect(() => {
        if (mergeEvents.length > 0) {
            // Play merge sound
            import('./lib/sounds').then(s => s.playSound('merge'));

            // Haptic feedback (if available)
            if (navigator.vibrate) navigator.vibrate(50);

            mergeEvents.forEach(event => {
                // For each merge, add floating text
                // We need to map row/col to positions approximately
                // Since we know the col, and row is "somewhere", let's use the event data
                // If row is -1 (unknown), we might default to center or top of stack?
                // Our current logic in useGameLogic tries to populate row.
                const r = event.row !== -1 ? event.row : 6; // Default to bottom if unknown
                addText(`+ ${Math.pow(2, event.value)} `, event.col, r, 'text-yellow-400');
            });
        }
    }, [mergeEvents, addText]);

    return (
        <div className="w-full h-screen flex flex-col items-center justify-center bg-zinc-950 text-white relative touch-none overflow-hidden font-sans select-none">

            {/* Background Gradient */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-800 via-zinc-950 to-zinc-950 -z-10" />

            {/* Header */}
            <div className="absolute top-12 left-0 right-0 flex justify-between px-8 items-center z-10 w-full max-w-md mx-auto">
                <div>
                    <h1 className="text-3xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 drop-shadow-sm">
                        MERGE!!
                    </h1>
                    <p className="text-xs font-semibold text-zinc-500 tracking-widest uppercase">Best: {highScore}</p>
                </div>
                <div className="text-right">
                    <p className="text-[10px] font-bold text-zinc-500 tracking-widest uppercase mb-1">SCORE</p>
                    <motion.p
                        key={score}
                        initial={{ scale: 1.5, color: '#fbbf24' }}
                        animate={{ scale: 1, color: '#ffffff' }}
                        className="text-4xl font-mono font-bold tabular-nums leading-none"
                    >
                        {score}
                    </motion.p>
                </div>
            </div>

            {/* Next Item Indicator */}
            <div className="mt-24 mb-6 flex flex-col items-center z-10">
                <p className="text-[10px] font-bold text-zinc-600 tracking-widest uppercase mb-2">NEXT DOT</p>
                <div className="relative">
                    <div className="absolute inset-0 blur-xl bg-white/10 rounded-full scale-150" />
                    <motion.div
                        key={nextItemValue}
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        className={cn(
                            "w-16 h-16 rounded-full shadow-lg bg-gradient-to-br flex items-center justify-center text-2xl font-black border-4 border-white/10 z-10 relative",
                            COLORS[nextItemValue - 1]
                        )}
                    >
                        {Math.pow(2, nextItemValue)}
                    </motion.div>
                </div>
            </div>

            {/* Game Board */}
            <div className="bg-zinc-900/50 backdrop-blur-md p-4 rounded-3xl shadow-2xl border border-white/5 w-full max-w-md relative">
                <div className="grid grid-cols-5 gap-3 relative">

                    {/* Floating Texts Layer */}
                    <div className="absolute inset-0 z-50 pointer-events-none">
                        <AnimatePresence>
                            {texts.map(text => (
                                <motion.div
                                    key={text.id}
                                    initial={{ opacity: 1, y: 0, scale: 0.5 }}
                                    animate={{ opacity: 0, y: -100, scale: 1.5 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.8, ease: "easeOut" }}
                                    style={{
                                        position: 'absolute',
                                        left: `${text.x * 20}% `,
                                        top: `${text.y * 14}% `, // Approx grid height calculation
                                        marginLeft: '10%' // Center in column
                                    }}
                                    className={cn("font-black text-2xl shadow-black drop-shadow-md", text.color)}
                                >
                                    {text.text}
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>

                    {grid.map((col, colIndex) => (
                        <div
                            key={colIndex}
                            className={cn(
                                "relative flex flex-col gap-2 w-full h-[500px] bg-black/20 rounded-2xl p-1 transition-colors active:scale-95 duration-100",
                                isProcessing || gameOver ? "cursor-not-allowed opacity-80" : "cursor-pointer hover:bg-white/5"
                            )}
                            onClick={() => {
                                if (isProcessing || gameOver) return;
                                dropItem(colIndex);
                                import('./lib/sounds').then(s => s.playSound('pop'));
                                if (navigator.vibrate) navigator.vibrate(10);
                            }}
                        >
                            {/* Hitbox Overlay */}
                            <div className="absolute inset-0 z-20" />

                            {col.map((item, rowIndex) => (
                                <div key={rowIndex} className="flex-1 flex items-center justify-center relative z-10">
                                    <AnimatePresence mode='popLayout'>
                                        {item && (
                                            <motion.div
                                                layoutId={item.id}
                                                initial={{ y: -50, opacity: 0, scale: 0.5 }}
                                                animate={{ y: 0, opacity: 1, scale: 1 }}
                                                exit={{ scale: 0, opacity: 0 }}
                                                transition={{
                                                    type: "spring",
                                                    stiffness: 400,
                                                    damping: 25,
                                                    mass: 1
                                                }}
                                                onLayoutAnimationComplete={() => {
                                                    // This might fire too often, but good for testing "Merge" feel later
                                                }}
                                                className={cn(
                                                    "w-full aspect-square rounded-full shadow-lg bg-gradient-to-br flex items-center justify-center text-white font-bold text-sm border-2 border-white/20",
                                                    item.color
                                                )}
                                            >
                                                {Math.pow(2, item.value)}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ))}
                        </div>
                    ))}
                </div>

                {/* Game Over Overlay */}
                <AnimatePresence>
                    {gameOver && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center rounded-2xl"
                        >
                            <h2 className="text-4xl font-black text-white mb-2">GAME OVER</h2>
                            <p className="text-zinc-400 mb-6">Score: {score}</p>
                            <button
                                onClick={resetGame}
                                className="px-6 py-2 bg-gradient-to-r from-red-500 to-orange-500 text-white font-bold rounded-full shadow-lg active:scale-95 transition-transform"
                            >
                                Try Again
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Controls / Footer */}
            <div className="mt-12">
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={resetGame}
                    className="px-8 py-3 bg-zinc-800 text-zinc-300 rounded-full text-xs font-bold tracking-widest uppercase hover:bg-zinc-700 border border-white/5 shadow-lg"
                >
                    Restart Game
                </motion.button>
            </div>

        </div>
    )
}

export default App
