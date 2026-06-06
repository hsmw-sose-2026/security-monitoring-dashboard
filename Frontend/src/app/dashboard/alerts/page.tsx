'use client';

import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {toast} from 'sonner';
import {getBackendHost} from '@/actions/getBackendHost';
import {AlertRow} from '@/components/dashboard/alert-row';
import {DateInput, TimeInput} from '@/components/dashboard/datetime-input';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {filterAlerts, getAuthHeaders, getUniqueOf} from '@/lib/dashboard';
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

    const filteredAlerts = useMemo(
        () => filterAlerts(alerts, startDateTime, endDateTime, alertType, sourceIP.trim(), message.trim(), severity),
        [alerts, startDateTime, endDateTime, alertType, sourceIP, message, severity],
    );

    const [fetchFailed, setFetchFailed] = useState(false);
    const didFetch = useRef(false);

    const fetchAlerts = useCallback(async () => {
        const loading = toast.loading('Alerts werden geladen');

        try {
            const response = await fetch(`${await getBackendHost()}/dashboard/alerts`, {headers: getAuthHeaders()});

            if (!response.ok) throw new Error(`Server responded with status: ${response.status}`);

            const data = (await response.json()) as Alert[];
            setAlerts([...data]);
            setFetchFailed(false);
            toast.success('Alerts erfolgreich geladen.', {id: loading});
        } catch (_error) {
            setFetchFailed(true);
            toast.error('Alerts konnten nicht geladen werden.', {id: loading});
        }
    }, []);

    useEffect(() => {
        if (didFetch.current) return;
        didFetch.current = true;
        fetchAlerts();
    }, [fetchAlerts]);

    return (
        <main className='w-full bg-neutral-900 flex flex-col items-center pt-24 gap-4'>
            <h1 className='text-3xl font-bold mb-8'>Alerts</h1>
            <div className='flex flex-col items-center gap-4 shrink-0 h-[calc(100vh-4rem)] min-h-0 pb-4'>
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
                            {filteredAlerts.length > 0 ? (
                                filteredAlerts.map((event) => <AlertRow data={event} key={event.id} />)
                            ) : (
                                <tr>
                                    <td colSpan={5} className='text-center py-8 text-muted-foreground font-medium text-lg'>
                                        {!fetchFailed ? (
                                            'Keine Einträge mit diesem Filter'
                                        ) : (
                                            <div className='flex flex-col items-center gap-2'>
                                                <span>Alerts konnten nicht geladen werden</span>
                                                <Button onClick={fetchAlerts}>Erneut versuchen</Button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </main>
    );
}
