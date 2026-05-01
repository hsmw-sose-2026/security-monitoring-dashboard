import {IconCalendarEvent} from '@tabler/icons-react';

export default function Events() {
    return (
        <div className='flex flex-col flex-1 items-center justify-center gap-4'>
            <IconCalendarEvent className='size-8' />
            <h1 className='font-bold text-2xl'>Events Coming Soon ...</h1>
        </div>
    );
}
