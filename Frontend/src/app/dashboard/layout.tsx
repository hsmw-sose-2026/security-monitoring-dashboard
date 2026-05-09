import {ClassOverride} from './class-override';
import './globals.css';

export default function DashboardLayout({children}: {children: React.ReactNode}) {
    return (
        <div className='dark text-foreground bg-background'>
            <ClassOverride className='dark' />
            {children}
        </div>
    );
}
