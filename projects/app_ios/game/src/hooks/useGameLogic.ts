import { useState, useCallback, useEffect } from 'react';
import { Item, Grid, COLORS } from '../constants';
import { v4 as uuidv4 } from 'uuid'; // Need to install uuid if I use it, or just Math.random. Let's use simpler ID.

const ROWS = 7;
const COLS = 5;

const generateId = () => Math.random().toString(36).substr(2, 9);

const GRAVITY_DELAY = 100; // Fast gravity
const MERGE_DELAY = 400; // Slower merge for emphasis
const DROP_DELAY = 150; // Initial drop settle

export const useGameLogic = () => {
    // Initialize state from LocalStorage if available
    const [grid, setGrid] = useState<Grid>(() => {
        const saved = localStorage.getItem('gameState_grid');
        return saved ? JSON.parse(saved) : Array(COLS).fill(null).map(() => Array(ROWS).fill(null));
    });
    const [score, setScore] = useState(() => parseInt(localStorage.getItem('gameState_score') || '0'));
    const [highScore, setHighScore] = useState(() => parseInt(localStorage.getItem('highScore') || '0'));
    const [nextItemValue, setNextItemValue] = useState(1); // Start with level 1 (value 2^1)
    const [gameOver, setGameOver] = useState(false);

    // Processing State
    const [isProcessing, setIsProcessing] = useState(false);
    const [lastAction, setLastAction] = useState<'DROP' | 'GRAVITY' | 'MERGE' | 'NONE'>('NONE');

    // For Animations: Track last merged position and combo
    const [mergeEvents, setMergeEvents] = useState<{ id: string, col: number, row: number, value: number }[]>([]);

    // Effect: Processing Loop (Gravity -> Merge -> Gravity -> Check)
    useEffect(() => {
        if (!isProcessing) return;

        // Determine delay based on last action
        let delay = GRAVITY_DELAY;
        if (lastAction === 'DROP') delay = DROP_DELAY;
        if (lastAction === 'MERGE') delay = MERGE_DELAY;

        const timeoutId = setTimeout(() => {
            // 1. Check Gravity First
            const gravityGrid = applyGravity(grid);
            const gravityChanged = JSON.stringify(grid) !== JSON.stringify(gravityGrid);

            if (gravityChanged) {
                setGrid(gravityGrid);
                setLastAction('GRAVITY');
                // Loop continues due to grid change -> effect re-run
                return;
            }

            // 2. If stable, Check Merges (One pass)
            const { grid: mergedGrid, score: addedScore, merges } = checkMergesIterativeStart(grid);

            if (merges.length > 0) {
                // Update Grid & Score
                setGrid(mergedGrid);
                setScore(prev => {
                    const newScore = prev + addedScore;
                    if (newScore > highScore) {
                        setHighScore(newScore);
                        localStorage.setItem('highScore', newScore.toString());
                    }
                    localStorage.setItem('gameState_score', newScore.toString());
                    return newScore;
                });

                // Trigger events
                setMergeEvents(prev => [...prev, ...merges]);
                setTimeout(() => {
                    setMergeEvents(prev => prev.filter(e => !merges.includes(e)));
                }, 1000);

                setLastAction('MERGE');
                return;
            }

            // 3. If no gravity and no merges -> Stable.
            // Check Game Over (Top row filled?)
            const isFull = grid.some(col => col[0] !== null);
            if (isFull) {
                // Determine if really game over or just top row transiently full?
                // Actually, if we are STABLE and top row has items, it means stack reached top.
                setGameOver(true);
            }

            // Save state
            localStorage.setItem('gameState_grid', JSON.stringify(grid));

            // Done processing
            setIsProcessing(false);
            setLastAction('NONE');

        }, delay);

        return () => clearTimeout(timeoutId);
    }, [isProcessing, grid, highScore, lastAction]);


    // Drop an item into a specific column
    const dropItem = useCallback((colIndex: number) => {
        if (gameOver || isProcessing) return; // Prevent moves while processing

        setGrid(prevGrid => {
            const newGrid = [...prevGrid];
            const column = [...newGrid[colIndex]];

            // Find first empty spot from bottom
            let emptyRowIndex = -1;
            for (let r = ROWS - 1; r >= 0; r--) {
                if (column[r] === null) {
                    emptyRowIndex = r;
                    break;
                }
            }

            if (emptyRowIndex === -1) {
                return prevGrid;
            }

            // Place item
            column[emptyRowIndex] = {
                id: generateId(),
                value: nextItemValue,
                color: COLORS[nextItemValue - 1]
            };

            newGrid[colIndex] = column;
            return newGrid;
        });

        // Start processing cycle
        setIsProcessing(true);
        setLastAction('DROP');
        setNextItemValue(Math.floor(Math.random() * 5) + 1);

    }, [gameOver, isProcessing, nextItemValue]);


    const resetGameLogic = () => {
        const newGrid = Array(COLS).fill(null).map(() => Array(ROWS).fill(null));
        setGrid(newGrid);
        setScore(0);
        setHighScore(prev => prev);
        setGameOver(false);
        setNextItemValue(1);
        setIsProcessing(false);
        setLastAction('NONE');
        localStorage.removeItem('gameState_grid');
        localStorage.setItem('gameState_score', '0');
    };

    return { grid, score, nextItemValue, dropItem, gameOver, resetGame: resetGameLogic, mergeEvents, highScore, isProcessing };
};

// Helper to apply gravity: Shift non-null items to the bottom
function applyGravity(grid: Grid): Grid {
    return grid.map(col => {
        const newCol = new Array(ROWS).fill(null);
        const activeItems = col.filter(i => i !== null);
        // Fill from bottom (ROWS-1) upwards
        for (let i = 0; i < activeItems.length; i++) {
            newCol[ROWS - activeItems.length + i] = activeItems[i];
        }
        return newCol;
    });
}

// Single Pass Merge Check (Iterative)
function checkMergesIterativeStart(grid: Grid): { grid: Grid, score: number, merges: { id: string, col: number, row: number, value: number }[] } {
    let newGrid = grid.map(col => [...col]);
    let totalScore = 0;
    let allMerges: { id: string, col: number, row: number, value: number }[] = [];

    // We only do ONE pass of merges to allow animation steps.
    const used = Array(COLS).fill(false).map(() => Array(ROWS).fill(false));

    // Priority: Vertical then Horizontal.

    // Vertical
    for (let c = 0; c < COLS; c++) {
        for (let r = ROWS - 2; r >= 0; r--) {
            if (used[c][r] || used[c][r + 1]) continue;

            const item = newGrid[c][r];
            const downItem = newGrid[c][r + 1];

            if (item && downItem && item.value === downItem.value) {
                // Merge into downItem
                const newValue = item.value + 1;
                const newColor = COLORS[newValue - 1] || 'bg-black';

                newGrid[c][r + 1] = { ...downItem, value: newValue, color: newColor, id: downItem.id };
                newGrid[c][r] = null;

                used[c][r] = true;
                used[c][r + 1] = true;

                totalScore += Math.pow(2, newValue);
                allMerges.push({ id: downItem.id, col: c, row: r + 1, value: newValue });
            }
        }
    }

    // Horizontal
    for (let r = ROWS - 1; r >= 0; r--) {
        for (let c = 0; c < COLS - 1; c++) {
            if (used[c][r] || used[c + 1][r]) continue;

            const item = newGrid[c][r];
            const rightItem = newGrid[c + 1][r];

            if (item && rightItem && item.value === rightItem.value) {
                const newValue = item.value + 1;
                const newColor = COLORS[newValue - 1] || 'bg-black';

                newGrid[c + 1][r] = { ...rightItem, value: newValue, color: newColor, id: rightItem.id };
                newGrid[c][r] = null;

                used[c][r] = true;
                used[c + 1][r] = true;

                totalScore += Math.pow(2, newValue);
                allMerges.push({ id: rightItem.id, col: c + 1, row: r, value: newValue });
            }
        }
    }

    return { grid: newGrid, score: totalScore, merges: allMerges };
}

// Iterative 2D Merge Logic
function resolveGrid(initialGrid: Grid): { grid: Grid, score: number, merges: { id: string, col: number, row: number, value: number }[] } {
    let grid = initialGrid.map(col => [...col]); // Deep copy of structure (items are refs but immutable mostly)
    let totalScore = 0;
    let allMerges: { id: string, col: number, row: number, value: number }[] = [];
    let changed = true;
    let iterations = 0;

    while (changed && iterations < 10) { // Safety break
        changed = false;
        iterations++;

        // 1. Apply Gravity First (Ensure everything is settled)
        // actually we should do this at start of loop
        const gravityGrid = applyGravity(grid);
        // Check if gravity moved anything? Not strictly needed for logic correctness, 
        // but visual updates might want to know. For logic, we just use the result.
        grid = gravityGrid;

        // 2. Find Merges (Pairwise)
        // We'll prioritize Vertical matches then Horizontal.
        // To avoid double-merging in one pass (e.g. 2-2-2 -> 4-2 or 2-4), we track 'used' cells.
        const used = Array(COLS).fill(false).map(() => Array(ROWS).fill(false));

        // Scan Bottom-Up, Left-Right
        for (let r = ROWS - 1; r >= 0; r--) {
            for (let c = 0; c < COLS; c++) {
                if (used[c][r]) continue;

                const item = grid[c][r];
                if (!item) continue;

                // Check DOWN (Vertical Merge)
                // (Since we scan bottom-up, 'Down' is r+1, which we already visited. 
                // So strictly we should look UP (r-1)? Or checking Down allows us to merge *into* the bottom one which is processed?
                // Actually, if we scan Bottom-Up, we process row N, then N-1.
                // If row N has item, and N-1 has item.
                // We are at N-1. Check DOWN (N). Match? Merge into N?
                // Yes, merging into N (Bottom) is better for gravity feeling.

                let merged = false;

                // Check DOWN neighbor (r+1)
                if (r + 1 < ROWS) {
                    const downItem = grid[c][r + 1];
                    if (downItem && !used[c][r + 1] && downItem.value === item.value) {
                        // Merge Vertical
                        // Merge into DOWN cell (keep it there, clear current)
                        // Effectively: grid[c][r+1] upgrades. grid[c][r] -> null
                        const newValue = item.value + 1;
                        const newColor = COLORS[newValue - 1] || 'bg-black';

                        // Create new item in DOWN slot
                        grid[c][r + 1] = {
                            ...downItem,
                            value: newValue,
                            color: newColor
                        };
                        grid[c][r] = null; // Remove current

                        // Mark used
                        used[c][r + 1] = true;
                        used[c][r] = true;

                        // Score & Events
                        totalScore += Math.pow(2, newValue);
                        allMerges.push({
                            id: downItem.id, // Use ID of the 'survivor' or new?
                            col: c,
                            row: r + 1,
                            value: newValue
                        });

                        changed = true;
                        merged = true;
                    }
                }

                // If not merged vertically, check Horizontal
                // Check RIGHT neighbor (c+1)
                // Why Right? Scan Left-Right.
                // If we are at c, check c+1.
                if (!merged && c + 1 < COLS) {
                    const rightItem = grid[c + 1][r];
                    if (rightItem && !used[c + 1][r] && rightItem.value === item.value) {
                        // Merge Horizontal
                        // Merge into CURRENT cell (Left) or RIGHT?
                        // "Left Join" -> grid[c][r] upgrades. grid[c+1][r] -> null
                        // Allows items above Right to fall.
                        const newValue = item.value + 1;
                        const newColor = COLORS[newValue - 1] || 'bg-black';

                        grid[c][r] = {
                            ...item,
                            value: newValue,
                            color: newColor
                        };
                        grid[c + 1][r] = null;

                        used[c][r] = true;
                        used[c + 1][r] = true;

                        totalScore += Math.pow(2, newValue);
                        allMerges.push({
                            id: item.id,
                            col: c,
                            row: r,
                            value: newValue
                        });

                        changed = true;
                    }
                }
            }
        }
    }

    // Final gravity pass to ensure clean state
    grid = applyGravity(grid);

    return { grid, score: totalScore, merges: allMerges };
}

// Wrapper to replace old checkMerges
function checkMerges(grid: Grid) {
    return resolveGrid(grid);
}

