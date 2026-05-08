import { IconSearch, IconCloud, IconLogout } from '@tabler/icons-react';
import Link from 'next/link';


export default function Contact() {
    return (
        <>
        {/* Header */}
        <div className='flex h-20 shrink-0 items-end border border-gray-300 p-4 md:h-20 gap-5'>
            <div className='flex items-center gap-2'>
                <IconCloud className='size-8 text-blue-500'/>
                <header className='text-2xl text-blue-500 font-bold'>Firmenwebsite</header>
            </div>
            
            {/* Search Bar */}
            <div className='flex-1 flex justify-center'>
                <div className='flex items-center gap-2 border border-gray-300 rounded-4xl px-4 py-2 w-125'>
                    <IconSearch className='size-8 text-blue-500' />
                    <input type='text' placeholder='Suche...' className='outline-none w-full' />
                </div>
            </div>
            
            {/* Logout Button */}
            <div className='flex items-center'>
                <Link href='/login' className='flex items-center gap-2 bg-blue-500 px-6 py-2 rounded-4xl hover:bg-blue-600 transition-colors self-center min-w-max'>
                    <IconLogout className='size-6 text-white' />
                    <span className='text-white'>Logout</span>
                </Link>
            </div>
        </div>

        {/* Navigation Content ----------------------------------------- */}
        <div className='flex flex-1'>

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

            {/* Kontakt Formular ----------------------------------------------- */}
            <div className='flex-1 p-4'>    
                <div className='flex flex-col flex-1 items-center justify-center gap-4'>
                    <div className='border-black border-2 rounded-lg p-20 flex flex-col items-center gap-4'>
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

