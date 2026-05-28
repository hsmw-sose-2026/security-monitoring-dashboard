import type {ComponentProps} from 'react';
import {cn} from '@/lib/utils';

export function KPICard({heading, value, subtitle, className, ...props}: {heading: string; value: string; subtitle?: string} & ComponentProps<'div'>) {
    return (
        <div className={cn('border px-4 py-3 rounded-xl bg-muted/50 shadow-2xl', className)} {...props}>
            <div className='text-2xl font-extrabold text-center'>{value}</div>
            <h3 className='text-lg font-semibold text-center'>{heading}</h3>
            {subtitle && <p className='text-sm text-muted-foreground text-center'>{subtitle}</p>}
        </div>
    );
}
