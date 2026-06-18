'use client';

import { IconEye, IconShieldX } from '@tabler/icons-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { getBackendHost } from '@/actions/getBackendHost';
import { getAuthHeaders } from '@/lib/dashboard';
import ModalForensicDetails from '../components/ModalForensicDetails';

// ─── Typen ────────────────────────────────────────────────────────────────────

export type DecodeStep = {
    layer: string;
    output: string;
    changed: boolean;
};

export type ForensicEvent = {
    event_id: number;
    timestamp: string;
    source_ip: string;
    event_type: 'ml_detected_attack';
    severity: 'low' | 'medium' | 'high' | 'critical' | (string & {});
    original_payload: string;
    decode_steps: DecodeStep[];
    final_decoded: string;
    ml_label: 'xss' | 'sqli' | 'path_traversal' | 'cmd_injection' | (string & {});
    ml_confidence: number;
    p_malicious: number;
    regex_match: boolean;
    explanation: string;
};

// ─── Severity Badge ───────────────────────────────────────────────────────────

const SEVERITY_STYLES: Record<string, string> = {
    critical: 'bg-purple-900/60 text-purple-400',
    high:     'bg-red-900/60 text-red-400',
    medium:   'bg-amber-900/60 text-amber-400',
    low:      'bg-blue-900/60 text-blue-400',
};

export function SeverityBadge({ severity }: { severity: ForensicEvent['severity'] }) {
    const style = SEVERITY_STYLES[severity] ?? 'bg-neutral-700/60 text-neutral-300';
    return (
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${style}`}>
            {severity}
        </span>
    );
}

// ─── ML-Label Badge ───────────────────────────────────────────────────────────

const ML_LABEL_STYLES: Record<string, string> = {
    xss:            'bg-pink-900/60 text-pink-400',
    sqli:           'bg-orange-900/60 text-orange-400',
    path_traversal: 'bg-cyan-900/60 text-cyan-400',
    cmd_injection:  'bg-red-900/60 text-red-400',
};

export function MlLabelBadge({ label }: { label: ForensicEvent['ml_label'] }) {
    const style = ML_LABEL_STYLES[label] ?? 'bg-neutral-700/60 text-neutral-300';
    return (
        <span className={`text-xs font-mono font-semibold px-2 py-0.5 rounded-md ${style}`}>
            {label}
        </span>
    );
}

// ─── Confidence-Anzeige ───────────────────────────────────────────────────────

function ConfidenceBar({ value }: { value: number }) {
    const pct = Math.round(value * 100);
    const color = pct >= 80 ? 'bg-red-500' : pct >= 50 ? 'bg-amber-500' : 'bg-blue-500';
    return (
        <div className='flex items-center gap-2 min-w-22.5'>
            <div className='flex-1 h-1.5 bg-neutral-700 rounded-full overflow-hidden'>
                <div className={`h-full ${color}`} style={{ width: `${pct}%` }} />
            </div>
            <span className='text-xs text-gray-400 font-mono w-9 text-right'>{pct}%</span>
        </div>
    );
}

// ─── Haupt-Komponente ─────────────────────────────────────────────────────────

export default function ForensicEvents() {
    const [events, setEvents] = useState<ForensicEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedEvent, setSelectedEvent] = useState<ForensicEvent | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

    useEffect(() => {
        const load = async () => {
            try {
                const backendHost = await getBackendHost();
                const res = await fetch(`${backendHost}/dashboard/forensic?limit=50`, { headers: getAuthHeaders() });
                if (!res.ok) throw new Error(`Fehler ${res.status}`);
                const raw = await res.json();
                console.log('raw:', raw, Array.isArray(raw));
                // Unterstützt sowohl direktes Array als auch { events: [...] } / { data: [...] }
                const data: ForensicEvent[] = Array.isArray(raw)
                    ? raw
                    : Array.isArray(raw.events)
                    ? raw.events
                    : Array.isArray(raw.data)
                    ? raw.data
                    : [];
                setEvents(data);
            } catch (err: unknown) {
                toast.error('Forensik-Events konnten nicht geladen werden: ' + (err instanceof Error ? err.message : String(err)));
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const openDetails = (event: ForensicEvent) => {
        setSelectedEvent(event);
        setIsDetailModalOpen(true);
    };

    const formatTimestamp = (ts: string) => {
        try {
            return new Date(ts).toLocaleString('de-DE');
        } catch {
            return ts;
        }
    };

    // ─────────────────────────────────────────────────────────────────────────

    return (
        <>
        <div className='w-full min-h-screen bg-neutral-900 flex flex-col pt-24 gap-4 pb-8'>

            {/* Header */}
            <div className='ml-2 mr-2 p-4 rounded-lg'>
                <h1 className='text-3xl font-bold mb-3 text-white'>Analysierte Payloads</h1>
                <p className='text-gray-300'>Von der KI erkannte und automatisch deobfuskierte Angriffs-Payloads.</p>
            </div>

            {/* Tabelle */}
            <div className='ml-2 mr-2 border border-neutral-700 rounded-2xl overflow-auto'>
                <table className='w-full'>
                    <thead>
                        <tr className='divide-x border-b border-neutral-700 *:border-neutral-700 *:text-left *:p-4 *:py-2 *:font-semibold bg-neutral-800'>
                            <th>Zeitstempel</th>
                            <th>Source-IP</th>
                            <th>ML-Label</th>
                            <th>Severity</th>
                            <th>Confidence</th>
                            <th>P(malicious)</th>
                            <th>Regex</th>
                            <th className='w-10'></th>
                        </tr>
                    </thead>
                    <tbody>
                        {events.map(event => (
                            <tr
                                key={event.event_id}
                                className='divide-x border-b border-neutral-700 *:border-neutral-700 *:p-4 *:py-3 last:border-b-0 hover:bg-neutral-800/50 transition-colors'
                            >
                                <td className='font-mono text-sm text-gray-300 whitespace-nowrap'>{formatTimestamp(event.timestamp)}</td>
                                <td className='font-mono text-sm text-gray-300'>{event.source_ip}</td>
                                <td><MlLabelBadge label={event.ml_label} /></td>
                                <td><SeverityBadge severity={event.severity} /></td>
                                <td><ConfidenceBar value={event.ml_confidence} /></td>
                                <td><ConfidenceBar value={event.p_malicious} /></td>
                                <td>
                                    {event.regex_match ? (
                                        <span className='text-xs text-green-400'>Ja</span>
                                    ) : (
                                        <span className='text-xs text-gray-500'>Nein</span>
                                    )}
                                </td>
                                <td>
                                    <button
                                        onClick={() => openDetails(event)}
                                        title='Details anzeigen'
                                        className='inline-flex items-center justify-center size-7 rounded-md bg-neutral-700/60 hover:bg-neutral-600 text-gray-300 hover:text-white transition-colors'
                                    >
                                        <IconEye className='size-4' />
                                    </button>
                                </td>
                            </tr>
                        ))}

                        {!loading && events.length === 0 && (
                            <tr>
                                <td colSpan={8} className='p-8 text-center text-gray-500 italic'>
                                    <div className='flex flex-col items-center gap-2'>
                                        <IconShieldX className='size-6 text-gray-600' />
                                        Keine Forensik-Events vorhanden.
                                    </div>
                                </td>
                            </tr>
                        )}

                        {loading && (
                            <tr>
                                <td colSpan={8} className='p-8 text-center text-gray-500 italic'>
                                    Lade Events...
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>

        {isDetailModalOpen && selectedEvent && (
            <ModalForensicDetails
                event={selectedEvent}
                onClose={() => setIsDetailModalOpen(false)}
            />
        )}
        </>
    );
}