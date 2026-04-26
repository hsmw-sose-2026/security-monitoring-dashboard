'use client';

import type {ComponentProps} from 'react';
import type {SecurityEvent} from '@/types/dashboard';

export function OverviewRow({data, className, ...props}: {data: SecurityEvent} & ComponentProps<'tr'>) {
    return (
        <tr className={`hover:bg-neutral-800 h-max [&>td]:p-4 [&>td]:py-2 border-b last:border-none border-neutral-700 ${className}`} {...props}>
            <td className='font-mono text-neutral-400'>
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
            <td>{data.event_type}</td>
            <td className='font-mono'>{data.source_ip}</td>
            <td>{data.path}</td>
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
