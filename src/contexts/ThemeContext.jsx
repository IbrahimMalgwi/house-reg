// src/contexts/ThemeContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}

export function ThemeProvider({ children }) {
    const [isDark, setIsDark] = useState(() => {
        // Check if dark mode is preferred by the user's system
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('darkMode');
            if (saved !== null) {
                return JSON.parse(saved);
            }
            return window.matchMedia('(prefers-color-scheme: dark)').matches;
        }
        return false;
    });

    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('darkMode', JSON.stringify(isDark));
            if (isDark) {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
        }
    }, [isDark]);

    const toggleTheme = () => {
        setIsDark(prev => !prev);
    };

    const value = {
        isDark,
        toggleTheme
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
}