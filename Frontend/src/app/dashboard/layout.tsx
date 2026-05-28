import {NavBar} from '@/components/dashboard/nav-bar';
import {ClassOverride} from './class-override';
import './globals.css';

export default function DashboardLayout({children}: {children: React.ReactNode}) {
    return (
        <div className='w-full h-screen dark text-foreground overflow-auto relative'>
            <NavBar />
            <ClassOverride className='dark' />
            {children}
        </div>
    );
}
