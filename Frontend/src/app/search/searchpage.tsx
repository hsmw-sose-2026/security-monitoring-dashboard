'use client';

import { useState, useEffect, Suspense } from 'react';
import { IconCloud, IconLogout, IconSword, IconMoon, IconSun, IconHome, IconUpload, IconMail } from '@tabler/icons-react';
import Link from 'next/link';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import clsx from 'clsx';
import { getBackendHost } from '@/actions/getBackendHost';
import SearchBar from '@/components/SearchBar';
import { useDarkMode } from '@/app/hooks/useDarkMode';

interface SearchResult { name: string; description?: string; }

function SearchContent() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { darkMode, toggleDarkMode } = useDarkMode();
    const [results, setResults] = useState<SearchResult[]>([]);
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const role = localStorage.getItem("role");
        if (!role) {
            router.replace("/login");
            return;
        }
        setIsAdmin(role === "admin");
        setIsLoading(false);
    }, [router]);

    useEffect(() => {
        const q = searchParams.get('q') ?? '';
        setQuery(q);
        if (!q.trim()) return;
        const run = async () => {
            setLoading(true);
            try {
                const backendHost = await getBackendHost();
                const res = await fetch(`${backendHost}/search?q=${encodeURIComponent(q.trim())}`);
                if (!res.ok) throw new Error();
                const data = await res.json();
                setResults(Array.isArray(data) ? data : data.results ?? []);
            } catch { setResults([]); }
            finally { setLoading(false); }
        };
        run();
    }, [searchParams]);

    return (
        <>
            <header className='fixed top-0 left-0 right-0 z-50 h-20 border-b border-border bg-background-2 shadow-sm'>
                <div className='flex items-center justify-between h-full px-4 md:px-6'>
                    <div className='flex items-center gap-3'>
                        <IconCloud className='size-8 text-primary-2' />
                        <h1 className='text-2xl text-primary-foreground font-bold'>Firmenwebsite</h1>
                    </div>
                    <SearchBar />
                    <div className='flex items-center gap-3'>
                        <button onClick={toggleDarkMode}
                            className='flex items-center justify-center size-9 rounded-full bg-primary-2 text-white hover:bg-primary-3-hover transition-colors'
                            title={darkMode ? 'Light Mode' : 'Dark Mode'}>
                            {darkMode ? <IconSun className='size-5' /> : <IconMoon className='size-5' />}
                        </button>
                        <Link href='/login'
                            className='flex items-center gap-2 bg-primary-2 text-white px-4 py-2 rounded-full hover:bg-primary-3-hover transition-colors min-w-max'>
                            <IconLogout className='size-4' />
                            <span className='text-sm font-medium'>Logout</span>
                        </Link>
                    </div>
                </div>
            </header>

            <div className='flex pt-20'>
                <div className='fixed left-0 top-20 h-screen w-45 bg-card border-r border-border p-3 flex flex-col gap-2 z-40'>
                    <Link href='/' className={clsx('flex items-center gap-2 rounded-2xl px-4 py-4 w-full text-forefround transition-colors', {
                        'bg-primary text-foreground-2 hover:bg-primary-2-hover': pathname === '/',
                        'bg-primary hover:bg-primary-hover': pathname !== '/',
                    })}>
                        <IconHome className='size-5' />
                        <span>Startseite</span>
                    </Link>
                    <Link href='/upload' className={clsx('flex items-center gap-2 rounded-2xl px-4 py-4 w-full text-forground transition-colors', {
                        'bg-primary text-foreground-2 hover:bg-primary-2-hover': pathname === '/upload',
                        'bg-primary hover:bg-primary-hover': pathname !== '/upload',
                    })}>
                        <IconUpload className='size-5' />
                        <span>Datei Upload</span>
                    </Link>
                    <Link href='/contact' className={clsx('flex items-center gap-2 rounded-2xl px-4 py-4 w-full text-forground transition-colors', {
                        'bg-primary text-foreground-2 hover:bg-primary-2-hover': pathname === '/contact',
                        'bg-primary hover:bg-primary-hover': pathname !== '/contact',
                    })}>
                        <IconMail className='size-5' />
                        <span>Kontakt</span>
                    </Link>
                    {isAdmin && (
                        <Link href='/dashboard' className={clsx('flex items-center gap-2 rounded-2xl px-4 py-4 w-full bg-primary text-foreground hover:bg-primary-hover transition-colors')}>
                            <IconSword className='size-5' />
                            <span>Dashboard</span>
                        </Link>
                    )}
                    <Link href='/impressum' className={clsx('gap-2 fixed bottom-2 rounded-2xl px-4 py-4 text-primary-2 hover:bg-primary-hover transition-colors')}>
                        <span>Impressum</span>
                    </Link>
                </div>

                <div className='flex-1 ml-45 p-4 bg-background text-foreground min-h-screen'>
                    <article className='flex flex-col bg-card text-foreground rounded-2xl px-10 py-10 mt-4'>
                        <h2 className='font-bold text-2xl mb-2'>Suchergebnisse</h2>
                        {loading && <p className='text-foreground-muted'>Suche läuft…</p>}
                        {!loading && query && (
                            <>
                                <p className='text-foreground-muted mb-6'>
                                    Die Suche nach <span className='font-semibold text-foreground'>„{query}"</span> ergab:
                                </p>
                                {results.length === 0 ? (
                                    <p className='text-foreground-muted italic'>Keine Ergebnisse gefunden.</p>
                                ) : (
                                    <ul className='flex flex-col gap-3'>
                                        {results.map((r, i) => (
                                            <li key={i} className='border border-border rounded-xl px-6 py-4 bg-background-2'>
                                                <p className='font-medium text-foreground'>{r.name}</p>
                                                {r.description && <p className='text-sm text-foreground-muted mt-1'>{r.description}</p>}
                                                <p className='text-sm text-foreground-muted mt-1 italic'>
                                                    Beispieltext: Dies ist ein Demo-Eintrag zu „{r.name}". Weitere Informationen folgen nach Anbindung der echten Datenbank.
                                                </p>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </>
                        )}
                        {!loading && !query && <p className='text-foreground-muted italic'>Kein Suchbegriff angegeben.</p>}
                    </article>
                </div>
            </div>
        </>
    );
}

export default function SearchPage() {
    return <Suspense><SearchContent /></Suspense>;
}