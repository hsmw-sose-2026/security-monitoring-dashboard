import {IconLayoutDashboard} from '@tabler/icons-react';
import Link from 'next/link';

export default function Dashboard() {
    return (
        <div className='flex flex-col flex-1 items-center justify-center gap-4'>
            <IconLayoutDashboard className='size-8' />
            <h1 className='font-bold text-2xl'>Dashboard Coming Soon ...</h1>
            <div className='flex gap-4'>
                <Link href='/dashboard/events'>Events</Link>
                <Link href='/dashboard/alerts'>Alerts</Link>
            </div>
        </div>
    );
}
