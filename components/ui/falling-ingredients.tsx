'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const ingredients = [
    '🍅', // Tomato
    '🥬', // Lettuce
    '🥩', // Meat
    '🧀', // Cheese
    '🥓', // Bacon
    '🍄', // Mushroom
    '🥕', // Carrot
    '🥦', // Broccoli
    '🧅', // Onion
    '🍞', // Bread
    '🌶️', // Pepper
    '🥑', // Avocado
];

interface FallingItem {
    id: number;
    x: number;
    delay: number;
    duration: number;
    size: number;
    ingredient: string;
    rotation: number;
}

export function FallingIngredients() {
    const [items, setItems] = useState<FallingItem[]>([]);

    useEffect(() => {
        // Generate items only on the client to avoid hydration mismatch
        const newItems = Array.from({ length: 25 }).map((_, i) => ({
            id: i,
            x: Math.random() * 100, // horizontal start position (vw)
            delay: Math.random() * 20, // start delay (s)
            duration: 15 + Math.random() * 20, // fall duration (15-35s)
            size: 24 + Math.random() * 48, // size (24px - 72px)
            ingredient: ingredients[Math.floor(Math.random() * ingredients.length)],
            rotation: Math.random() * 360, // initial rotation
        }));
        setItems(newItems);
    }, []);

    if (items.length === 0) return null;

    return (
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-40 mix-blend-overlay">
            {items.map((item) => (
                <motion.div
                    key={item.id}
                    className="absolute top-[-10%]"
                    initial={{
                        y: '-10vh',
                        x: `${item.x}vw`,
                        rotate: item.rotation,
                        opacity: 0,
                    }}
                    animate={{
                        y: '120vh',
                        rotate: item.rotation + 360,
                        opacity: [0, 1, 1, 0], // fade in and out during fall
                    }}
                    transition={{
                        duration: item.duration,
                        repeat: Infinity,
                        ease: 'linear',
                        delay: item.delay,
                        times: [0, 0.1, 0.9, 1], // fade keyframes mapping
                    }}
                    style={{
                        fontSize: `${item.size}px`,
                        filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))',
                    }}
                >
                    {item.ingredient}
                </motion.div>
            ))}
        </div>
    );
}
