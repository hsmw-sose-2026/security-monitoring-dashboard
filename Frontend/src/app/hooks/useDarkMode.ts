import {useEffect, useState} from 'react';

export function useDarkMode() {
    const [darkMode, setDarkMode] = useState(true);

    useEffect(() => {
        const saved = localStorage.getItem('darkMode');
        // Immer .dark entfernen (kann vom Dashboard gesetzt worden sein)
        document.documentElement.classList.remove('dark');

        if (saved === 'false') {
            setDarkMode(false);
            document.documentElement.classList.add('light');
        } else {
            setDarkMode(true);
            document.documentElement.classList.remove('light');
        }
    }, []);

    const toggleDarkMode = () => {
        const next = !darkMode;
        setDarkMode(next);
        if (next) {
            document.documentElement.classList.remove('light');
            document.documentElement.classList.remove('dark');
            localStorage.setItem('darkMode', 'true');
        } else {
            document.documentElement.classList.add('light');
            document.documentElement.classList.remove('dark');
            localStorage.setItem('darkMode', 'false');
        }
    };

    return {darkMode, toggleDarkMode};
}
