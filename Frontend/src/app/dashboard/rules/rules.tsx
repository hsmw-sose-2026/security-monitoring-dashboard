'use client';

import { IconPlus, IconArrowNarrowLeft, IconChevronDown, IconChevronRight } from '@tabler/icons-react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { getBackendHost } from '@/actions/getBackendHost';
import ModalAddClass from '../components/ModalAddClass';
import ModalAddRule from '../components/ModalAddRule';
import ModalEdit from '../components/ModalEdit';

// ─── Typen ────────────────────────────────────────────────────────────────────

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

interface RuleClass {
    id: number;
    name: string;
    description: string;
    rules: Rule[];
}

// Selektion: Klassen per classId, Regeln per ruleId
interface Selection {
    classIds: number[];
    ruleIds: number[];
}

// ─── Severity Badge ───────────────────────────────────────────────────────────

function SeverityBadge({ severity }: { severity: Rule['severity'] }) {
    const styles: Record<Rule['severity'], string> = {
        critical: 'bg-red-900/60 text-red-400',
        high:     'bg-orange-900/60 text-orange-400',
        medium:   'bg-yellow-900/60 text-yellow-400',
        low:      'bg-neutral-700 text-gray-300',
    };
    return (
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${styles[severity]}`}>
            {severity}
        </span>
    );
}

// ─── Haupt-Komponente ─────────────────────────────────────────────────────────

export default function Rules() {
    const [classes, setClasses] = useState<RuleClass[]>([]);
    const [expanded, setExpanded] = useState<number[]>([]);
    const [selection, setSelection] = useState<Selection>({ classIds: [], ruleIds: [] });

    const [isClassModalOpen, setIsClassModalOpen] = useState(false);
    const [isRuleModalOpen, setIsRuleModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingRule, setEditingRule] = useState<Rule | null>(null);

    // ── Backend-Fetch ─────────────────────────────────────────────────────────

    useEffect(() => {
        const load = async () => {
            try {
                const backendHost = await getBackendHost();
                const res = await fetch('/test-rules.json');
                if (!res.ok) throw new Error(`Fehler ${res.status}`);
                const data: RuleClass[] = await res.json();
                setClasses(data);
                setExpanded(data.map(c => c.id));
            } catch (err: unknown) {
                toast.error('Regeln konnten nicht geladen werden: ' + (err instanceof Error ? err.message : String(err)));
            }
        };
        load();
    }, []);

    // ── Accordion ─────────────────────────────────────────────────────────────

    const toggleExpanded = (id: number) =>
        setExpanded(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

    // ── Selektion ─────────────────────────────────────────────────────────────

    const isClassSelected = (classId: number) => selection.classIds.includes(classId);
    const isRuleSelected  = (ruleId: number)  => selection.ruleIds.includes(ruleId);

    const toggleClass = (cls: RuleClass) => {
        if (isClassSelected(cls.id)) {
            // Klasse und alle ihre Regeln abwählen
            setSelection(prev => ({
                classIds: prev.classIds.filter(id => id !== cls.id),
                ruleIds:  prev.ruleIds.filter(id => !cls.rules.some(r => r.id === id)),
            }));
        } else {
            // Klasse und alle ihre Regeln auswählen
            setSelection(prev => ({
                classIds: [...prev.classIds, cls.id],
                ruleIds:  [...new Set([...prev.ruleIds, ...cls.rules.map(r => r.id)])],
            }));
        }
    };

    const toggleRule = (cls: RuleClass, ruleId: number) => {
        if (isRuleSelected(ruleId)) {
            const newRuleIds = selection.ruleIds.filter(id => id !== ruleId);
            // Wenn keine Regel der Klasse mehr ausgewählt → Klasse abwählen
            const anyLeft = cls.rules.some(r => r.id !== ruleId && newRuleIds.includes(r.id));
            setSelection(prev => ({
                classIds: anyLeft ? prev.classIds : prev.classIds.filter(id => id !== cls.id),
                ruleIds: newRuleIds,
            }));
        } else {
            const newRuleIds = [...selection.ruleIds, ruleId];
            // Wenn alle Regeln der Klasse ausgewählt → Klasse auch auswählen
            const allSelected = cls.rules.every(r => newRuleIds.includes(r.id));
            setSelection(prev => ({
                classIds: allSelected ? [...new Set([...prev.classIds, cls.id])] : prev.classIds,
                ruleIds: newRuleIds,
            }));
        }
    };

    const selectAll = () => setSelection({
        classIds: classes.map(c => c.id),
        ruleIds:  classes.flatMap(c => c.rules.map(r => r.id)),
    });

    const deselectAll = () => setSelection({ classIds: [], ruleIds: [] });

    const totalSelected = selection.classIds.length + selection.ruleIds.length;

    // ── Bearbeiten ────────────────────────────────────────────────────────────

    const openEdit = () => {
        // Genau eine Regel muss ausgewählt sein (keine Klasse)
        if (selection.ruleIds.length !== 1 || selection.classIds.length > 0) {
            toast.error('Bitte genau eine Regel auswählen zum Bearbeiten.');
            return;
        }
        const ruleId = selection.ruleIds[0];
        const rule = classes.flatMap(c => c.rules).find(r => r.id === ruleId) ?? null;
        setEditingRule(rule);
        setIsEditModalOpen(true);
    };

    // ── Löschen ───────────────────────────────────────────────────────────────

    const handleDelete = async () => {
        if (totalSelected === 0) {
            toast.error('Keine Auswahl zum Löschen.');
            return;
        }

        try {
            const backendHost = await getBackendHost();

            // Regeln löschen
            for (const ruleId of selection.ruleIds) {
                const res = await fetch(`${backendHost}/rules/${ruleId}`, { method: 'DELETE' });
                if (!res.ok) throw new Error(`Regel ${ruleId}: Fehler ${res.status}`);
            }
            // Klassen löschen (nur wenn explizit als Klasse gewählt, ohne einzelne Regeln davon)
            for (const classId of selection.classIds) {
                const res = await fetch(`${backendHost}/rules/classes/${classId}`, { method: 'DELETE' });
                if (!res.ok) throw new Error(`Klasse ${classId}: Fehler ${res.status}`);
            }

            // Lokal entfernen
            setClasses(prev => prev
                .filter(c => !selection.classIds.includes(c.id))
                .map(c => ({ ...c, rules: c.rules.filter(r => !selection.ruleIds.includes(r.id)) }))
            );
            setSelection({ classIds: [], ruleIds: [] });
            toast.success('Erfolgreich gelöscht.');
        } catch (err: unknown) {
            toast.error('Löschen fehlgeschlagen: ' + (err instanceof Error ? err.message : String(err)));
        }
    };

    // ── Modal-Callbacks ───────────────────────────────────────────────────────

    const handleClassCreated = (cls: RuleClass) => {
        setClasses(prev => [...prev, cls]);
        setExpanded(prev => [...prev, cls.id]);
        toast.success(`Klasse „${cls.name}" angelegt.`);
    };

    const handleRuleCreated = (classId: number, rule: Rule) => {
        setClasses(prev => prev.map(c =>
            c.id === classId ? { ...c, rules: [...c.rules, rule] } : c
        ));
        toast.success(`Regel „${rule.name}" angelegt.`);
    };

    const handleRuleUpdated = (updated: Rule) => {
        setClasses(prev => prev.map(c => ({
            ...c,
            rules: c.rules.map(r => r.id === updated.id ? updated : r),
        })));
        setSelection({ classIds: [], ruleIds: [] });
        toast.success(`Regel „${updated.name}" aktualisiert.`);
    };

    // ─────────────────────────────────────────────────────────────────────────

    return (
        <>
        <div className='w-full min-h-screen bg-neutral-900 flex flex-col pt-2 gap-4 pb-8'>

            {/* Header */}
            <div className='ml-2 mr-2 bg-neutral-800 p-4 rounded-lg'>
                <div className='flex items-center mb-6'>
                    <Link
                        href='/dashboard'
                        className='flex items-center gap-2 bg-neutral-600 text-white px-4 py-2 rounded-full hover:bg-neutral-700 transition-colors min-w-max'>
                        <IconArrowNarrowLeft className='size-4' />
                        <span className='text-sm font-medium'>Zurück zum Dashboard</span>
                    </Link>
                </div>
                <h1 className='text-3xl font-bold mb-3 text-white'>Regel Verwaltung</h1>
                <p className='text-gray-300'>Regeln sind in Klassen gruppiert. Klappen Sie eine Klasse auf, um die zugehörigen Regeln zu sehen.</p>
            </div>

            {/* Aktionsleiste */}
            <div className='flex gap-2 ml-2 mr-2 flex-wrap items-center'>
                <button
                    onClick={() => setIsClassModalOpen(true)}
                    className='flex items-center gap-1 bg-neutral-600 hover:bg-neutral-500 text-white py-1.5 px-3 rounded-full transition-colors text-xs font-medium'>
                    <IconPlus className='size-3.5' />
                    Neue Klasse
                </button>
                <button
                    onClick={() => setIsRuleModalOpen(true)}
                    disabled={classes.length === 0}
                    className='flex items-center gap-1 bg-green-600 hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed text-white py-1.5 px-3 rounded-full transition-colors text-xs font-medium'>
                    <IconPlus className='size-3.5' />
                    Neue Regel
                </button>

                <div className='w-px h-5 bg-neutral-700 mx-1' />

                <button
                    onClick={openEdit}
                    disabled={selection.ruleIds.length !== 1 || selection.classIds.length > 0}
                    className='bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white py-1.5 px-3 rounded-full transition-colors text-xs font-medium'>
                    Bearbeiten
                </button>
                <button
                    onClick={handleDelete}
                    disabled={totalSelected === 0}
                    className='bg-red-600 hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed text-white py-1.5 px-3 rounded-full transition-colors text-xs font-medium'>
                    Löschen {totalSelected > 0 && `(${totalSelected})`}
                </button>

                <div className='w-px h-5 bg-neutral-700 mx-1' />

                <button onClick={selectAll}
                    className='bg-neutral-700 hover:bg-neutral-600 text-white py-1.5 px-3 rounded-full transition-colors text-xs'>
                    Alle auswählen
                </button>
                <button onClick={deselectAll}
                    className='bg-neutral-700 hover:bg-neutral-600 text-white py-1.5 px-3 rounded-full transition-colors text-xs'>
                    Auswahl aufheben
                </button>
            </div>

            {/* Tabelle */}
            <div className='ml-2 mr-2 border border-neutral-700 rounded-2xl overflow-auto'>
                <table className='w-full'>
                    <thead>
                        <tr className='divide-x border-b border-neutral-700 *:border-neutral-700 *:text-left *:p-4 *:py-2 *:font-semibold bg-neutral-800'>
                            <th className='w-10'></th>
                            <th className='w-8'></th>
                            <th>Name</th>
                            <th>Event-Type</th>
                            <th>Severity</th>
                            <th>Enabled</th>
                        </tr>
                    </thead>
                    <tbody>
                        {classes.map(cls => (
                            <>
                                {/* Klassen-Zeile */}
                                <tr
                                    key={`class-${cls.id}`}
                                    className='divide-x border-b border-neutral-700 *:border-neutral-700 *:p-4 *:py-3 bg-neutral-800/80 hover:bg-neutral-700/60 transition-colors select-none'
                                >
                                    {/* Accordion Toggle */}
                                    <td className='cursor-pointer' onClick={() => toggleExpanded(cls.id)}>
                                        {expanded.includes(cls.id)
                                            ? <IconChevronDown className='size-4 text-gray-400' />
                                            : <IconChevronRight className='size-4 text-gray-400' />
                                        }
                                    </td>
                                    {/* Klassen-Checkbox */}
                                    <td>
                                        <input
                                            type='checkbox'
                                            checked={isClassSelected(cls.id)}
                                            onChange={() => toggleClass(cls)}
                                            className='accent-blue-400 size-4 cursor-pointer'
                                        />
                                    </td>
                                    <td colSpan={3} className='cursor-pointer' onClick={() => toggleExpanded(cls.id)}>
                                        <span className='font-bold text-white'>{cls.name}</span>
                                        {cls.description && (
                                            <span className='ml-3 text-xs text-gray-400'>{cls.description}</span>
                                        )}
                                    </td>
                                    <td>
                                        <span className='text-xs text-gray-400 font-mono'>
                                            {cls.rules.length} Regel{cls.rules.length !== 1 ? 'n' : ''}
                                        </span>
                                    </td>
                                </tr>

                                {/* Regel-Zeilen */}
                                {expanded.includes(cls.id) && cls.rules.map(rule => (
                                    <tr
                                        key={`rule-${rule.id}`}
                                        className={`divide-x border-b border-neutral-700 *:border-neutral-700 *:p-4 *:py-3 last:border-b-0 transition-colors
                                            ${isRuleSelected(rule.id) ? 'bg-blue-950/40' : 'hover:bg-neutral-800/50'}`}
                                    >
                                        <td className='bg-neutral-900/30'></td>
                                        {/* Regel-Checkbox */}
                                        <td>
                                            <input
                                                type='checkbox'
                                                checked={isRuleSelected(rule.id)}
                                                onChange={() => toggleRule(cls, rule.id)}
                                                className='accent-blue-400 size-4 cursor-pointer'
                                            />
                                        </td>
                                        <td>
                                            <div className='flex items-center gap-2 pl-4 border-l-2 border-neutral-600'>
                                                <span className='font-medium text-gray-200'>{rule.name}</span>
                                                {rule.description && (
                                                    <span className='text-xs text-gray-500'>{rule.description}</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className='font-mono text-sm text-gray-300'>{rule.eventType}</td>
                                        <td><SeverityBadge severity={rule.severity} /></td>
                                        <td>
                                            <input
                                                type='checkbox'
                                                checked={rule.enabled}
                                                readOnly
                                                className='accent-green-400 size-4 cursor-default'
                                            />
                                        </td>
                                    </tr>
                                ))}

                                {/* Leere Klasse */}
                                {expanded.includes(cls.id) && cls.rules.length === 0 && (
                                    <tr key={`empty-${cls.id}`} className='border-b border-neutral-700'>
                                        <td colSpan={6} className='p-4 pl-16 text-sm text-gray-500 italic'>
                                            Keine Regeln in dieser Klasse.
                                        </td>
                                    </tr>
                                )}
                            </>
                        ))}

                        {classes.length === 0 && (
                            <tr>
                                <td colSpan={6} className='p-8 text-center text-gray-500 italic'>
                                    Noch keine Klassen angelegt.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>

        {/* Modals */}
        <ModalAddClass
            isOpen={isClassModalOpen}
            onClose={() => setIsClassModalOpen(false)}
            onCreated={handleClassCreated}
        />
        <ModalAddRule
            isOpen={isRuleModalOpen}
            onClose={() => setIsRuleModalOpen(false)}
            classes={classes.map(c => ({ id: c.id, name: c.name }))}
            onCreated={handleRuleCreated}
        />
        <ModalEdit
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            rule={editingRule}
            onUpdated={handleRuleUpdated}
        />
        </>
    );
}