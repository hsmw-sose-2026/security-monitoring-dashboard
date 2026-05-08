import {IconUserCircle} from '@tabler/icons-react';

export default function Login() {
    return (
        <div className='flex flex-col flex-1 items-center justify-center gap-4'>
            <div className='border-black border-2 rounded-lg p-20 flex flex-col items-center gap-4'>
                <IconUserCircle className='size-8' />
                <h1 className='font-bold text-3xl'>Login</h1>
                <input type='text' placeholder='Benutzername' className='border border-gray-300 rounded px-4 py-2 w-full' />
                <input type='password' placeholder='Passwort' className='border border-gray-300 rounded px-4 py-2 w-full' />
                
                <a href='/'><button type='button' className='bg-blue-500 text-white rounded px-24 py-2 w-full hover:bg-blue-600'>Anmelden</button></a>
           </div>
        </div>
    );
}
