'use client';

import {IconRefresh} from '@tabler/icons-react';
import {useCallback, useEffect, useRef, useState} from 'react';
import {toast} from 'sonner';
import {getBackendHost} from '@/actions/getBackendHost';
import {EventTable} from '@/components/dashboard/event-table';
import {Button} from '@/components/ui/button';
import {Checkbox} from '@/components/ui/checkbox';
import {Label} from '@/components/ui/label';
import {getAuthHeaders} from '@/lib/dashboard';
import type {Event} from '@/types/dashboard';

export default function Events() {
    const [events, setEvents] = useState<Event[]>([]);

    const [fetchFailed, setFetchFailed] = useState(false);
    const [lastFetched, setLastFetched] = useState<Date | null>(null);
    const didFetch = useRef(false);

    const fetchEvents = useCallback(async () => {
        const loading = toast.loading('Events werden geladen');

        try {
            const response = await fetch(`${await getBackendHost()}/dashboard/events`, {headers: getAuthHeaders()});

            if (!response.ok) throw new Error(`Server responded with status: ${response.status}`);

            const data = (await response.json()) as Event[];
            setEvents([...data]);
            setFetchFailed(false);
            setLastFetched(new Date());
            toast.success('Events erfolgreich geladen.', {id: loading});
        } catch (_error) {
            setFetchFailed(true);
            toast.error('Events konnten nicht geladen werden.', {id: loading});
        }
    }, []);

    useEffect(() => {
        if (didFetch.current) return;
        didFetch.current = true;
        fetchEvents();
    }, [fetchEvents]);

    const [autoRefetch, setAutoRefetch] = useState(false);

    useEffect(() => {
        if (autoRefetch) {
            const interval = setInterval(fetchEvents, 20000);
            return () => clearInterval(interval);
        }
    }, [autoRefetch, fetchEvents]);

    return (
        <main className='w-full bg-neutral-900 flex flex-col items-center pt-24 gap-8'>
            <h1 className='text-3xl font-bold'>Events</h1>
            <div className='flex gap-2 items-center'>
                <span>Zuletzt aktualisiert: {lastFetched ? lastFetched?.toLocaleString('de-DE', {dateStyle: 'medium', timeStyle: 'medium'}) : '-'}</span>
                <Button onClick={fetchEvents} variant='outline' size='icon'>
                    <IconRefresh />
                </Button>
                <div className='flex gap-2 ml-4'>
                    <Checkbox id='autorefetch' checked={autoRefetch} onCheckedChange={setAutoRefetch} />
                    <Label htmlFor='autorefetch'>Alle 20 Sekunden aktualisieren</Label>
                </div>
            </div>
            <EventTable events={events} request={{fetchFailed, setFetchFailed, fetchEvents}} className='shrink-0 h-[calc(100vh-4rem)] min-h-0 pb-4' />
        </main>
    );
}
