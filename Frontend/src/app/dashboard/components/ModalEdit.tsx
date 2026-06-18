<<<<<<< HEAD
import { useState } from 'react';
import { IconX} from '@tabler/icons-react';

interface FormData {
  field1: string;
  field2: string;
  field3: string;
  field4: string;
  field5: string;
  field6: boolean;
  field7: string;
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const Modal = ({ isOpen, onClose }: ModalProps) => {
  const [formData, setFormData] = useState<FormData>({
    field1: '',
    field2: '',
    field3: '',
    field4: '',
    field5: 'low',
    field6: true,
    field7: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement | HTMLSelectElement;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Hier kannst du die Daten als JSON an deine API senden
    const jsonData = {
      field1: formData.field1,
      field2: formData.field2,
      field3: formData.field3,
      field4: formData.field4,
      field5: formData.field5,
      field6: formData.field6,
      field7: formData.field7
    };

    console.log('JSON Daten:', jsonData);
    // API-Aufruf hier einfügen:
    // fetch('/api/endpoint', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(jsonData)
    // });
    
    // Zurücksetzen und Modal schließen
    setFormData({
      field1: '',
      field2: '',
      field3: '',
      field4: '',
      field5: 'low',
      field6: true,
      field7: ''
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-neutral-900 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-neutral-800 rounded-lg shadow-xl w-full max-w-md">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-white">Regel bearbeiten</h3>
            <button 
              onClick={onClose}
              className=""
            >
              <IconX className="size-6 text-white" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="field1" className="block text-sm font-medium text-white mb-1">
                  Name der Regel
                </label>
                <input
                  type="text"
                  id="field1"
                  name="field1"
                  value={formData.field1}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-neutral-700 text-white placeholder:text-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-white"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="field2" className="block text-sm font-medium text-white mb-1">
                  Event-Type
                </label>
                <input
                  type="text"
                  id="field2"
                  name="field2"
                  value={formData.field2}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-neutral-700 text-white placeholder:text-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-white"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="field3" className="block text-sm font-medium text-white mb-1">
                  Target
                </label>
                <input
                  type="text"
                  id="field3"
                  name="field3"
                  value={formData.field3}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-neutral-700 text-white placeholder:text-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-white"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="field4" className="block text-sm font-medium text-white mb-1">
                  Regex
                </label>
                <input
                  type="text"
                  id="field4"
                  name="field4"
                  value={formData.field4}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-neutral-700 text-white placeholder:text-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-white"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="field5" className="block text-sm font-medium text-white mb-1">
                  Severity
                </label>
                <select
                  id="field5"
                  name="field5"
                  value={formData.field5}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-neutral-700 text-white placeholder:text-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-white"
                  required
                >
                  <option value="low" className="text-green-400">Low</option>
                  <option value="medium" className="text-yellow-400">Medium</option>
                  <option value="high" className="text-orange-400">High</option>
                  <option value="critical" className="text-red-400">Critical</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="field6" className="block text-sm font-medium text-white mb-1">
                  Enabled
                </label>
                <div className="flex items-center gap-2 mb-2 ml-2">
                    <input
                        type="checkbox"
                        id="field6"
                        name="field6"
                        checked={formData.field6}
                        onChange={handleInputChange}
                        className="mr-2 h-6 w-6"
                    />
                    <span className="text-sm text-white">Aktivieren</span>
                </div>
              </div>
              
              <div>
                <label htmlFor="field7" className="block text-sm font-medium text-white mb-1">
                  Beschreibung
                </label>
                <input
                  type="text"
                  id="field7"
                  name="field7"
                  value={formData.field7}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-neutral-700 text-white placeholder:text-neutral-400 rounded-md focus:outline-none focus:ring-2 focus:ring-white"
                  placeholder='(optional)' 
                />
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Abbrechen
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Speichern
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Modal;
=======
'use client';

import { useState, useEffect } from 'react';
import { IconX } from '@tabler/icons-react';
import { getBackendHost } from '@/actions/getBackendHost';
import { getAuthHeaders } from '@/lib/dashboard';

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
    rule: Rule | null;
    onUpdated: (updated: Rule) => void;
}

const ModalEdit = ({ isOpen, onClose, rule, onUpdated }: ModalProps) => {
    const [name, setName] = useState('');
    const [eventType, setEventType] = useState('');
    const [target, setTarget] = useState('');
    const [regex, setRegex] = useState('');
    const [severity, setSeverity] = useState<Rule['severity']>('low');
    const [enabled, setEnabled] = useState(true);
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Felder mit den Daten der ausgewählten Regel befüllen
    useEffect(() => {
        if (rule) {
            setName(rule.name);
            setEventType(rule.eventType);
            setTarget(rule.target);
            setRegex(rule.regex);
            setSeverity(rule.severity);
            setEnabled(rule.enabled);
            setDescription(rule.description);
        }
    }, [rule]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!rule) return;
        setLoading(true);
        setError(null);

        const payload = {
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
            const res = await fetch(`${backendHost}/rules/${rule.id}`, {
                method: 'PATCH',
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

            const updated: Rule = await res.json();
            onUpdated(updated);
            onClose();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : String(err));
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen || !rule) return null;

    return (
        <div className="fixed inset-0 bg-neutral-900 bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-neutral-800 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold text-white">Regel bearbeiten</h3>
                        <button onClick={onClose}>
                            <IconX className="size-6 text-white" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-white mb-1">Name der Regel</label>
                                <input type="text" required value={name} onChange={e => setName(e.target.value)}
                                    className="w-full px-3 py-2 bg-neutral-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-white" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-white mb-1">Event-Type</label>
                                <input type="text" required value={eventType} onChange={e => setEventType(e.target.value)}
                                    className="w-full px-3 py-2 bg-neutral-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-white font-mono" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-white mb-1">Target</label>
                                <input type="text" required value={target} onChange={e => setTarget(e.target.value)}
                                    className="w-full px-3 py-2 bg-neutral-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-white" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-white mb-1">Regex</label>
                                <input type="text" required value={regex} onChange={e => setRegex(e.target.value)}
                                    className="w-full px-3 py-2 bg-neutral-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-white font-mono" />
                            </div>
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
                            <div className="flex items-center gap-3">
                                <input type="checkbox" id="editEnabled" checked={enabled} onChange={e => setEnabled(e.target.checked)}
                                    className="h-5 w-5 accent-green-400" />
                                <label htmlFor="editEnabled" className="text-sm font-medium text-white cursor-pointer">Aktivieren</label>
                            </div>
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

export default ModalEdit;
>>>>>>> origin/integration-test
