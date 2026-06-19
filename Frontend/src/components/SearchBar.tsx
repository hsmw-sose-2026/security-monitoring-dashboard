'use client';

import {IconSearch} from '@tabler/icons-react';
import {useRouter} from 'next/navigation';
import {useEffect, useRef, useState} from 'react';
import {getBackendHost} from '@/actions/getBackendHost';

type SearchSuggestion = {
    name: string;
    description?: string | null;
    url?: string | null;
    category?: string | null;
};

// Einträge aus search_service.py – Vorschläge im Dropdown
const STATIC_ITEMS: SearchSuggestion[] = [
    {name: 'Sicheres Passwort-Management'},
    {name: 'Was ist eine Firewall?'},
    {name: 'SQL Injection verstehen'},
    {name: 'Zwei-Faktor-Authentifizierung'},
    {name: 'HTTPS vs HTTP'},
    {name: 'Phishing erkennen'},
    {name: 'VPN im Alltag'},
    {name: 'Datenschutz im Unternehmen'},
];

interface SearchBarProps {
    demoValue?: string;
    onDemoConsumed?: () => void;
}

export default function SearchBar({demoValue, onDemoConsumed}: SearchBarProps) {
    const router = useRouter();
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
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
        const q = query.trim();

        if (!q) {
            setSuggestions(STATIC_ITEMS);
            return;
        }

        let cancelled = false;

        async function loadSuggestions() {
            try {
                const backendHost = await getBackendHost();
                const response = await fetch(`${backendHost}/search?q=${encodeURIComponent(q)}`);

                if (!response.ok) {
                    throw new Error('Search request failed');
                }

                const data = await response.json();
                const results = Array.isArray(data) ? data : (data.results ?? []);

                if (!cancelled) {
                    setSuggestions(results);
                }
            } catch {
                const fallback = STATIC_ITEMS.filter((item) => item.name.toLowerCase().includes(q.toLowerCase()));

                if (!cancelled) {
                    setSuggestions(fallback);
                }
            }
        }

        loadSuggestions();

        return () => {
            cancelled = true;
        };
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

    const navigate = (item: SearchSuggestion | string) => {
        const term = typeof item === 'string' ? item : item.name;
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
                    onChange={(e) => setQuery(e.target.value)}
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
                        suggestions.map((item) => (
                            <li key={item.name}>
                                <button
                                    type='button'
                                    onMouseDown={() => navigate(item)}
                                    className='w-full text-left px-4 py-2.5 text-sm hover:bg-blue-50 hover:text-blue-600 transition-colors flex items-center gap-2'
                                >
                                    <IconSearch className='size-3.5 text-gray-300 shrink-0' />
                                    <div className='flex flex-col'>
                                        <span>{item.name}</span>
                                        {item.category && <span className='text-xs text-gray-400'>{item.category}</span>}
                                    </div>
                                </button>
                            </li>
                        ))
                    )}
                </ul>
            )}
        </div>
    );
}
