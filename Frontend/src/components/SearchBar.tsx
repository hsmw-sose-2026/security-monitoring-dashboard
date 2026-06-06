'use client';

import { useState, useEffect, useRef } from 'react';
import { IconSearch } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';

// Einträge aus search_service.py – Vorschläge im Dropdown
const STATIC_ITEMS = [
    'Sicheres Passwort-Management',
    'Was ist eine Firewall?',
    'SQL Injection verstehen',
    'Zwei-Faktor-Authentifizierung',
    'HTTPS vs HTTP',
    'Phishing erkennen',
    'VPN im Alltag',
    'Datenschutz im Unternehmen',
];

interface SearchBarProps {
    demoValue?: string;
    onDemoConsumed?: () => void;
}

export default function SearchBar({ demoValue, onDemoConsumed }: SearchBarProps) {
    const router = useRouter();
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [open, setOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Demo-Wert von außen setzen
    useEffect(() => {
        if (demoValue !== undefined) {
            setQuery(demoValue);
            setOpen(true);
            inputRef.current?.focus();
            onDemoConsumed?.();
        }
    }, [demoValue, onDemoConsumed]);

    // Vorschläge filtern bei Eingabe
    useEffect(() => {
        const q = query.trim().toLowerCase();
        if (!q) {
            setSuggestions(STATIC_ITEMS);
        } else {
            setSuggestions(STATIC_ITEMS.filter(item => item.toLowerCase().includes(q)));
        }
    }, [query]);

    // Dropdown schließen bei Klick außerhalb
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const navigate = (term: string) => {
        setOpen(false);
        setQuery(term);
        router.push(`/search?q=${encodeURIComponent(term)}`);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && query.trim()) {
            navigate(query.trim());
        }
    };

    return (
        <div ref={wrapperRef} className='relative flex-1 max-w-2xl mx-8'>
            <div className='flex items-center gap-2 rounded-full px-4 py-2 bg-input shadow-sm'>
                <IconSearch className='size-5 text-blue-500 shrink-0' />
                <input
                    ref={inputRef}
                    type='text'
                    placeholder='Suche ...'
                    className='outline-none w-full text-sm'
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    onFocus={() => setOpen(true)}
                    onKeyDown={handleKeyDown}
                />
            </div>

            {/* Dropdown */}
            {open && (
                <ul className='absolute top-full mt-1 left-0 right-0 bg-input border border-gray-300 rounded-xl shadow-lg z-50 overflow-hidden'>
                    {suggestions.length === 0 ? (
                        <li className='px-4 py-3 text-sm text-gray-400 italic'>Keine Vorschläge gefunden.</li>
                    ) : (
                        suggestions.map(item => (
                            <li key={item}>
                                <button
                                    type='button'
                                    onMouseDown={() => navigate(item)}
                                    className='w-full text-left px-4 py-2.5 text-sm hover:bg-blue-50 hover:text-blue-600 transition-colors flex items-center gap-2'
                                >
                                    <IconSearch className='size-3.5 text-gray-300 shrink-0' />
                                    {item}
                                </button>
                            </li>
                        ))
                    )}
                </ul>
            )}
        </div>
    );
}