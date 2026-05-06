'use client';

import {IconHome, IconSearch, IconCloud, IconLogout} from '@tabler/icons-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';

export default function Home() {
    const pathname = usePathname();
    return (
        <>
        {/* Header------------------------------------------------------------------------ */}
            <header className='fixed top-0 left-0 right-0 z-50 h-20 border-b border-gray-300 bg-white shadow-sm'>
                <div className='flex items-center justify-between h-full px-4 md:px-6'>
                    {/* Logo und Firma */}
                    <div className='flex items-center gap-3'>
                        <IconCloud className='size-8 text-blue-500'/>
                        <h1 className='text-2xl text-blue-500 font-bold'>Firmenwebsite</h1>
                    </div>
                    
                    {/* Suchleiste  */}
                    <div className='flex-1 max-w-2xl mx-8'>
                        <div className='flex items-center gap-2 border border-gray-300 rounded-full px-4 py-2 bg-white shadow-sm'>
                            <IconSearch className='size-5 text-blue-500' />
                            <input type='text' placeholder='Suche ...' className='outline-none w-full text-sm'/>
                        </div>
                    </div>
                    
                    {/* Logout Button */}
                    <div className='flex items-center'>
                        <Link 
                            href='/login' 
                            className='flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600 transition-colors min-w-max'>
                            <IconLogout className='size-4' />
                            <span className='text-sm font-medium'>Logout</span>
                        </Link>
                    </div>
                </div>
            </header>


        {/* Main Container -------------------------------------------------------------- */}

            <div className='flex pt-20'>
                {/* Navigation Sidebar--------------------------------------------------- */}

                <div className='fixed left-0 top-20 h-screen w-45 bg-white p-4 flex flex-col gap-2 z-40'>
                    <Link href='/' className={clsx('flex items-center gap-2 rounded-2xl px-6 py-4 w-full', { 
                        'bg-blue-400 text-white': pathname === '/',
                        'bg-blue-500 text-white hover:bg-blue-600': pathname !== '/'
                     })}>
                        <span>Startseite</span>
                    </Link>
                    <Link href='/upload' className={clsx('flex items-center gap-2 rounded-2xl px-6 py-4 w-full', { 
                        'bg-blue-400 text-white': pathname === '/upload',
                        'bg-blue-500 text-white hover:bg-blue-600': pathname !== '/upload' })}>
                        <span>Datei Upload</span>
                    </Link>
                    <Link href='/contact' className={clsx('flex items-center gap-2 rounded-2xl px-6 py-4 w-full', { 
                        'bg-blue-400 text-white': pathname === '/contact',
                        'bg-blue-500 text-white hover:bg-blue-600': pathname !== '/contact' })}>
                        <span>Kontakt</span>
                    </Link> 

                    {/* Impressum */}
                    <Link href='/impressum' className='fixed bottom-2 gap-2 text-blue-500 hover:text-blue-600 p-4'>
                        <span>Impressum</span>
                    </Link>
                </div>

                {/* Main Content ------------------------------------------------*/}

                <div className='flex-1 ml-45 p-4 bg-gray-100 min-h-screen'>
                    <article className='flex flex-col items-center justify-center bg-white rounded-2xl px-6 py-4 h-50'>
                        <IconHome className='size-8' />
                        <h1 className='font-bold text-3xl'>Willkommen!</h1>
                        <p className='text-lg'>Das ist die Startseite.</p>
                    </article>

                    <article className='flex flex-col mt-6 bg-white rounded-2xl px-10 py-10 h-auto'>
                        <h2 className='font-bold text-2xl mb-6'>Neuigkeiten</h2>
                        <p className='text-lg'>Hier findest du die neuesten Informationen und Updates zu unserem Unternehmen.</p>

                        <ol className='list-decimal list-inside mt-4 ml-5'>
                            <li>Projekt-launch: neues Projekt im nächsten Monat</li>
                            <li>Update: Verbesserungen an unserem Service</li>
                            <li>Erweiterung: Neue Funktionen in unserem Produkt</li>
                        </ol>
                    </article>

                    <article className='flex flex-col mt-6 bg-white rounded-2xl px-10 py-10 h-auto'>
                        <h2 className='font-bold text-2xl mb-6'>Unsere Dienstleistungen</h2>
                        <p className='text-lg'>Entdecke die vielfältigen Dienstleistungen, die wir anbieten, um deine Bedürfnisse zu erfüllen.</p>

                        <ul className='list-disc list-inside mt-4 ml-5'>
                            <li>Dienstleistung 1: Beschreibung der ersten Dienstleistung</li>
                            <li>Dienstleistung 2: Beschreibung der zweiten Dienstleistung</li>
                            <li>Dienstleistung 3: Beschreibung der dritten Dienstleistung</li>
                        </ul>

                        <p className='text-lg mt-4'>Wenn weitere Fragen bestehen sollten, kontaktieren Sie uns bitte <Link href='/contact' className='text-blue-500 hover:underline'>hier</Link>.</p>
                    </article>
                </div>
            </div>
        </>
    );
}
