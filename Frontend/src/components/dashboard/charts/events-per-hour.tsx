'use client';

import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent} from '@/components/ui/chart';
import {cn} from '@/lib/utils';
import type {ComponentProps} from 'react';
import {CartesianGrid, Line, LineChart, XAxis} from 'recharts';

const chartConfig = {
    eventCount: {
        label: 'Event Anzahl',
        color: 'var(--chart-1)',
    },
} satisfies ChartConfig;

export function EventsPerHour({data, className, ...props}: {data: {time: string; eventCount: number}[]} & ComponentProps<'div'>) {
    return (
        <Card className={cn('shadow-2xl min-w-lg max-w-5xl w-full', className)} {...props}>
            <CardHeader>
                <CardTitle>Events pro Stunde</CardTitle>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig} className='h-64 w-full'>
                    <LineChart
                        accessibilityLayer
                        data={data}
                        margin={{
                            left: 12,
                            right: 12,
                        }}
                    >
                        <CartesianGrid vertical={false} />
                        <XAxis dataKey='time' tickLine={false} axisLine={false} tickMargin={8} />
                        <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                        <Line dataKey='eventCount' type='natural' stroke='var(--color-blue-300)' strokeWidth={2} dot={false} />
                    </LineChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}
