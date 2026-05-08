'use client';

import {useEffect, useState} from 'react';
import {toast} from 'sonner';
import {getBackendHost} from '@/actions/getBackendHost';
import {AlertRow} from '@/components/dashboard/alert-row';
import {Input} from '@/components/ui/input';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {filterAlerts, getUniqueOf} from '@/lib/dashboard';
import type {Alert} from '@/types/dashboard';

const dummyEvents: Alert[] = [
    {
        id: 999,
        timestamp: '2026-03-26T13:00:00.000Z',
        alert_type: 'Brute Force',
        source_ip: '158.21.144.92',
        message: 'test',
        severity: 'none',
    },
    {
        id: 1000,
        timestamp: '2026-03-28T12:00:00.000Z',
        alert_type: 'SQL Injection',
        source_ip: '158.21.144.92',
        message: 'test',
        severity: 'low',
    },
    {
        id: 1001,
        timestamp: '2026-04-01T12:00:00.000Z',
        alert_type: 'SQL Injection',
        source_ip: '45.203.8.176',
        message: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Nam vel animi quia voluptatibus eligendi illo? Accusantium quod deleniti ipsa illo?',
        severity: 'medium',
    },
    {
        id: 1002,
        timestamp: '2026-04-08T12:00:00.000Z',
        alert_type: 'Brute Force',
        source_ip: '192.0.74.201',
        message: 'test',
        severity: 'high',
    },
    {
        id: 1003,
        timestamp: '2026-04-16T12:00:00.000Z',
        alert_type: 'SQL Injection',
        source_ip: '207.15.233.19',
        message: 'test',
        severity: 'critical',
    },
];

export default function Alerts() {
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [alertType, setAlertType] = useState<string>('Alle Typen');
    const [sourceIP, setSourceIp] = useState<string>('');
    const [message, setMessage] = useState<string>('');
    const [severity, setSeverity] = useState<string>('Alle Severities');

    useEffect(() => {
        const getFromBackend = async () => {
            try {
                const response = await fetch(`${await getBackendHost()}/dashboard/alerts`);

                if (!response.ok) throw new Error(`Server responded with status: ${response.status}`);

                const data = (await response.json()) as Alert[];
                setAlerts([...dummyEvents, ...data]);
            } catch (_error) {
                toast.error('Alerts konnten nicht geladen werden.');
            }
        };
        getFromBackend();
    }, []);

    return (
        <main className='w-full h-screen bg-neutral-900 flex flex-col items-center pt-16 gap-4'>
            <h1 className='text-3xl font-bold mb-16'>Alerts</h1>
            <div className='flex gap-4 w-7xl'>
                <Select value={alertType} onValueChange={(value) => value && setAlertType(value)}>
                    <SelectTrigger>
                        <SelectValue placeholder='Event Type' />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value='Alle Typen'>Alle Typen</SelectItem>
                        {getUniqueOf(alerts, 'alert_type').map((e, i) => (
                            <SelectItem key={i} value={e}>
                                {e}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Input className='font-mono w-37 shrink-0' placeholder='Source IP' value={sourceIP} onChange={(e) => e && setSourceIp(e.target.value)} />
                <Input className='w-full max-w-full' placeholder='Message' value={message} onChange={(e) => e && setMessage(e.target.value)} />
                <Select value={severity} onValueChange={(value) => value && setSeverity(value)}>
                    <SelectTrigger>
                        <SelectValue placeholder='Severity' />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value='Alle Severities'>Alle Severities</SelectItem>
                        {getUniqueOf(alerts, 'severity').map((e, i) => (
                            <SelectItem key={i} value={e}>
                                {e}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div className='w-7xl border border-neutral-700 rounded-2xl min-h-48 overflow-auto'>
                <table className='w-full'>
                    <thead>
                        <tr className='divide-x border-b border-neutral-700 *:border-neutral-700 *:text-left *:p-4 *:py-2 *:font-semibold bg-neutral-800'>
                            <th>Timestamp</th>
                            <th>Alert Type</th>
                            <th>Source IP</th>
                            <th>Message</th>
                            <th>Severity</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filterAlerts(alerts, alertType, sourceIP.trim(), message.trim(), severity).map((event) => (
                            <AlertRow data={event} key={event.id} />
                        ))}
                    </tbody>
                </table>
            </div>
        </main>
    );
}
