'use client';

import {useEffect, useState} from 'react';
import {OverviewRow} from '@/components/dashboard/overview';
import type {SecurityEvent} from '@/types/dashboard';

const dummyEvents: SecurityEvent[] = [
    {
        id: 999,
        timestamp: '2026-03-26T13:00:00.000Z',
        event_type: 'Brute Force',
        source_ip: '158.21.144.92',
        path: '/login',
        detail: 'test',
        severity: 'none',
    },
    {
        id: 1000,
        timestamp: '2026-03-28T12:00:00.000Z',
        event_type: 'SQL Injection',
        source_ip: '158.21.144.92',
        path: '/login',
        detail: 'test',
        severity: 'low',
    },
    {
        id: 1001,
        timestamp: '2026-04-01T12:00:00.000Z',
        event_type: 'SQL Injection',
        source_ip: '45.203.8.176',
        path: '/login',
        detail: 'test',
        severity: 'medium',
    },
    {
        id: 1002,
        timestamp: '2026-04-08T12:00:00.000Z',
        event_type: 'Brute Force',
        source_ip: '192.0.74.201',
        path: '/login',
        detail: 'test',
        severity: 'high',
    },
    {
        id: 1003,
        timestamp: '2026-04-16T12:00:00.000Z',
        event_type: 'SQL Injection',
        source_ip: '207.15.233.19',
        path: '/login',
        detail: 'test',
        severity: 'critical',
    },
];

export default function Dashboard() {
    const [events, setEvents] = useState<SecurityEvent[]>([]);

    useEffect(() => {
        const getFromBackend = async () => {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_HOST}/dashboard/events`).catch((r) => r);
            const data = response.ok ? ((await response.json()) as SecurityEvent[]) : [];
            setEvents([...dummyEvents, ...data]);
        };
        getFromBackend();
    }, []);

    return (
        <main className='w-full h-screen bg-neutral-900 flex flex-col items-center pt-16 gap-16'>
            <h1 className='text-3xl font-bold'>Dashboard</h1>
            <div className='w-7xl border border-neutral-700 rounded-2xl min-h-48 overflow-auto'>
                <table className='w-full table-fixed'>
                    <thead>
                        <tr className='divide-x border-b border-neutral-700 *:border-neutral-700 *:text-left *:p-4 *:py-2 *:font-semibold bg-neutral-800'>
                            <th className='w-54'>Timestamp</th>
                            <th>Event Type</th>
                            <th>Source IP</th>
                            <th>Path</th>
                            <th>Severity</th>
                        </tr>
                    </thead>
                    <tbody>
                        {events.map((event) => (
                            <OverviewRow data={event} key={event.id} />
                        ))}
                    </tbody>
                </table>
            </div>
        </main>
    );
}
