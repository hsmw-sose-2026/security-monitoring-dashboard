'use client';

import {useCallback, useEffect, useRef, useState} from 'react';
import {toast} from 'sonner';
import {getBackendHost} from '@/actions/getBackendHost';
import {EventsByType} from '@/components/dashboard/charts/events-by-types';
import {EventsPerHour} from '@/components/dashboard/charts/events-per-hour';
import {KPICard} from '@/components/dashboard/kpi-card';
import {Button} from '@/components/ui/button';
import {getAuthHeaders} from '@/lib/dashboard';
import type {Stats} from '@/types/dashboard';

export default function Stats() {
    const [stats, setStats] = useState<Stats>();

    const [fetchFailed, setFetchFailed] = useState(false);
    const didFetch = useRef(false);

    const fetchStats = useCallback(async () => {
        const loading = toast.loading('Statistiken werden geladen');

        try {
            const response = await fetch(`${await getBackendHost()}/dashboard/stats`, {headers: getAuthHeaders()});

            if (!response.ok) throw new Error(`Server responded with status: ${response.status}`);

            const data = (await response.json()) as Stats;
            setStats(data);
            setFetchFailed(false);
            toast.success('Statistiken erfolgreich geladen.', {id: loading});
        } catch (_error) {
            setFetchFailed(true);
            toast.error('Statistiken konnten nicht geladen werden.', {id: loading});
        }
    }, []);

    useEffect(() => {
        if (didFetch.current) return;
        didFetch.current = true;
        fetchStats();
    }, [fetchStats]);

    return (
        <main className='w-full min-h-screen bg-neutral-900 flex flex-col items-center pt-24 gap-4'>
            <h1 className='text-3xl font-bold mb-8'>Statistiken</h1>
            {fetchFailed && (
                <div className='flex flex-col items-center gap-2 p-4 border-2 border-amber-500 bg-amber-500/10 rounded-xl'>
                    <h2>Statistiken konnten nicht geladen werden</h2>
                    <Button onClick={fetchStats}>Erneut versuchen</Button>
                </div>
            )}
            <div className='flex gap-4 flex-wrap px-4 justify-center'>
                <KPICard heading='Events heute' value={stats?.events_today.toLocaleString('de-DE') || ''} />
                <KPICard heading='Alerts heute' value={stats?.alerts_today.toLocaleString('de-DE') || ''} />
                <KPICard heading='Nachrichten heute' value={stats?.contact_messages_today.toLocaleString('de-DE') || ''} />
                <KPICard heading='Uploads heute' value={stats?.uploads_today.toLocaleString('de-DE') || ''} />
                <KPICard heading='Kritische Alerts' value={stats?.critical_alerts.toLocaleString('de-DE') || ''} />
                <KPICard heading='Ø Events pro Stunde' value={stats?.average_events.toLocaleString('de-DE') || ''} />
                <KPICard heading='Alerts Gesamt' value={stats?.total_alerts.toLocaleString('de-DE') || ''} />
            </div>
            <EventsByType
                data={Object.entries(stats?.events_by_type || {})
                    .map(([eventType, eventCount]) => ({eventType, eventCount}))
                    .sort((a, b) => b.eventCount - a.eventCount)}
                className='mt-8'
            />
            <EventsPerHour
                data={Object.entries(stats?.events_per_hour || {})
                    .map(([time, eventCount]) => ({time, eventCount}))
                    .sort((a, b) => b.eventCount - a.eventCount)}
                className='mt-8'
            />
        </main>
    );
}
