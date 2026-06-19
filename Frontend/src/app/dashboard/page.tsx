'use client';

import {IconRefresh, IconReload} from '@tabler/icons-react';
import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {toast} from 'sonner';
import {getBackendHost} from '@/actions/getBackendHost';
import {AttackRow} from '@/components/dashboard/attack-row';
import {DateInput, TimeInput} from '@/components/dashboard/datetime-input';
import {Button} from '@/components/ui/button';
import {Checkbox} from '@/components/ui/checkbox';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {filterAttacks, getAuthHeaders, getUniqueOf} from '@/lib/dashboard';
import type {Attack} from '@/types/dashboard';

export default function Dashboard() {
    const [attacks, setAttacks] = useState<Attack[]>([]);
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [startTime, setStartTime] = useState<number | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);
    const [endTime, setEndTime] = useState<number | null>(null);
    const [classification, setClassification] = useState<string>('Alle Klassifizierungen');
    const [sourceIP, setSourceIp] = useState<string>('');
    const [severity, setSeverity] = useState<string>('Alle Severities');

    const startDateTime = useMemo(() => (startDate !== null && startTime !== null ? new Date(startDate.getTime() + startTime) : null), [startDate, startTime]);
    const endDateTime = useMemo(() => (endDate !== null && endTime !== null ? new Date(endDate.getTime() + endTime) : null), [endDate, endTime]);

    const filteredAttacks = useMemo(
        () => filterAttacks(attacks, startDateTime, endDateTime, classification, sourceIP.trim(), severity),
        [attacks, startDateTime, endDateTime, classification, sourceIP, severity],
    );

    const [fetchFailed, setFetchFailed] = useState(false);
    const [lastFetched, setLastFetched] = useState<Date | null>(null);
    const didFetch = useRef(false);

    const fetchAttacks = useCallback(async () => {
        const loading = toast.loading('Attacks werden geladen');

        try {
            const response = await fetch(`${await getBackendHost()}/dashboard/attacks`, {headers: getAuthHeaders()});

            if (!response.ok) throw new Error(`Server responded with status: ${response.status}`);

            const data = (await response.json()) as Attack[];
            setAttacks([...data]);
            setFetchFailed(false);
            setLastFetched(new Date());
            toast.success('Attacks erfolgreich geladen.', {id: loading});
        } catch (_error) {
            setFetchFailed(true);
            toast.error('Attacks konnten nicht geladen werden.', {id: loading});
        }
    }, []);

    useEffect(() => {
        if (didFetch.current) return;
        didFetch.current = true;
        fetchAttacks();
    }, [fetchAttacks]);

    const [autoRefetch, setAutoRefetch] = useState(false);

    useEffect(() => {
        if (autoRefetch) {
            const interval = setInterval(fetchAttacks, 20000);
            return () => clearInterval(interval);
        }
    }, [autoRefetch, fetchAttacks]);

    return (
        <main className='w-full bg-neutral-900 flex flex-col items-center pt-24 gap-8'>
            <h1 className='text-3xl font-bold'>Attacks</h1>
            <div className='flex gap-2 items-center'>
                <span>Zuletzt aktualisiert: {lastFetched ? lastFetched?.toLocaleString('de-DE', {dateStyle: 'medium', timeStyle: 'medium'}) : '-'}</span>
                <Button onClick={fetchAttacks} variant='outline' size='icon'>
                    <IconRefresh />
                </Button>
                <div className='flex gap-2 ml-4'>
                    <Checkbox id='autorefetch' checked={autoRefetch} onCheckedChange={setAutoRefetch} />
                    <Label htmlFor='autorefetch'>Alle 20 Sekunden aktualisieren</Label>
                </div>
            </div>
            <div className='flex flex-col items-center gap-4 shrink-0 h-[calc(100vh-4rem)] min-h-0 pb-4'>
                <div className='flex gap-4'>
                    <div className='flex items-center'>
                        <DateInput date={startDate} setDate={setStartDate} placeholder='Startdatum' />
                        <div className='bg-muted/80 w-3 h-3 border-y z-10 -mx-px'></div>
                        <TimeInput time={startTime} setTime={setStartTime} />
                        <span className='mx-2'>bis</span>
                        <DateInput date={endDate} setDate={setEndDate} placeholder='Enddatum' />
                        <div className='bg-muted/80 w-3 h-3 border-y z-10 -mx-px'></div>
                        <TimeInput time={endTime} setTime={setEndTime} />
                    </div>
                    <Select value={classification} onValueChange={(value) => value && setClassification(value)}>
                        <SelectTrigger>
                            <SelectValue placeholder='Klassifizierung' />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value='Alle Klassifizierungen'>Alle Klassifizierungen</SelectItem>
                            {getUniqueOf(attacks, 'classification').map((e, i) => (
                                <SelectItem key={i} value={e}>
                                    {e}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Input className='font-mono w-37' placeholder='Source IP' value={sourceIP} onChange={(e) => e && setSourceIp(e.target.value)} />
                    <Select value={severity} onValueChange={(value) => value && setSeverity(value)}>
                        <SelectTrigger>
                            <SelectValue placeholder='Severity' />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value='Alle Severities'>Alle Severities</SelectItem>
                            {getUniqueOf(attacks, 'severity').map((e, i) => (
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
                                <th className='w-54'>
                                    Zeitraum <span className='text-sm text-muted-foreground'>(Start & Ende)</span>
                                </th>
                                <th>Dauer</th>
                                <th>Eventanzahl</th>
                                <th>Klassifizierung</th>
                                <th>Source IP</th>
                                <th>Severity</th>
                                <th>Risk Score</th>
                                <th className='w-8'></th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredAttacks.length > 0 ? (
                                filteredAttacks.map((attack, i) => <AttackRow data={attack} key={i} />)
                            ) : (
                                <tr>
                                    <td colSpan={8} className='text-center py-8 text-muted-foreground font-medium text-lg'>
                                        {!fetchFailed ? (
                                            'Keine Einträge mit diesem Filter'
                                        ) : (
                                            <div className='flex flex-col items-center gap-2'>
                                                <span>Attacks konnten nicht geladen werden</span>
                                                <Button onClick={fetchAttacks}>Erneut versuchen</Button>
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
