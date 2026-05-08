'use client';

import type {ComponentProps} from 'react';
import type {Alert} from '@/types/dashboard';
import {Tooltip, TooltipContent, TooltipTrigger} from '../ui/tooltip';

export function AlertRow({data, className, ...props}: {data: Alert} & ComponentProps<'tr'>) {
    return (
        <tr className={`hover:bg-neutral-800 h-11 [&>td]:p-4 [&>td]:py-2 border-b last:border-none border-neutral-700 ${className}`} {...props}>
            <td className='font-mono text-neutral-400 whitespace-nowrap'>
                {new Date(data.timestamp)
                    .toLocaleString('de-DE', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                        hour12: false,
                    })
                    .replace(/,/g, '')}
            </td>
            <td className='whitespace-nowrap'>{data.alert_type}</td>
            <td className='font-mono whitespace-nowrap'>{data.source_ip}</td>
            <td className='max-w-0 w-full'>
                <Tooltip>
                    <TooltipTrigger className='text-start w-full truncate select-text'>{data.message}</TooltipTrigger>
                    <TooltipContent className='select-text'>{data.message}</TooltipContent>
                </Tooltip>
            </td>
            <td>
                <SeverityBadge severity={data.severity} />
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
