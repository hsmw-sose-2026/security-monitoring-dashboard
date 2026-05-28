'use client';

import {useCallback, useEffect, useState} from 'react';
import {toast} from 'sonner';
import {getBackendHost} from '@/actions/getBackendHost';
import {EventTable} from '@/components/dashboard/event-table';
import type {SecurityEvent} from '@/types/dashboard';
import {Button} from '@base-ui/react';

export default function Events() {
    const [events, setEvents] = useState<SecurityEvent[]>([]);

    const [fetchFailed, setFetchFailed] = useState(false);

    const fetchEvents = useCallback(async () => {
        const loading = toast.loading('Events werden geladen');

        try {
            const response = await fetch(`${await getBackendHost()}/dashboard/events`);

            if (!response.ok) throw new Error(`Server responded with status: ${response.status}`);

            const data = (await response.json()) as SecurityEvent[];
            setEvents([...data]);
            setFetchFailed(false);
            toast.success('Events erfolgreich geladen.', {id: loading});
        } catch (_error) {
            setFetchFailed(true);
            toast.error('Events konnten nicht geladen werden.', {id: loading});
        }
    }, []);

    useEffect(() => {
        fetchEvents();
    }, [fetchEvents]);

    return (
        <main className='w-full bg-neutral-900 flex flex-col items-center pt-24 gap-4'>
            <h1 className='text-3xl font-bold mb-8'>Events</h1>
            <Button onClick={() => setFetchFailed(true)}>Fetch</Button>
            <EventTable events={events} request={{fetchFailed, setFetchFailed, fetchEvents}} className='shrink-0 h-[calc(100vh-4rem)] min-h-0 pb-4' />
        </main>
    );
}
