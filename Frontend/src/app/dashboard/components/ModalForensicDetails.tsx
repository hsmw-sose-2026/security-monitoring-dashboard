'use client';

import {IconArrowDown, IconCheck, IconX} from '@tabler/icons-react';
import {useState} from 'react';
import type {ForensicEvent} from '../forensic/ForensicEvent';
import {MlLabelBadge, SeverityBadge} from '../forensic/ForensicEvent';

interface ModalForensicDetailsProps {
    event: ForensicEvent;
    onClose: () => void;
}

const STEP_LABELS = ['Schritte', 'Ergebnis', 'Erklärung'] as const;

export default function ModalForensicDetails({event, onClose}: ModalForensicDetailsProps) {
    const [step, setStep] = useState(0);

    const goTo = (i: number) => setStep(Math.min(Math.max(i, 0), STEP_LABELS.length - 1));

    return (
        <div className='fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4' onClick={onClose}>
            <div className='bg-neutral-900 border border-neutral-700 rounded-2xl w-full max-w-2xl h-[85vh] flex flex-col' onClick={(e) => e.stopPropagation()}>
                {/* Header ----------------------------------------------------------------*/}
                <div className='flex items-start justify-between p-5 border-b border-neutral-700 shrink-0'>
                    <div>
                        <h2 className='text-lg font-bold text-white'>Event #{event.event_id}</h2>
                        <p className='text-xs text-gray-400 font-mono mt-1'>
                            {event.timestamp} · {event.source_ip}
                        </p>
                    </div>
                    <button onClick={onClose} className='text-gray-400 hover:text-white transition-colors'>
                        <IconX className='size-5' />
                    </button>
                </div>

                {/* Body----------------------------------------------------------------------- */}
                <div className='p-5 overflow-y-auto flex-1'>
                    {/* Schritt 1 – Dekodierungs Schritte ---------------------------------------*/}
                    {step === 0 && (
                        <div className='flex flex-col gap-5'>
                            <div>
                                <p className='text-xs font-semibold text-gray-400 uppercase mb-1'>Original-Payload</p>
                                <pre className='text-sm font-mono text-gray-200 bg-neutral-800 border border-neutral-700 rounded-lg p-3 overflow-x-auto whitespace-pre-wrap break-all'>
                                    {event.original_payload}
                                </pre>
                            </div>

                            <div>
                                <p className='text-xs font-semibold text-gray-400 uppercase mb-2'>Deobfuskierungs-Kette</p>
                                <div className='flex flex-col gap-1'>
                                    {event.decode_steps.map((decodeStep, i) => (
                                        <div key={`${decodeStep.layer}-${i}`}>
                                            <div
                                                className={`border rounded-lg p-3 ${decodeStep.changed ? 'border-neutral-700 bg-neutral-800' : 'border-neutral-800 bg-neutral-900/50'}`}
                                            >
                                                <div className='flex items-center justify-between mb-1'>
                                                    <span className='text-xs font-mono font-semibold text-gray-300'>{decodeStep.layer}</span>
                                                    {!decodeStep.changed && <span className='text-[10px] text-gray-500 italic'>keine Änderung</span>}
                                                </div>
                                                <pre className='text-sm font-mono text-gray-300 overflow-x-auto whitespace-pre-wrap break-all'>
                                                    {decodeStep.output}
                                                </pre>
                                            </div>
                                            {i < event.decode_steps.length - 1 && (
                                                <div className='flex justify-center py-1'>
                                                    <IconArrowDown className='size-4 text-gray-600' />
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Schritt 2 – Ergebnis -------------------------------------------------------------------*/}
                    {step === 1 && (
                        <div className='flex flex-col gap-5'>
                            <div>
                                <p className='text-xs font-semibold text-gray-400 uppercase mb-1'>Final dekodiert</p>
                                <pre className='text-sm font-mono text-red-300 bg-red-950/30 border border-red-900/50 rounded-lg p-3 overflow-x-auto whitespace-pre-wrap break-all'>
                                    {event.final_decoded}
                                </pre>
                            </div>

                            <div className='grid grid-cols-3 gap-3'>
                                <div className='bg-neutral-800 border border-neutral-700 rounded-lg p-3 flex flex-col items-center gap-1.5'>
                                    <p className='text-[10px] text-gray-500 uppercase'>ML-Label</p>
                                    <MlLabelBadge label={event.ml_label} />
                                </div>
                                <div className='bg-neutral-800 border border-neutral-700 rounded-lg p-3 flex flex-col items-center gap-1'>
                                    <p className='text-[10px] text-gray-500 uppercase'>Confidence</p>
                                    <p className='text-lg font-mono text-white'>{Math.round(event.ml_confidence * 100)}%</p>
                                </div>
                                <div className='bg-neutral-800 border border-neutral-700 rounded-lg p-3 flex flex-col items-center gap-1'>
                                    <p className='text-[10px] text-gray-500 uppercase'>P(malicious)</p>
                                    <p className='text-lg font-mono text-white'>{Math.round(event.p_malicious * 100)}%</p>
                                </div>
                            </div>

                            <div className='flex items-center gap-2 text-xs'>
                                <span className='font-semibold text-gray-400 uppercase'>Severity:</span>
                                <SeverityBadge severity={event.severity} />
                                <span className='font-semibold text-gray-400 uppercase ml-4'>Regex-Treffer:</span>
                                <span className={event.regex_match ? 'text-green-400' : 'text-gray-500'}>{event.regex_match ? 'Ja' : 'Nein'}</span>
                            </div>
                        </div>
                    )}

                    {/* Schritt 3 – Erklärung -------------------------------------------------------------------*/}
                    {step === 2 && (
                        <div>
                            <p className='text-xs font-semibold text-gray-400 uppercase mb-2'>Erklärung</p>
                            <p className='text-sm text-gray-300 bg-neutral-800 border border-neutral-700 rounded-lg p-4 leading-relaxed'>{event.explanation}</p>
                        </div>
                    )}
                </div>

                {/* Navigation + Progress Stepper -------------------------------------------------------------------*/}
                <div className='border-t border-neutral-700 p-5 shrink-0 flex justify-center'>
                    <ol className='flex items-start'>
                        {STEP_LABELS.map((label, i) => {
                            const completed = i < step;
                            const active = i === step;
                            const isLast = i === STEP_LABELS.length - 1;

                            return (
                                <li key={label} className='flex items-start'>
                                    {/* Circle + label  */}
                                    <div className='flex flex-col items-center w-20'>
                                        <button
                                            type='button'
                                            onClick={() => goTo(i)}
                                            className={`flex items-center justify-center w-10 h-10 rounded-full border-2 shrink-0 transition-colors cursor-pointer
                                                ${
                                                    completed
                                                        ? 'bg-blue-900/40 border-blue-500 text-blue-400'
                                                        : active
                                                          ? 'bg-neutral-800 border-blue-500 text-blue-400'
                                                          : 'bg-neutral-800 border-neutral-700 text-gray-500'
                                                }
                                            `}
                                        >
                                            {completed ? <IconCheck className='size-5' /> : <span className='text-sm font-semibold'>{i + 1}</span>}
                                        </button>
                                        <span
                                            className={`text-[11px] text-center mt-1.5 leading-tight ${active || completed ? 'text-white' : 'text-gray-500'}`}
                                        >
                                            {label}
                                        </span>
                                    </div>
                                    {/* Verbindungsleise */}
                                    {!isLast && (
                                        <div
                                            className={`w-30 h-1 rounded-full shrink-0 self-start mt-5 -translate-y-1/2 ${completed ? 'bg-blue-500' : 'bg-neutral-700'}`}
                                        />
                                    )}
                                </li>
                            );
                        })}
                    </ol>
                </div>
            </div>
        </div>
    );
}
