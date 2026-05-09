'use client';

import {useEffect, useState} from 'react';
import {toast} from 'sonner';
import {getBackendHost} from '@/actions/getBackendHost';
import {EventTable} from '@/components/dashboard/event-table';
import type {SecurityEvent} from '@/types/dashboard';

export default function Dashboard() {
    const [events, setEvents] = useState<SecurityEvent[]>([]);

    useEffect(() => {
        const getFromBackend = async () => {
            try {
                const response = await fetch(`${await getBackendHost()}/dashboard/events`);

                if (!response.ok) throw new Error(`Server responded with status: ${response.status}`);

                const data = (await response.json()) as SecurityEvent[];
                setEvents([...data]);
            } catch (_error) {
                toast.error('Events konnten nicht geladen werden.');
            }
        };
        getFromBackend();
    }, []);

    return (
        <main className='w-full h-screen bg-neutral-900 flex flex-col items-center pt-16 gap-4'>
            <h1 className='text-3xl font-bold mb-16'>Events</h1>
            <EventTable events={events} className='flex-1 min-h-0' />
        </main>
    );
}
