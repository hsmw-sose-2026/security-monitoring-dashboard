<<<<<<< HEAD
import type {Alert, Attack, SecurityEvent} from '@/types/dashboard';
=======
import type {Alert, Attack, Event} from '@/types/dashboard';

export function getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('access_token');
    return token ? {Authorization: `Bearer ${token}`} : {};
}
>>>>>>> origin/integration-test

export function getUniqueOf<T, K extends keyof T>(data: T[], key: K): T[K][] {
    return [...new Set(data.map((e) => e[key]))].filter((val) => val !== null && val !== undefined) as T[K][];
}

type DateTimePartsObj = {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
};

export function calcDateTimeParts(ms: number): DateTimePartsObj {
    // conversion constants
    const msInSec = 1000;
    const msInMin = msInSec * 60;
    const msInHour = msInMin * 60;
    const msInDay = msInHour * 24;

    const days = Math.floor(ms / msInDay);
    ms %= msInDay; // remaining time without days

    const hours = Math.floor(ms / msInHour);
    ms %= msInHour; // remaining time without hours

    const minutes = Math.floor(ms / msInMin);
    ms %= msInMin; // remaining time without minutes

    const seconds = Math.floor(ms / msInSec);

    const parts = {} as DateTimePartsObj;

    parts['days'] = days;
    parts['hours'] = hours;
    parts['minutes'] = minutes;
    parts['seconds'] = seconds;

    return parts;
}

export function formatRelativeDate(date1: Date, date2: Date): string {
    const ms = Math.abs(date2.getTime() - date1.getTime());

    const {days, hours, minutes, seconds} = calcDateTimeParts(ms);
    const parts = [];

    if (days) parts.push(`${days}d`);
    if (hours) parts.push(`${hours}h`);
    if (minutes) parts.push(`${minutes}m`);
    parts.push(`${seconds}s`);

    return parts.join(' ');
}

<<<<<<< HEAD
export function filterEvents(
    events: SecurityEvent[],
    startDateTime: Date | null,
    endDateTime: Date | null,
    eventType: SecurityEvent['event_type'],
    sourceIP: SecurityEvent['source_ip'],
    path: SecurityEvent['path'],
    severity: SecurityEvent['severity'],
): SecurityEvent[] {
=======
export const mapRange = (value: number, inMin: number, inMax: number, outMin: number, outMax: number) => {
    return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
};

export function filterEvents(
    events: Event[],
    startDateTime: Date | null,
    endDateTime: Date | null,
    eventType: Event['event_type'],
    sourceIP: Event['source_ip'],
    path: Event['path'],
    severity: Event['severity'],
): Event[] {
>>>>>>> origin/integration-test
    const filteredEvents = [];

    for (const event of events) {
        let matches = true;
        const timestamp = new Date(event.timestamp);

        if (startDateTime !== null && timestamp < startDateTime) matches = false;
        else if (endDateTime !== null && timestamp > endDateTime) matches = false;
        else if (eventType !== 'Alle Typen' && event.event_type !== eventType) matches = false;
        else if (sourceIP !== '' && !event.source_ip.includes(sourceIP)) matches = false;
        else if (path !== 'Alle Paths' && event.path !== path) matches = false;
        else if (severity !== 'Alle Severities' && event.severity !== severity) matches = false;

        if (matches) filteredEvents.push(event);
    }

    return filteredEvents;
}

export function filterAlerts(
    alerts: Alert[],
    startDateTime: Date | null,
    endDateTime: Date | null,
    alertType: Alert['alert_type'],
    sourceIP: Alert['source_ip'],
    message: Alert['message'],
    severity: Alert['severity'],
): Alert[] {
    const filteredEvents = [];

    for (const event of alerts) {
        let matches = true;
        const timestamp = new Date(event.timestamp);

        if (startDateTime !== null && timestamp < startDateTime) matches = false;
        else if (endDateTime !== null && timestamp > endDateTime) matches = false;
        else if (alertType !== 'Alle Typen' && event.alert_type !== alertType) matches = false;
        else if (sourceIP !== '' && !event.source_ip.includes(sourceIP)) matches = false;
        else if (message !== '' && !event.message.includes(message)) matches = false;
        else if (severity !== 'Alle Severities' && event.severity !== severity) matches = false;

        if (matches) filteredEvents.push(event);
    }

    return filteredEvents;
}

export function filterAttacks(
    events: Attack[],
<<<<<<< HEAD
=======
    startDateTime: Date | null,
    endDateTime: Date | null,
>>>>>>> origin/integration-test
    classification: Attack['classification'],
    sourceIP: Attack['source_ip'],
    severity: Attack['severity'],
): Attack[] {
    const filteredEvents = [];

    for (const event of events) {
        let matches = true;

<<<<<<< HEAD
        if (classification !== 'Alle Klassifizierungen' && event.classification !== classification) matches = false;
=======
        if (startDateTime !== null && endDateTime !== null && (endDateTime < new Date(event.start_time) || new Date(event.end_time) < startDateTime))
            matches = false;
        else if (classification !== 'Alle Klassifizierungen' && event.classification !== classification) matches = false;
>>>>>>> origin/integration-test
        else if (sourceIP !== '' && !event.source_ip.includes(sourceIP)) matches = false;
        else if (severity !== 'Alle Severities' && event.severity !== severity) matches = false;

        if (matches) filteredEvents.push(event);
    }

    return filteredEvents;
}
