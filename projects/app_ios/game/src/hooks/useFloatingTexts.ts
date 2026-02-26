import { useState, useCallback, useEffect } from 'react';

export type FloatingText = {
    id: string;
    x: number; // Col index (needs translation to pixels in UI)
    y: number; // Row index
    text: string;
    color: string;
}

export const useFloatingTexts = () => {
    const [texts, setTexts] = useState<FloatingText[]>([]);

    const addText = useCallback((text: string, col: number, row: number, color: string = 'text-white') => {
        const id = Math.random().toString(36).substr(2, 9);
        setTexts(prev => [...prev, { id, x: col, y: row, text, color }]);

        // Auto remove
        setTimeout(() => {
            setTexts(prev => prev.filter(t => t.id !== id));
        }, 1000);
    }, []);

    return { texts, addText };
};
