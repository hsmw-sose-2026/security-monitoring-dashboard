'use client';

import { useState } from 'react';
import { IconX } from '@tabler/icons-react';
import { getBackendHost } from '@/actions/getBackendHost';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreated: (cls: { id: number; name: string; description: string; rules: [] }) => void;
}

const ModalAddClass = ({ isOpen, onClose, onCreated }: ModalProps) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;
        setLoading(true);
        setError(null);

        try {
            const backendHost = await getBackendHost();
            const res = await fetch(`${backendHost}/rules/classes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: name.trim(), description: description.trim() }),
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data?.detail || `Fehler ${res.status}`);
            }

            const created = await res.json();
            onCreated({ ...created, rules: [] });
            setName('');
            setDescription('');
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
            <div className="bg-neutral-800 rounded-lg shadow-xl w-full max-w-md">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold text-white">Neue Klasse anlegen</h3>
                        <button onClick={onClose}>
                            <IconX className="size-6 text-white" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="className" className="block text-sm font-medium text-white mb-1">
                                    Name der Klasse
                                </label>
                                <input
                                    type="text"
                                    id="className"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    required
                                    className="w-full px-3 py-2 bg-neutral-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-white"
                                />
                            </div>
                            <div>
                                <label htmlFor="classDesc" className="block text-sm font-medium text-white mb-1">
                                    Beschreibung <span className="text-gray-400">(optional)</span>
                                </label>
                                <input
                                    type="text"
                                    id="classDesc"
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                    placeholder="(optional)"
                                    className="w-full px-3 py-2 bg-neutral-700 text-white placeholder:text-neutral-400 rounded-md focus:outline-none focus:ring-2 focus:ring-white"
                                />
                            </div>
                            {error && <p className="text-red-400 text-sm">{error}</p>}
                        </div>

                        <div className="mt-6 flex justify-end space-x-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-sm font-medium text-gray-300 bg-neutral-600 rounded-md hover:bg-neutral-500"
                            >
                                Abbrechen
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50"
                            >
                                {loading ? 'Wird gespeichert…' : 'Anlegen'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ModalAddClass;