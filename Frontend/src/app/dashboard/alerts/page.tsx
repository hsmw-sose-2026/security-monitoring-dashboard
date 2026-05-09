'use client';

import {useEffect, useMemo, useState} from 'react';
import {toast} from 'sonner';
import {getBackendHost} from '@/actions/getBackendHost';
import {AlertRow} from '@/components/dashboard/alert-row';
import {DateInput, TimeInput} from '@/components/dashboard/datetime-input';
import {Input} from '@/components/ui/input';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {filterAlerts, getUniqueOf} from '@/lib/dashboard';
import type {Alert} from '@/types/dashboard';

export default function Alerts() {
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [startTime, setStartTime] = useState<number | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);
    const [endTime, setEndTime] = useState<number | null>(null);
    const [alertType, setAlertType] = useState<string>('Alle Typen');
    const [sourceIP, setSourceIp] = useState<string>('');
    const [message, setMessage] = useState<string>('');
    const [severity, setSeverity] = useState<string>('Alle Severities');

    const startDateTime = useMemo(() => (startDate !== null && startTime !== null ? new Date(startDate.getTime() + startTime) : null), [startDate, startTime]);
    const endDateTime = useMemo(() => (endDate !== null && endTime !== null ? new Date(endDate.getTime() + endTime) : null), [endDate, endTime]);

    useEffect(() => {
        const getFromBackend = async () => {
            try {
                const response = await fetch(`${await getBackendHost()}/dashboard/alerts`);

                if (!response.ok) throw new Error(`Server responded with status: ${response.status}`);

                const data = (await response.json()) as Alert[];
                setAlerts([...data]);
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
                <div className='flex items-center'>
                    <DateInput date={startDate} setDate={setStartDate} placeholder='Startdatum' />
                    <div className='bg-muted/80 w-3 h-3 border-y z-10 -mx-px'></div>
                    <TimeInput time={startTime} setTime={setStartTime} />
                    <span className='mx-2'>bis</span>
                    <DateInput date={endDate} setDate={setEndDate} placeholder='Enddatum' />
                    <div className='bg-muted/80 w-3 h-3 border-y z-10 -mx-px'></div>
                    <TimeInput time={endTime} setTime={setEndTime} />
                </div>
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
                        {filterAlerts(alerts, startDateTime, endDateTime, alertType, sourceIP.trim(), message.trim(), severity).map((event) => (
                            <AlertRow data={event} key={event.id} />
                        ))}
                    </tbody>
                </table>
            </div>
        </main>
    );
}
