'use client';

import {IconCalendarDue, IconGraph, IconListCheck, IconMicroscope, IconSpeakerphone, IconSword} from '@tabler/icons-react';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {cn} from '@/lib/utils';

export function NavBar() {
    const pathname = usePathname();

    return (
        <nav className='fixed w-full flex items-center justify-center gap-4 bg-neutral-900/50 backdrop-blur-lg border-b py-2 font-semibold'>
            <Link
                className={cn(
                    'flex items-center gap-1 px-3 pl-2.5 py-1 hover:bg-neutral-800 rounded-lg transition-colors',
                    pathname === '/dashboard' && 'bg-neutral-800',
                )}
                href='/dashboard'
            >
                <IconSword className='size-5' />
                Attacks
            </Link>
            <Link
                className={cn(
                    'flex items-center gap-1 px-3 pl-2.5 py-1 hover:bg-neutral-800 rounded-lg transition-colors',
                    pathname === '/dashboard/events' && 'bg-neutral-800',
                )}
                href='/dashboard/events'
            >
                <IconCalendarDue className='size-5' />
                Events
            </Link>
            <Link
                className={cn(
                    'flex items-center gap-1 px-3 pl-2.5 py-1 hover:bg-neutral-800 rounded-lg transition-colors',
                    pathname === '/dashboard/alerts' && 'bg-neutral-800',
                )}
                href='/dashboard/alerts'
            >
                <IconSpeakerphone className='size-5' />
                Alerts
            </Link>
            <Link
                className={cn(
                    'flex items-center gap-1 px-3 pl-2.5 py-1 hover:bg-neutral-800 rounded-lg transition-colors',
                    pathname === '/dashboard/stats' && 'bg-neutral-800',
                )}
                href='/dashboard/stats'
            >
                <IconGraph className='size-5' />
                Statistiken
            </Link>
            <Link
                className={cn(
                    'flex items-center gap-1 px-3 pl-2.5 py-1 hover:bg-neutral-800 rounded-lg transition-colors',
                    pathname === '/dashboard/rules' && 'bg-neutral-800',
                )}
                href='/dashboard/rules'
            >
                <IconListCheck className='size-5' />
                Regeln
            </Link>
            <Link
                className={cn(
                    'flex items-center gap-1 px-3 pl-2.5 py-1 hover:bg-neutral-800 rounded-lg transition-colors',
                    pathname === '/dashboard/forensic' && 'bg-neutral-800',
                )}
                href='/dashboard/forensic'
            >
                <IconMicroscope className='size-5' />
                Forensik
            </Link>
        </nav>
    );
}
