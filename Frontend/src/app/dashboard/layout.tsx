'use client';

import {NavBar} from '@/components/dashboard/nav-bar';
import './globals.css';
import {useRouter} from 'next/navigation';
import {useEffect} from 'react';

export default function DashboardLayout({children}: {children: React.ReactNode}) {
    const router = useRouter();
    useEffect(() => {
        const role = localStorage.getItem('role');
        const token = localStorage.getItem('access_token');

        if (role !== 'admin' || !token) {
            router.replace('/login');
        }
    }, [router]);

    return (
        <div className='w-full h-screen dark text-white overflow-auto relative'>
            <NavBar />
            {children}
        </div>
    );
}
