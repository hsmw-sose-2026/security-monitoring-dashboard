'use client';

import { useEffect, useState } from 'react';
import { IconHome, IconCloud, IconLogout, IconSword, IconMoon, IconSun, IconUpload, IconMail, IconBug, IconReportAnalytics } from '@tabler/icons-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import clsx from 'clsx';
import SearchBar from '@/components/SearchBar';
import { useDarkMode } from '@/app/hooks/useDarkMode';

const XSS_DEMO_SEARCH = '<script>alert("XSS")</script>';

export default function Home() {
    const pathname = usePathname();
    const router = useRouter();                                 // Router für Navigation und Redirects
    const [isAdmin, setIsAdmin] = useState(false);              // Admin-Status für bedingte Navigationselemente
    const [isLoading, setIsLoading] = useState(true);
    const { darkMode, toggleDarkMode } = useDarkMode();         // Dark Mode Hook

    // Ref/Callback um den SearchBar-Wert von außen zu setzen
    const [searchDemoValue, setSearchDemoValue] = useState<string | undefined>(undefined);

    // Überprüfen der Authentifizierung und Rollenstatus beim Laden der Seite
    useEffect(() => {
        const role = localStorage.getItem("role");
        if (!role) {
            router.replace("/login");
            return;
        }
        setIsAdmin(role === "admin");
        setIsLoading(false);
    }, [router]);

    if (isLoading) {
        return (
            <div className="flex h-screen w-screen items-center justify-center bg-background text-foreground">
                <p className="text-lg font-medium">Prüfe Authentifizierung...</p>
            </div>
        );
    }

// -------------------------------------------------------------------------------------------------------------
// ---------------------------------------------- MAIN PAGE ----------------------------------------------------
// -------------------------------------------------------------------------------------------------------------    


    return (
        <>
            <header className='fixed top-0 left-0 right-0 z-50 h-20 border-b border-border bg-background-2 shadow-sm'>
                <div className='flex items-center justify-between h-full px-4 md:px-6'>
                    <div className='flex items-center gap-3'>
                        <IconCloud className='size-8 text-primary-2' />
                        <h1 className='text-2xl text-primary-foreground font-bold'>Firmenwebsite</h1>
                    </div>
                    {/* SearchBar erhält optionalen Demo-Wert als initialValue-Prop */}
                    <SearchBar demoValue={searchDemoValue} onDemoConsumed={() => setSearchDemoValue(undefined)} />
                    <div className='flex items-center gap-3'>
                        {/* Demo-Angriff Button für Searchbar */}
                        <button
                            type='button'
                            onClick={() => setSearchDemoValue(XSS_DEMO_SEARCH)}
                            title='XSS-Demo in Suchfeld einfügen'
                            className='flex items-center gap-1 border border-red-500/40 text-red-400 rounded-full px-3 py-1.5 text-xs hover:bg-red-500/10 transition-colors min-w-max'>
                            <IconBug className='size-3.5' />
                            XSS-Demo
                        </button>
                        {/* Dark Mode Toggle */}
                        <button onClick={toggleDarkMode}
                            className='flex items-center justify-center size-9 rounded-full bg-primary-2 text-white hover:bg-primary-3-hover transition-colors'
                            title={darkMode ? 'Light Mode' : 'Dark Mode'}>
                            {darkMode ? <IconSun className='size-5' /> : <IconMoon className='size-5' />}
                        </button>
                        {/* Logout Button */}
                        <button
                            onClick={() => {
                                localStorage.removeItem("access_token");
                                localStorage.removeItem("username");
                                localStorage.removeItem("role");
                                router.push("/login");
                            }}
                            className='flex items-center gap-2 bg-primary-2 text-white px-4 py-2 rounded-full hover:bg-primary-3-hover transition-colors min-w-max'>
                            <IconLogout className='size-4' />
                            <span className='text-sm font-medium'>Logout</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Navigation */}

            <div className='flex pt-20'>
                <div className='fixed left-0 top-20 h-screen w-45 bg-card border-r border-border p-3 flex flex-col gap-2 z-40'>
                    <Link href='/' className={clsx('flex items-center gap-2 rounded-2xl px-4 py-4 w-full text-foreground transition-colors', {
                        'bg-primary text-foreground-2 hover:bg-primary-2-hover': pathname === '/',
                        'bg-primary hover:bg-primary-hover': pathname !== '/',
                    })}>
                        <IconHome className='size-5' />
                        <span>Startseite</span>
                    </Link>
                    <Link href='/upload' className={clsx('flex items-center gap-2 rounded-2xl px-4 py-4 w-full text-foreground transition-colors', {
                        'bg-primary text-foreground-2 hover:bg-primary-2-hover': pathname === '/upload',
                        'bg-primary hover:bg-primary-hover': pathname !== '/upload',
                    })}>
                        <IconUpload className='size-5' />
                        <span>Datei Upload</span>
                    </Link>
                    <Link href='/contact' className={clsx('flex items-center gap-2 rounded-2xl px-4 py-4 w-full text-foreground transition-colors', {
                        'bg-primary text-foreground-2 hover:bg-primary-2-hover': pathname === '/contact',
                        'bg-primary hover:bg-primary-hover': pathname !== '/contact',
                    })}>
                        <IconMail className='size-5' />
                        <span>Kontakt</span>
                    </Link>

                    {/* Admin Dashboard Link */}
                    {isAdmin && (
                        <Link href='/dashboard' className={clsx('flex items-center gap-2 rounded-2xl px-4 py-4 w-full bg-primary text-foreground hover:bg-primary-hover transition-colors')}>
                            <IconSword className='size-5' />
                            <span>Dashboard</span>
                        </Link>
                    )}
                    {isAdmin && (
                        <Link href='/dashboard/forensic' className={clsx('flex items-center gap-2 rounded-2xl px-4 py-4 w-full bg-primary text-foreground hover:bg-primary-hover transition-colors')}>
                            <IconReportAnalytics className='size-5' />
                            <span>Forensik</span>
                        </Link>
                    )}

                    <Link href='/impressum' className={clsx('gap-2 fixed bottom-2 rounded-2xl px-4 py-4 text-primary-2 hover:bg-primary-hover transition-colors')}>
                        <span>Impressum</span>
                    </Link>
                </div>

                {/* Main Content -------------------------------------------------------------------*/}

                <div className='flex-1 ml-45 p-4 bg-background text-foreground min-h-screen'>
                    <article className='flex flex-col items-center justify-center bg-background text-foreground rounded-2xl px-6 py-4 h-50'>
                        <IconHome className='size-8 text-primary-2' />
                        <h1 className='font-bold text-3xl'>Willkommen!</h1>
                        <p className='text-lg'>Das ist die Startseite.</p>
                    </article>
                    <article className='flex flex-col mt-6 bg-card text-foreground rounded-2xl px-10 py-10'>
                        <h2 className='font-bold text-2xl mb-6'>Neuigkeiten</h2>
                        <p className='text-lg'>Hier findest du die neuesten Informationen und Updates zu unserem Unternehmen.</p>
                        <ol className='list-decimal list-inside mt-4 ml-5'>
                            <li>Projekt-launch: neues Projekt im nächsten Monat</li>
                            <li>Update: Verbesserungen an unserem Service</li>
                            <li>Erweiterung: Neue Funktionen in unserem Produkt</li>
                        </ol>
                    </article>
                    <article className='flex flex-col mt-6 bg-card text-foreground rounded-2xl px-10 py-10'>
                        <h2 className='font-bold text-2xl mb-6'>Unsere Dienstleistungen</h2>
                        <p className='text-lg'>Entdecke die vielfältigen Dienstleistungen, die wir anbieten, um deine Bedürfnisse zu erfüllen.</p>
                        <ul className='list-disc list-inside mt-4 ml-5'>
                            <li>Dienstleistung 1: Beschreibung der ersten Dienstleistung</li>
                            <li>Dienstleistung 2: Beschreibung der zweiten Dienstleistung</li>
                            <li>Dienstleistung 3: Beschreibung der dritten Dienstleistung</li>
                        </ul>
                        <p className='text-lg mt-4'>Wenn weitere Fragen bestehen sollten, kontaktieren Sie uns bitte <Link href='/contact' className='text-primary hover:underline'>hier</Link>.</p>
                    </article>
                </div>
            </div>
        </>
    );
}