import { IconSearch, IconCloud, IconLogout } from '@tabler/icons-react';
import Link from 'next/link';


export default function Impressum() {
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
                    <Link href='/' className='flex items-center gap-2 bg-blue-500 text-white hover:bg-blue-600 rounded-2xl px-6 py-4 w-full'>
                        <span>Startseite</span>
                    </Link>
                    <Link href='/upload' className='flex items-center gap-2 bg-blue-500 text-white hover:bg-blue-600 rounded-2xl px-6 py-4 w-full'>
                    <span>Datei Upload</span>
                    </Link>
                    <Link href='/contact' className='flex items-center gap-2 bg-blue-500 text-white hover:bg-blue-600 rounded-2xl px-6 py-4 w-full'>
                        <span>Kontakt</span>
                    </Link> 

                    {/* Impressum */}
                    <Link href='/impressum' className='fixed bottom-2 gap-2 text-blue-500 hover:text-blue-600 p-4'>
                        <span>Impressum</span>
                    </Link>
                </div>

            {/* Impressum Inhalt ----------------------------------------------- */}
            
            <div className='flex-1 ml-45 p-4 bg-gray-100 min-h-screen'>
                <article className='flex flex-col bg-white rounded-2xl px-10 py-10 h-auto'>
                    <h2 className='font-bold text-2xl mb-6'>Impressum</h2>
                    <p className='text-lg mb-4'>Hier finden Sie Informationen über die Verantwortlichen und die rechtlichen Aspekte der Website.</p>

                    <p className='text-lg mb-3'>Anbieter:<br />Max Mustermann<br />Musterstraße 1<br />80999 München</p>
                    <p className='text-lg mb-3'>Kontakt:<br />Telefon: 089/1234567-8<br />Telefax: 089/1234567-9<br />E-Mail: mail@mustermann.de<br />Website: www.mustermann.de</p>
                    <p className='text-lg mb-3'> </p>

                    <p className='text-lg'>Bei redaktionellen Inhalten:</p>
                    <p className='text-lg'>Verantwortlich nach § 55 Abs.2 RStV<br />Moritz Schreiberling<br />Musterstraße 2<br />80999 München</p>
                </article>
            </div>
        </div>
        </>
    );
}


