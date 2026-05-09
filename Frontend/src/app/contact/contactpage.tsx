'use client';

import { IconSearch, IconCloud, IconLogout } from '@tabler/icons-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';

export default function Contact() {
    const pathname = usePathname();
    return (
        <>
        {/* Header */}
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

        {/* Main Container --------------------------------------------------- */}
            <div className='flex pt-20'>
                {/* Navigation Sidebar */}
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

<<<<<<< HEAD
            <div className='w-45 h-screen bg-gray-100 p-4 flex flex-col gap-2'>
                <Link href='/' className='flex items-center gap-2 bg-blue-500 text-white hover:bg-blue-600 rounded-2xl px-6 py-4 w-full'>
                    <span>Startseite</span>
                </Link>
                <Link href='/upload' className='flex items-center gap-2 bg-blue-500 text-white hover:bg-blue-600 rounded-2xl px-6 py-4 w-full'>
                    <span>Datei Upload</span>
                </Link>
                <Link href='/contact' className='flex items-center gap-2 bg-blue-500 text-white hover:bg-blue-600 rounded-2xl px-6 py-4 w-full'>
                    <span>Kontakt</span>
                </Link>
            </div>
=======
                    {/* Impressum */}
                    <Link href='/impressum' className='fixed bottom-2 gap-2 text-blue-500 hover:text-blue-600 p-4'>
                        <span>Impressum</span>
                    </Link>
                </div>
>>>>>>> origin/integration-test

            {/* Kontakt Formular ----------------------------------------------- */}
            <div className='flex-1 ml-45 p-4 bg-gray-100 min-h-screen'>    
                <div className='flex flex-col flex-1 items-center justify-center gap-4'>
                    <div className='bg-white rounded-lg mt-10 p-20 flex flex-col items-center gap-4'>
                        <h1 className='font-bold text-3xl'>Kontaktieren Sie uns...</h1>

                        <input type='text' placeholder='Name' className='border border-gray-300 rounded px-4 py-2 w-full' />
                        <input type='text' placeholder='Benutzername' className='border border-gray-300 rounded px-4 py-2 w-full' />
                        <input type='email' placeholder='E-Mail' className='border border-gray-300 rounded px-4 py-2 w-full' />
                        <textarea placeholder='Nachricht' className='border border-gray-300 rounded px-4 py-2 w-full' rows={4} />

                        <button type='button' className='bg-blue-500 text-white rounded px-24 py-2 w-full hover:bg-blue-600'>Senden</button>
                    </div>
                </div>
            </div>

        </div>
        </>
    );
}
{/*-- Optional: Add a function to handle the send button click, e.g., to show an alert or send data to a server. 
export function sendealert() {
    alert("Nachricht gesendet!");
}
--*/}

