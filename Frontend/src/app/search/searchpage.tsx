'use client';

<<<<<<< HEAD
import { useState, useEffect } from 'react';
import { IconCloud, IconSearch, IconLogout, IconX } from '@tabler/icons-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

// Interface
interface SearchEntry {
  id: number;
  title: string;
  category: string;
  description: string;
}

// Vordefinierte Einträge
const ENTRIES: SearchEntry[] = [
  { id: 1, title: 'Einführung in Next.js', category: 'Blog', description: 'Grundlagen des Next.js Frameworks für moderne Webanwendungen.' },
  { id: 2, title: 'Tailwind CSS Tipps', category: 'Blog', description: 'Praktische Tipps für effizientes Styling mit Tailwind CSS.' },
  { id: 3, title: 'TypeScript für Einsteiger', category: 'Blog', description: 'Ein Leitfaden für den Einstieg in TypeScript.' },
  { id: 4, title: 'React Hooks erklärt', category: 'Blog', description: 'useState, useEffect und weitere Hooks verständlich erklärt.' },
  { id: 5, title: 'Laptop Pro 15"', category: 'Produkt', description: 'Leistungsstarker Laptop für professionelle Anwender.' },
  { id: 6, title: 'Mechanische Tastatur', category: 'Produkt', description: 'Ergonomische Tastatur mit Cherry MX Switches.' },
  { id: 7, title: 'USB-C Hub 7-in-1', category: 'Produkt', description: 'Vielseitiger Hub mit HDMI, USB-A, SD-Kartenleser und mehr.' },
  { id: 8, title: 'Deployment mit Docker', category: 'Blog', description: 'Schritt-für-Schritt Anleitung zum Containerisieren von Anwendungen.' },
  { id: 9, title: 'Externer Monitor 27"', category: 'Produkt', description: '4K-Monitor mit IPS-Panel und 144 Hz Bildwiederholrate.' },
  { id: 10, title: 'REST APIs mit Express', category: 'Blog', description: 'Erstelle skalierbare REST APIs mit Node.js und Express.' },
];

export default function Search() {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchEntry[]>([]);
  const [modalOpen, setModalOpen] = useState(false);

  const handleSearch = () => {
    const trimmed = query.trim().toLowerCase();
    const found = trimmed
      ? ENTRIES.filter(entry =>
          entry.title.toLowerCase().includes(trimmed) ||
          entry.category.toLowerCase().includes(trimmed)
        )
      : ENTRIES;

    setResults(found);
    setModalOpen(true);
  };

  const handleClose = () => setModalOpen(false);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    }
  };

  // Automatische Suche bei URL-Parameter
  useEffect(() => {
    const q = searchParams.get('q');
    if (q) {
      setQuery(q);
      setTimeout(() => {
        const trimmed = q.trim().toLowerCase();
        const found = trimmed
          ? ENTRIES.filter(entry =>
              entry.title.toLowerCase().includes(trimmed) ||
              entry.category.toLowerCase().includes(trimmed)
            )
          : ENTRIES;
        setResults(found);
        setModalOpen(true);
      }, 100);
    }
  }, [searchParams]);

  return (
    <>
      {/* Header mit funktionaler Suchleiste */}
      <div className='flex h-20 shrink-0 items-end border border-gray-300 p-4 md:h-20 gap-5'>
        <div className='flex items-center gap-2'>
          <IconCloud className='size-8 text-blue-500' />
          <header className='text-2xl text-blue-500 font-bold'>Firmenwebsite</header>
        </div>

        <div className='flex-1 flex justify-center'>
          <div className='flex items-center gap-2 border border-gray-300 rounded-4xl px-4 py-2 w-125'>
            <IconSearch className='size-8 text-blue-500' />
            <input 
              type='text' 
              placeholder='Suche...' 
              className='outline-none w-full'
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>
        </div>

        <div className='flex items-center'>
          <Link
            href='/login'
            className='flex items-center gap-2 bg-blue-500 px-6 py-2 rounded-4xl hover:bg-blue-600 transition-colors self-center min-w-max'
          >
            <IconLogout className='size-6 text-white' />
            <span className='text-white'>Logout</span>
          </Link>
        </div>
      </div>

      {/* Navigation + Hauptinhalt */}
      <div className='flex flex-1'>
        <div className='w-45 h-screen bg-gray-100 p-4 flex flex-col gap-2'>
          <Link 
            href='/' 
            className='flex items-center gap-2 bg-blue-500 text-white hover:bg-blue-600 rounded-2xl px-6 py-4 w-full'
          >
            {/* Icon entfernt */}
            <span>Startseite</span>
          </Link>

          <Link href='/upload' className='flex items-center gap-2 bg-blue-500 text-white hover:bg-blue-600 rounded-2xl px-6 py-4 w-full'>
            <span>Datei Upload</span>
          </Link>

          <Link href='/contact' className='flex items-center gap-2 bg-blue-500 text-white hover:bg-blue-600 rounded-2xl px-6 py-4 w-full'>
            <span>Kontakt</span>
          </Link>
        </div>

        <div className='flex-1 p-8'>
          {/* ... Rest des Inhalts unverändert ... */}
          <div className='flex flex-col items-center gap-4 max-w-xl mx-auto mt-8'>
            <div className='border-black border-2 rounded-lg p-10 flex flex-col items-center gap-4 w-full'>
              <IconSearch className='size-8' />
              <h1 className='font-bold text-3xl'>Suche</h1>

              <div className='flex gap-2 w-full'>
                <input
                  type='text'
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder='Suchbegriff eingeben...'
                  className='border border-gray-300 rounded px-4 py-2 flex-1 outline-none focus:border-blue-400'
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal (unverändert) */}
      {modalOpen && (
        <div className='fixed inset-0 z-50 flex items-center justify-center'>
          <button
            type='button'
            aria-label='Modal schließen'
            className='absolute inset-0 bg-black/40 cursor-default'
            onClick={handleClose}
          />

          <div
            role='dialog'
            aria-modal='true'
            className='relative z-10 bg-white border-black border-2 rounded-lg p-8 w-full max-w-xl mx-4 flex flex-col gap-4 max-h-[80vh] overflow-y-auto'
          >
            <div className='flex items-center justify-between'>
              <h2 className='font-bold text-xl'>
                Suchergebnisse
                <span className='text-gray-400 text-sm font-normal ml-2 font-mono'>
                  {results.length} Ergebnis{results.length !== 1 ? 'se' : ''}
                </span>
              </h2>
              <button
                type='button'
                onClick={handleClose}
                className='text-gray-400 hover:text-gray-700 transition-colors'
                title='Schließen'
              >
                <IconX className='size-6' />
              </button>
            </div>

            {results.length === 0 ? (
              <p className='text-gray-400 text-sm text-center py-6'>Keine Ergebnisse gefunden.</p>
            ) : (
              <div className='flex flex-col gap-2'>
                {results.map(entry => (
                  <div
                    key={entry.id}
                    className='flex flex-col gap-1 border border-gray-200 rounded px-4 py-3 bg-gray-50'
                  >
                    <div className='flex items-center gap-2'>
                      <span className='text-sm font-medium'>{entry.title}</span>
                      <span className='text-xs text-blue-500 border border-blue-200 rounded-full px-2 py-0.5 bg-blue-50'>
                        {entry.category}
                      </span>
                    </div>
                    <p className='text-xs text-gray-400'>{entry.description}</p>
                  </div>
                ))}
              </div>
            )}

            <button
              type='button'
              onClick={handleClose}
              className='bg-blue-500 text-white rounded px-6 py-2 hover:bg-blue-600 transition-colors w-full mt-2'
            >
              Schließen
            </button>
          </div>
        </div>
      )}
    </>
  );
=======
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
>>>>>>> origin/integration-test
}