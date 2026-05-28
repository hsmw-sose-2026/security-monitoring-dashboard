'use client';

import {type ComponentProps, type Dispatch, type SetStateAction, useMemo, useState} from 'react';
import {EventRow} from '@/components/dashboard/event-row';
import {Input} from '@/components/ui/input';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {filterEvents, getUniqueOf} from '@/lib/dashboard';
import {cn} from '@/lib/utils';
import type {Event} from '@/types/dashboard';
import {Button} from '../ui/button';
import {DateInput, TimeInput} from './datetime-input';

export function EventTable({
    events,
    request,
    className,
    ...props
}: {
    events: Event[];
    request?: {fetchFailed: boolean; setFetchFailed: Dispatch<SetStateAction<boolean>>; fetchEvents: () => void};
} & ComponentProps<'div'>) {
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [startTime, setStartTime] = useState<number | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);
    const [endTime, setEndTime] = useState<number | null>(null);
    const [eventType, setEventType] = useState<string>('Alle Typen');
    const [sourceIP, setSourceIp] = useState<string>('');
    const [path, setPath] = useState<string>('Alle Paths');
    const [severity, setSeverity] = useState<string>('Alle Severities');

    const startDateTime = useMemo(() => (startDate !== null && startTime !== null ? new Date(startDate.getTime() + startTime) : null), [startDate, startTime]);
    const endDateTime = useMemo(() => (endDate !== null && endTime !== null ? new Date(endDate.getTime() + endTime) : null), [endDate, endTime]);

    const filteredEvents = useMemo(
        () => filterEvents(events, startDateTime, endDateTime, eventType, sourceIP.trim(), path, severity),
        [events, startDateTime, endDateTime, eventType, sourceIP, path, severity],
    );

    return (
        <div className={cn('flex flex-col items-center gap-4', className)} {...props}>
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
                <Select value={eventType} onValueChange={(value) => value && setEventType(value)}>
                    <SelectTrigger>
                        <SelectValue placeholder='Event Type' />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value='Alle Typen'>Alle Typen</SelectItem>
                        {getUniqueOf(events, 'event_type').map((e, i) => (
                            <SelectItem key={i} value={e}>
                                {e}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Input className='font-mono w-37' placeholder='Source IP' value={sourceIP} onChange={(e) => e && setSourceIp(e.target.value)} />
                <Select value={path} onValueChange={(value) => value && setPath(value)}>
                    <SelectTrigger>
                        <SelectValue placeholder='Path' />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value='Alle Paths'>Alle Paths</SelectItem>
                        {getUniqueOf(events, 'path').map((e, i) => (
                            <SelectItem key={i} value={e}>
                                {e}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Select value={severity} onValueChange={(value) => value && setSeverity(value)}>
                    <SelectTrigger>
                        <SelectValue placeholder='Severity' />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value='Alle Severities'>Alle Severities</SelectItem>
                        {getUniqueOf(events, 'severity').map((e, i) => (
                            <SelectItem key={i} value={e}>
                                {e}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div className='w-7xl border border-neutral-700 rounded-2xl min-h-48 flex-1 overflow-auto'>
                <table className='w-full'>
                    <thead>
                        <tr className='divide-x border-b border-neutral-700 *:border-neutral-700 *:text-left *:p-4 *:py-2 *:font-semibold bg-neutral-800'>
                            <th className='w-54'>Timestamp</th>
                            <th>Event Type</th>
                            <th>Source IP</th>
                            <th>Path</th>
                            <th>Severity</th>
                            <th className='w-8'>Details</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredEvents.length > 0 ? (
                            filteredEvents.map((event) => <EventRow data={event} key={event.id} />)
                        ) : (
                            <tr>
                                <td colSpan={6} className='text-center py-8 text-muted-foreground font-medium text-lg'>
                                    {!request?.fetchFailed ? (
                                        'Keine Einträge mit diesem Filter'
                                    ) : (
                                        <div className='flex flex-col items-center gap-2'>
                                            <span>Events konnten nicht geladen werden</span>
                                            <Button onClick={request.fetchEvents}>Erneut versuchen</Button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
