'use client';

import {ClassOverride} from './class-override';
import './globals.css';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';


export default function DashboardLayout({children}: {children: React.ReactNode}) {
    const router = useRouter();
    useEffect(() => {
        const role = localStorage.getItem("role");

        if (role !== "admin") {
            router.replace("/login");
        }
    }, [router]);
   
    return (
        <div className='dark text-foreground bg-background'>
            <ClassOverride className='dark' />
            {children}
        </div>
    
    );
}
