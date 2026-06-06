'use client';

import { useState, useEffect } from 'react';
import { IconCloud, IconLogout, IconMoon, IconSun, IconHome, IconUpload, IconMail } from '@tabler/icons-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import clsx from 'clsx';
import { getBackendHost } from '@/actions/getBackendHost';
import SearchBar from '@/components/SearchBar';
import { useDarkMode } from '@/app/hooks/useDarkMode';

export default function Contact() {
    const router = useRouter();
    const pathname = usePathname();
    const { darkMode, toggleDarkMode } = useDarkMode();
    const [isAdmin, setIsAdmin] = useState(false);

    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
    const role = localStorage.getItem("role");

    if (role !== "user" && role !== "admin") {
        router.replace("/login");
    }
}, [router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        try {
            const backendHost = await getBackendHost();
            const response = await fetch(`${backendHost}/contact`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, username, email, message }),
            });
            if (response.ok) {
                setName(''); setUsername(''); setEmail(''); setMessage('');
                toast.success('Nachricht gesendet');
            } else {
                const data = await response.json().catch(() => ({}));
                const msg = data?.detail || data?.error || 'Fehler beim Senden der Nachricht.';
                setError(msg);
                toast.error(msg);
            }
        } catch (err: unknown) {
            const msg = 'Netzwerkfehler: ' + (err instanceof Error ? err.message : String(err));
            setError(msg);
            toast.error(msg);
        } finally {
            setIsLoading(false);
        }
    };

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
                            <span>Dashboard</span>
                        </Link>
                    )}
                    <Link href='/impressum' className={clsx('gap-2 fixed bottom-2 rounded-2xl px-4 py-4 text-primary-2 hover:bg-primary-hover transition-colors')}>
                        <span>Impressum</span>
                    </Link>
                </div>

                <div className='flex-1 ml-45 p-4 bg-background text-foreground min-h-screen'>
                    <div className='flex flex-col flex-1 items-center justify-center gap-4'>
                        <form onSubmit={handleSubmit}
                            className='bg-card text-foreground rounded-2xl mt-10 p-20 flex flex-col items-center gap-4'>
                            <h1 className='font-bold text-3xl'>Kontaktieren Sie uns...</h1>
                            <input type='text' placeholder='Name' value={name} onChange={e => setName(e.target.value)} required
                                className='bg-input border border-border text-foreground placeholder:text-foreground-muted rounded px-4 py-2 w-full outline-none focus:ring-2 focus:ring-ring' />
                            <input type='text' placeholder='Benutzername' value={username} onChange={e => setUsername(e.target.value)}
                                className='bg-input border border-border text-foreground placeholder:text-foreground-muted rounded px-4 py-2 w-full outline-none focus:ring-2 focus:ring-ring' />
                            <input type='email' placeholder='E-Mail' value={email} onChange={e => setEmail(e.target.value)} required
                                className='bg-input border border-border text-foreground placeholder:text-foreground-muted rounded px-4 py-2 w-full outline-none focus:ring-2 focus:ring-ring' />
                            <textarea placeholder='Nachricht' value={message} onChange={e => setMessage(e.target.value)} required rows={4}
                                className='bg-input border border-border text-foreground placeholder:text-foreground-muted rounded px-4 py-2 w-full outline-none focus:ring-2 focus:ring-ring' />
                            {error && <p className='text-red-500 text-sm w-full'>{error}</p>}
                            <button type='submit' disabled={isLoading}
                                className='bg-primary-2 text-white rounded px-24 py-2 w-full hover:bg-primary-3-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors'>
                                {isLoading ? 'Wird gesendet…' : 'Senden'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}