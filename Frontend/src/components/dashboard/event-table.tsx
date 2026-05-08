'use client';

import {type ComponentProps, useState} from 'react';
import {EventRow} from '@/components/dashboard/event-row';
import {Input} from '@/components/ui/input';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {filterEvents, getUniqueOf} from '@/lib/dashboard';
import {cn} from '@/lib/utils';
import type {SecurityEvent} from '@/types/dashboard';

export function EventTable({events, className, ...props}: {events: SecurityEvent[]} & ComponentProps<'div'>) {
    const [eventType, setEventType] = useState<string>('Alle Typen');
    const [sourceIP, setSourceIp] = useState<string>('');
    const [path, setPath] = useState<string>('Alle Paths');
    const [severity, setSeverity] = useState<string>('Alle Severities');

    return (
        <div className={cn('flex flex-col items-center gap-4', className)} {...props}>
            <div className='flex gap-4'>
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
                        {filterEvents(events, eventType, sourceIP.trim(), path, severity).map((event) => (
                            <EventRow data={event} key={event.id} />
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
