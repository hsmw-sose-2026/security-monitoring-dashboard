'use client';

import { useState } from 'react';
import { IconX } from '@tabler/icons-react';
import { getBackendHost } from '@/actions/getBackendHost';
import { getAuthHeaders } from '@/lib/dashboard';

interface RuleClass {
    id: number;
    name: string;
}

interface Rule {
    id: number;
    classId: number;
    name: string;
    eventType: string;
    target: string;
    regex: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    enabled: boolean;
    description: string;
}

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    classes: RuleClass[];
    onCreated: (classId: number, rule: Rule) => void;
}

const ModalAddRule = ({ isOpen, onClose, classes, onCreated }: ModalProps) => {
    const [classId, setClassId] = useState<number>(classes[0]?.id ?? 0);
    const [name, setName] = useState('');
    const [eventType, setEventType] = useState('');
    const [target, setTarget] = useState('');
    const [regex, setRegex] = useState('');
    const [severity, setSeverity] = useState<Rule['severity']>('low');
    const [enabled, setEnabled] = useState(true);
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !eventType.trim() || !target.trim() || !regex.trim()) return;
        setLoading(true);
        setError(null);

        const payload = {
            class_id: classId,
            name: name.trim(),
            event_type: eventType.trim(),
            target: target.trim(),
            regex: regex.trim(),
            severity,
            enabled,
            description: description.trim(),
        };

        try {
            const backendHost = await getBackendHost();
            const res = await fetch(`${backendHost}/rules`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(getAuthHeaders() as Record<string, string>),
                },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data?.detail || `Fehler ${res.status}`);
            }

            const created: Rule = await res.json();
            onCreated(classId, created);

            // Reset
            setName(''); setEventType(''); setTarget(''); setRegex('');
            setSeverity('low'); setEnabled(true); setDescription('');
            onClose();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : String(err));
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-neutral-900 bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-neutral-800 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold text-white">Neue Regel anlegen</h3>
                        <button onClick={onClose}>
                            <IconX className="size-6 text-white" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="space-y-4">
                            {/* Klasse */}
                            <div>
                                <label className="block text-sm font-medium text-white mb-1">Klasse</label>
                                <select
                                    required
                                    value={classId}
                                    onChange={e => setClassId(Number(e.target.value))}
                                    className="w-full px-3 py-2 bg-neutral-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-white"
                                >
                                    {classes.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Name */}
                            <div>
                                <label className="block text-sm font-medium text-white mb-1">Name der Regel</label>
                                <input type="text" required value={name} onChange={e => setName(e.target.value)}
                                    className="w-full px-3 py-2 bg-neutral-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-white" />
                            </div>

                            {/* Event-Type */}
                            <div>
                                <label className="block text-sm font-medium text-white mb-1">Event-Type</label>
                                <input type="text" required value={eventType} onChange={e => setEventType(e.target.value)}
                                    placeholder="z. B. sqli, xss, failed_login"
                                    className="w-full px-3 py-2 bg-neutral-700 text-white placeholder:text-neutral-400 rounded-md focus:outline-none focus:ring-2 focus:ring-white font-mono" />
                            </div>

                            {/* Target */}
                            <div>
                                <label className="block text-sm font-medium text-white mb-1">Target</label>
                                <input type="text" required value={target} onChange={e => setTarget(e.target.value)}
                                    className="w-full px-3 py-2 bg-neutral-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-white" />
                            </div>

                            {/* Regex */}
                            <div>
                                <label className="block text-sm font-medium text-white mb-1">Regex</label>
                                <input type="text" required value={regex} onChange={e => setRegex(e.target.value)}
                                    className="w-full px-3 py-2 bg-neutral-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-white font-mono" />
                            </div>

                            {/* Severity */}
                            <div>
                                <label className="block text-sm font-medium text-white mb-1">Severity</label>
                                <select value={severity} onChange={e => setSeverity(e.target.value as Rule['severity'])}
                                    className="w-full px-3 py-2 bg-neutral-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-white">
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                    <option value="critical">Critical</option>
                                </select>
                            </div>

                            {/* Enabled */}
                            <div className="flex items-center gap-3">
                                <input type="checkbox" id="ruleEnabled" checked={enabled} onChange={e => setEnabled(e.target.checked)}
                                    className="h-5 w-5 accent-green-400" />
                                <label htmlFor="ruleEnabled" className="text-sm font-medium text-white cursor-pointer">Aktivieren</label>
                            </div>

                            {/* Beschreibung */}
                            <div>
                                <label className="block text-sm font-medium text-white mb-1">
                                    Beschreibung <span className="text-gray-400">(optional)</span>
                                </label>
                                <input type="text" value={description} onChange={e => setDescription(e.target.value)}
                                    placeholder="(optional)"
                                    className="w-full px-3 py-2 bg-neutral-700 text-white placeholder:text-neutral-400 rounded-md focus:outline-none focus:ring-2 focus:ring-white" />
                            </div>

                            {error && <p className="text-red-400 text-sm">{error}</p>}
                        </div>

                        <div className="mt-6 flex justify-end space-x-3">
                            <button type="button" onClick={onClose}
                                className="px-4 py-2 text-sm font-medium text-gray-300 bg-neutral-600 rounded-md hover:bg-neutral-500">
                                Abbrechen
                            </button>
                            <button type="submit" disabled={loading}
                                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50">
                                {loading ? 'Wird gespeichert…' : 'Speichern'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ModalAddRule;