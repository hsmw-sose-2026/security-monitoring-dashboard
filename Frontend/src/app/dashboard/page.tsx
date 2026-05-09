'use client';

import {useEffect, useState} from 'react';
import {toast} from 'sonner';
import {getBackendHost} from '@/actions/getBackendHost';
import {AttackRow} from '@/components/dashboard/attack-row';
import {Input} from '@/components/ui/input';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {filterAttacks, getUniqueOf} from '@/lib/dashboard';
import type {Attack} from '@/types/dashboard';

export default function Dashboard() {
    const [attacks, setAttacks] = useState<Attack[]>([]);
    const [classification, setClassification] = useState<string>('Alle Klassifizierungen');
    const [sourceIP, setSourceIp] = useState<string>('');
    const [severity, setSeverity] = useState<string>('Alle Severities');

    useEffect(() => {
        const getFromBackend = async () => {
            try {
                const response = await fetch(`${await getBackendHost()}/dashboard/attacks`);

                if (!response.ok) throw new Error(`Server responded with status: ${response.status}`);

                const data = (await response.json()) as Attack[];
                setAttacks([...data]);
            } catch (_error) {
                toast.error('Attacks konnten nicht geladen werden.');
            }
        };
        getFromBackend();
    }, []);

    return (
        <main className='w-full h-screen bg-neutral-900 flex flex-col items-center pt-16 gap-4'>
            <h1 className='text-3xl font-bold mb-16'>Attacks</h1>
            <div className='flex gap-4'>
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
                            <th className='w-8'></th>
                        </tr>
                    </thead>
                    <tbody>
                        {filterAttacks(attacks, classification, sourceIP.trim(), severity).map((attack, i) => (
                            <AttackRow data={attack} key={i} />
                        ))}
                    </tbody>
                </table>
            </div>
        </main>
    );
}
