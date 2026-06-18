'use client';

import type {ComponentProps} from 'react';
import {Bar, BarChart, LabelList, XAxis, YAxis} from 'recharts';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent} from '@/components/ui/chart';
import {cn} from '@/lib/utils';

const chartConfig = {
    eventCount: {
        label: 'Event Anzahl',
        color: 'var(--color-chart-1)',
    },
} satisfies ChartConfig;

export function EventsByType({data, className, ...props}: {data: {eventType: string; eventCount: number}[]} & ComponentProps<'div'>) {
    return (
        <Card className={cn('shadow-2xl min-w-lg max-w-5xl w-full', className)} {...props}>
            <CardHeader>
                <CardTitle>Anzahl der Events pro Eventtyp</CardTitle>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig} style={{height: data.length * 64}} className='w-full'>
                    <BarChart accessibilityLayer data={data} layout='vertical'>
                        <XAxis type='number' dataKey='eventCount' />
                        <YAxis dataKey='eventType' type='category' tickLine={false} axisLine={false} hide />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey='eventCount' fill='var(--color-blue-500)' radius={8}>
                            <LabelList dataKey='eventType' position='insideLeft' offset={8} className='fill-background font-semibold' fontSize={16} />
                        </Bar>
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}
