'use client';

import {IconEye} from '@tabler/icons-react';
import type {ComponentProps} from 'react';
import {formatRelativeDate, mapRange} from '@/lib/dashboard';
import type {Attack} from '@/types/dashboard';
import {Button} from '../ui/button';
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger} from '../ui/dialog';
import {EventTable} from './event-table';

export function AttackRow({data, className, ...props}: {data: Attack} & ComponentProps<'tr'>) {
    const startTime = new Date(data.start_time)
        .toLocaleString('de-DE', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
        })
        .replace(/,/g, '');
    const endTime = new Date(data.end_time)
        .toLocaleString('de-DE', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
        })
        .replace(/,/g, '');

    return (
        <tr className={`hover:bg-neutral-800 h-11 [&>td]:p-4 [&>td]:py-2 border-b last:border-none border-neutral-700 ${className}`} {...props}>
            <td className='font-mono text-neutral-400'>
                {startTime}
                <br />
                {endTime}
            </td>
            <td>{formatRelativeDate(new Date(data.start_time), new Date(data.end_time))}</td>
            <td>{data.event_count}</td>
            <td>{data.classification}</td>
            <td className='font-mono'>{data.source_ip}</td>
            <td>
                <SeverityBadge severity={data.severity} />
            </td>
            <td>
                <span
                    className='font-mono text-sm px-2 py-1 rounded-md bg-muted'
                    style={{
                        color: `oklch(from var(--color-teal-500) l c h / ${mapRange(data.risk_score, 0, 100, 0.5, 1)})`,
                        background: `oklch(from var(--color-teal-500) l c h / ${mapRange(data.risk_score, 0, 100, 0.1, 0.3)})`,
                    }}
                >
                    {data.risk_score}
                </span>
            </td>
            <td className='flex items-center justify-center h-16'>
                <Dialog>
                    <DialogTrigger
                        render={
                            <Button size='icon' variant='outline'>
                                <IconEye />
                            </Button>
                        }
                    />
                    <DialogContent className='w-max max-w-full! sm:rounded-4xl max-h-4/5 flex flex-col bg-neutral-900 text-white border-neutral-700'>
                        <DialogHeader>
                            <DialogTitle className='text-center font-semibold text-xl'>Attack Info</DialogTitle>
                        </DialogHeader>
                        <div className='flex gap-4 justify-evenly flex-wrap text-base mb-4'>
                            <div>
                                <span>Source IP: </span>
                                <span className='font-mono bg-neutral-800 text-neutral-300 px-2 py-1 rounded-md text-sm'>{data.source_ip}</span>
                            </div>
                            <div>
                                <span>Zeitraum: </span>
                                <span className='font-mono bg-neutral-800 text-neutral-300 px-2 py-1 rounded-md text-sm'>{startTime}</span>
                                {' - '}
                                <span className='font-mono bg-neutral-800 text-neutral-300 px-2 py-1 rounded-md text-sm'>{endTime}</span>
                            </div>
                            <div>
                                <span>Severity: </span>
                                <SeverityBadge severity={data.severity} />
                            </div>
                            <div>
                                <span>Risk Score: </span>
                                <span
                                    className='font-mono text-sm px-2 py-1 rounded-md bg-muted'
                                    style={{
                                        color: `oklch(from var(--color-teal-500) l c h / ${mapRange(data.risk_score, 0, 100, 0.5, 1)})`,
                                        background: `oklch(from var(--color-teal-500) l c h / ${mapRange(data.risk_score, 0, 100, 0.1, 0.3)})`,
                                    }}
                                >
                                    {data.risk_score}
                                </span>
                            </div>
                        </div>
                        <h3 className='text-center font-semibold text-lg'>Events</h3>
                        <EventTable events={data.events} className='self-start flex-1 min-h-0' />
                    </DialogContent>
                </Dialog>
            </td>
        </tr>
    );
}

const severityStyles: Record<string, string> = {
    low: 'bg-blue-950 text-blue-400',
    medium: 'bg-amber-950 text-amber-400',
    high: 'bg-rose-950 text-rose-400',
    critical: 'bg-fuchsia-950 text-fuchsia-400',
    default: 'bg-neutral-700 text-neutral-300',
};

function SeverityBadge({severity}: {severity: string}) {
    const style = severityStyles[severity.toLowerCase()] || severityStyles.default;
    return <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium capitalize ${style}`}>{severity}</span>;
}
