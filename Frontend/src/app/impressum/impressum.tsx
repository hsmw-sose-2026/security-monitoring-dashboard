'use client';

import { useEffect, useState } from 'react';
import { IconCloud, IconLogout, IconMoon, IconSun, IconHome, IconUpload, IconMail, IconSword } from '@tabler/icons-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import clsx from 'clsx';
import SearchBar from '@/components/SearchBar';
import { useDarkMode } from '@/app/hooks/useDarkMode';

export default function Impressum() {
    const pathname = usePathname();
    const router = useRouter();
    const { darkMode, toggleDarkMode } = useDarkMode();
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const role = localStorage.getItem("role");
        if (!role) {
            router.replace("/login");
            return;
        }
        setIsAdmin(role === "admin");
    }, [router]);

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
                    <article className='flex flex-col mt-6 bg-card text-foreground rounded-2xl px-10 py-10'>
                        <h2 className='font-bold text-2xl mb-6'>Impressum</h2>
                        <p className='text-lg mb-4'>Hier finden Sie Informationen über die Verantwortlichen und die rechtlichen Aspekte der Website.</p>

                        <p className='text-lg mb-3'>
                            Anbieter:<br />
                            Max Mustermann<br />
                            Musterstraße 1<br />
                            80999 München
                        </p>
                        <p className='text-lg mb-3'>
                            Kontakt:<br />
                            Telefon: 089/1234567-8<br />
                            Telefax: 089/1234567-9<br />
                            E-Mail: mail@mustermann.de<br />
                            Website: www.mustermann.de
                        </p>
                        <p className='text-lg mt-2'>Bei redaktionellen Inhalten:</p>
                        <p className='text-lg'>
                            Verantwortlich nach § 55 Abs.2 RStV<br />
                            Moritz Schreiberling<br />
                            Musterstraße 2<br />
                            80999 München
                        </p>
                    </article>
                </div>
            </div>
        </>
    );
}