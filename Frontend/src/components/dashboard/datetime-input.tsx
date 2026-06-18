'use client';

import {IconChevronDown} from '@tabler/icons-react';
import {format} from 'date-fns';
import type {Dispatch, SetStateAction} from 'react';
import {calcDateTimeParts} from '@/lib/dashboard';
import {Button} from '../ui/button';
import {Calendar} from '../ui/calendar';
import {InputGroup, InputGroupInput} from '../ui/input-group';
import {Popover, PopoverContent, PopoverTrigger} from '../ui/popover';

export function DateInput({date, setDate, placeholder}: {date: Date | null; setDate: Dispatch<SetStateAction<Date | null>>; placeholder?: string}) {
    return (
        <Popover>
            <PopoverTrigger
                render={
                    <Button variant='outline' className='w-32 justify-between font-normal bg-neutral-800 text-white border-neutral-700 hover:bg-neutral-700'>
                        {date ? format(date, 'dd.MM.yyyy') : placeholder || 'Datum auswählen'}
                        <IconChevronDown data-icon='inline-end' />
                    </Button>
                }
            />
            <PopoverContent className='w-auto overflow-hidden p-0 bg-neutral-900 text-white border-neutral-700' align='center'>
                <Calendar
                    className='bg-neutral-900 text-white'
                    mode='single'
                    selected={date ?? undefined}
                    captionLayout='dropdown'
                    defaultMonth={date ?? undefined}
                    onSelect={(date) => {
                        setDate(date ?? null);
                    }}
                />
            </PopoverContent>
        </Popover>
    );
}

export function TimeInput({time, setTime}: {time: number | null; setTime: Dispatch<SetStateAction<number | null>>}) {
    const [hours, minutes, seconds] = time ? Object.values(calcDateTimeParts(time)).slice(1) : [0, 0, 0];

    return (
        <InputGroup inputMode='numeric' className='w-max'>
            <InputGroupInput
                className='tabular-nums w-9 text-center pr-1'
                placeholder='--'
                value={time === null ? '' : hours.toString().padStart(2, '0')}
                onChange={(e) => {
                    const parsedTime = e ? parseInt(e.target.value, 10) * 1000 * 60 * 60 : null;
                    setTime((time === 0 && e.target.value.length < 2) || parsedTime === null ? null : parsedTime + minutes * 60 * 1000 + seconds * 1000);
                }}
            />
            <span className='text-muted-foreground select-none'>:</span>
            <InputGroupInput
                className='tabular-nums w-9 text-center px-1'
                placeholder='--'
                value={time === null ? '' : minutes.toString().padStart(2, '0')}
                onChange={(e) => {
                    const parsedTime = e ? parseInt(e.target.value, 10) * 1000 * 60 : null;
                    setTime((time === 0 && e.target.value.length < 2) || parsedTime === null ? null : hours * 60 * 60 * 1000 + parsedTime + seconds * 1000);
                }}
            />
            <span className='text-muted-foreground select-none'>:</span>
            <InputGroupInput
                className='tabular-nums w-9 text-center pl-1'
                placeholder='--'
                value={time === null ? '' : seconds.toString().padStart(2, '0')}
                onChange={(e) => {
                    const parsedTime = e ? parseInt(e.target.value, 10) * 1000 : null;
                    setTime(
                        (time === 0 && e.target.value.length < 2) || parsedTime === null ? null : hours * 60 * 60 * 1000 + minutes * 60 * 1000 + parsedTime,
                    );
                }}
            />
        </InputGroup>
    );
}
