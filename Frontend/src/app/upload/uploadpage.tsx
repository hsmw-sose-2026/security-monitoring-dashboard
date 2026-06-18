'use client';

<<<<<<< HEAD
// Importe: Hier werden die notwendigen React-Hooks, Icons und Next.js-Komponenten importiert
import { useRef, useState, useCallback } from 'react';
import { IconCloud, IconSearch, IconLogout, IconX, IconUpload } from '@tabler/icons-react';
import Link from 'next/link';

// Interfaces: Definieren die Struktur für Dateien, die hochgeladen werden sollen und bereits gespeicherte Dateien
interface PendingFile {
  file: File;
  id: string;
}

interface SavedFile {
  filename: string;
  originalName: string;
  createdAt: string;
}

// Hilfsfunktion: Formatiert die Dateigröße in lesbare Einheiten (B, KB, MB, GB)
function formatSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

// Hauptfunktion: Die Upload-Komponente, die die gesamte Upload-Logik und UI enthält
export default function Upload() {
  // Refs und State: Verwendet für Datei-Input, Liste der wartenden Dateien, Statusmeldungen und Upload-Zustand
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);
  const [status, setStatus] = useState<{ message: string; type: 'success' | 'error' | '' }>({ message: '', type: '' });
  const [uploading, setUploading] = useState(false);

  // Funktion zum Hinzufügen von Dateien: Fügt neue Dateien zur Liste hinzu, vermeidet Duplikate
  const addFiles = useCallback((files: File[]) => {
    setPendingFiles(prev => {
      const next = [...prev]; // Erstelle eine Kopie der aktuellen Liste
      files.forEach(f => {
        // Prüfe, ob eine Datei mit gleichem Namen und gleicher Größe bereits existiert (vermeidet Duplikate)
        if (!next.find(p => p.file.name === f.name && p.file.size === f.size)) {
          // Füge die neue Datei mit einer eindeutigen ID hinzu (Name-Größe-Zeitstempel)
          next.push({ file: f, id: `${f.name}-${f.size}-${Date.now()}` });
        }
      });
      return next; // Gib die aktualisierte Liste zurück
    });
  }, []);

  // Funktion zum Entfernen einer Datei: Entfernt eine Datei aus der Liste der wartenden Dateien
  const removeFile = (id: string) => {
    setPendingFiles(prev => prev.filter(p => p.id !== id)); // Filtere die Liste, um die Datei mit der gegebenen ID zu entfernen
  };

  // Upload-Handler: Sendet die ausgewählten Dateien an den Server und behandelt Erfolg/Fehler
  const handleUpload = async () => {
    if (pendingFiles.length === 0) return; // Abbruch, wenn keine Dateien ausgewählt sind
    setUploading(true); // Setze Upload-Zustand auf true (deaktiviert Button)
    setStatus({ message: '', type: '' }); // Leere vorherige Statusmeldungen

    const formData = new FormData(); // Erstelle ein FormData-Objekt für den Datei-Upload
    for (const { file } of pendingFiles) formData.append('files', file); // Füge jede Datei zum FormData hinzu

    try {
      // Sende POST-Anfrage an den Server-Endpunkt '/upload' mit den Dateien
      const res = await fetch('/upload', { method: 'POST', body: formData });
      const data = await res.json(); // Parse die JSON-Antwort des Servers
      if (res.ok && data.success) { // Prüfe, ob die Anfrage erfolgreich war und der Server Erfolg signalisiert
        // Erstelle eine Liste der hochgeladenen Dateinamen für die Erfolgsmeldung
        const names = (data.files as SavedFile[]).map(f => f.originalName).join(', ');
        setStatus({ message: `${data.files.length} hochgeladen: ${names}`, type: 'success' }); // Erfolgsmeldung setzen
        setPendingFiles([]); // Leere die Liste der wartenden Dateien
      } else {
        // Setze Fehlermeldung basierend auf Server-Antwort oder Standardfehler
        setStatus({ message: data.error || 'Unbekannter Fehler', type: 'error' });
      }
    } catch (err: unknown) {
      // Behandle Netzwerk- oder andere Fehler
      setStatus({ message: 'Netzwerkfehler: ' + (err instanceof Error ? err.message : String(err)), type: 'error' });
    } finally {
      setUploading(false); // Setze Upload-Zustand zurück auf false (aktiviert Button wieder)
    }
  };

  // JSX-Rendering: Gibt die UI der Upload-Seite zurück
  return (
    <>
      {/* Header-Bereich: Enthält Logo, Suchleiste und Logout-Button */}
      <div className='flex h-20 shrink-0 items-end border border-gray-300 p-4 md:h-20 gap-5'>
        <div className='flex items-center gap-2'>
          <IconCloud className='size-8 text-blue-500' />
          <header className='text-2xl text-blue-500 font-bold'>Firmenwebsite</header>
        </div>

        {/* Suchleiste: Ermöglicht die Suche nach Inhalten */}
        <div className='flex-1 flex justify-center'>
          <div className='flex items-center gap-2 border border-gray-300 rounded-4xl px-4 py-2 w-125'>
            <IconSearch className='size-8 text-blue-500' />
            <input type='text' placeholder='Suche...' className='outline-none w-full' />
          </div>
        </div>

        {/* Logout-Button: Leitet zur Login-Seite weiter */}
        <div className='flex items-center'>
          <Link
            href='/login'
            className='flex items-center gap-2 bg-blue-500 px-6 py-2 rounded-4xl hover:bg-blue-600 transition-colors self-center min-w-max'
          >
            <IconLogout className='size-6 text-white' />
            <span className='text-white'>Logout</span>
          </Link>
        </div>
      </div>

      {/* Haupt-Container: Enthält Navigation und Upload-Bereich */}
      <div className='flex flex-1'>
        {/* Navigation:*/}
        <div className='w-45 h-screen bg-gray-100 p-4 flex flex-col gap-2'>
          <Link href='/' className='flex items-center gap-2 bg-blue-500 text-white hover:bg-blue-600 rounded-2xl px-6 py-4 w-full'>
            <span>Startseite</span>
          </Link>
          <Link href='/upload' className='flex items-center gap-2 bg-blue-500 text-white hover:bg-blue-600 rounded-2xl px-6 py-4 w-full'>
            <span>Datei Upload</span>
          </Link>
          <Link href='/contact' className='flex items-center gap-2 bg-blue-500 text-white hover:bg-blue-600 rounded-2xl px-6 py-4 w-full'>
            <span>Kontakt</span>
          </Link>
        </div>

        {/* Upload-Bereich*/}
        <div className='flex-1 p-8'>
          <div className='flex flex-col items-center justify-center gap-4 max-w-xl mx-auto mt-8'>
            <div className='border-black border-2 rounded-lg p-10 flex flex-col items-center gap-4 w-full'>
              <h1 className='font-bold text-3xl'>Datei hochladen</h1>

              {/* Drop-Zone*/}
              <button
                type='button'
                onClick={() => fileInputRef.current?.click()}
                className='w-full border-2 border-dashed rounded-lg p-10 flex flex-col items-center gap-3 cursor-pointer transition-colors border-gray-300 hover:border-blue-400 hover:bg-gray-50'
              >
                <IconUpload className='size-10 text-gray-400' />
                <p className='text-gray-500 text-sm text-center'>
                  Dateien auswählen
                </p>
                <input
                  ref={fileInputRef}
                  type='file'
                  multiple
                  className='hidden'
                  onChange={e => {
                    if (e.target.files) addFiles([...e.target.files]); // Füge ausgewählten Dateien zur Liste hinzu
                    e.target.value = ''; // Leeret Inputwert -> ernuetes Auswählen derselben datei möglich
                  }}
                />
              </button>

              {/* Dateiliste mit Entfernoption*/}
              {pendingFiles.length > 0 && ( // Zeige die Liste nur an, wenn Dateien vorhanden sind
                <div className='w-full flex flex-col gap-2'>
                  {pendingFiles.map(({ file, id }) => (
                    <div key={id} className='flex items-center gap-3 border border-gray-200 rounded px-3 py-2 bg-gray-50'>
                      <div className='flex-1 min-w-0'>
                        <p className='text-sm font-medium truncate'>{file.name}</p> {/* Dateiname, abgeschnitten bei Überlänge */}
                        <p className='text-xs text-gray-400 font-mono'>{formatSize(file.size)}</p> {/* Formatierte Dateigröße */}
                      </div>
                      <button
                        type='button'
                        onClick={() => removeFile(id)}
                        className='text-gray-400 hover:text-red-500 transition-colors'
                        title='Entfernen'
                      >
                        <IconX className='size-5' />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Upload-Button*/}
              <button
                type='button'
                onClick={handleUpload}
                disabled={pendingFiles.length === 0 || uploading} // Deaktiviert, wenn keine Dateien oder bereits am Hochladen
                className='bg-blue-500 text-white rounded px-24 py-2 w-full hover:bg-blue-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed'
              >
                {uploading ? 'Lädt hoch…' : 'Hochladen'}
              </button>

              {/* Status-Anzeige (Erfolg/Fehler)*/}
              {status.message && (
                <div
                  className={`w-full text-sm px-4 py-2 rounded font-mono
                    ${status.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : ''}
                    ${status.type === 'error'   ? 'bg-red-50   text-red-600   border border-red-200'   : ''}`}
                >
                  {status.message} {/* Anzeige der Statusnachricht */}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
=======
import { useRef, useState, useCallback, useEffect } from 'react';
import { IconCloud, IconLogout, IconX, IconUpload, IconMoon, IconSun, IconHome, IconMail, IconBug, IconSword } from '@tabler/icons-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import clsx from 'clsx';
import { getBackendHost } from '@/actions/getBackendHost';
import SearchBar from '@/components/SearchBar';
import { useDarkMode } from '@/app/hooks/useDarkMode';

interface PendingFile { file: File; id: string; }
interface UploadResponse {
    original_filename: string;
    stored_filename: string;
    file_extension: string;
    status: 'uploaded' | 'rejected';
    reason?: string;
}

// Pfad zur Demo-Datei im public-Ordner
const DEMO_FILE_PATH = '/demo-attack.exe';
const DEMO_FILE_NAME = 'demo-attack.exe';

function formatSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

export default function Upload() {
    const router = useRouter();
    const pathname = usePathname();
    const [isAdmin, setIsAdmin] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const { darkMode, toggleDarkMode } = useDarkMode();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);
    const [uploadStatus, setUploadStatus] = useState<{ message: string; type: 'success' | 'error' | '' }>({ message: '', type: '' });
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        const role = localStorage.getItem("role");
        if (!role) {
            router.replace("/login");
            return;
        }
        setIsAdmin(role === "admin");
        setIsLoading(false);
    }, [router]);

    const addFiles = useCallback((files: File[]) => {
        setPendingFiles(prev => {
            const next = [...prev];
            files.forEach(f => {
                if (!next.find(p => p.file.name === f.name && p.file.size === f.size))
                    next.push({ file: f, id: `${f.name}-${f.size}-${Date.now()}` });
            });
            return next;
        });
    }, []);

    const removeFile = (id: string) => setPendingFiles(prev => prev.filter(p => p.id !== id));

    async function handleDemoAttack() {
        try {
            const res = await fetch(DEMO_FILE_PATH);
            const blob = await res.blob();
            const file = new File([blob], DEMO_FILE_NAME, { type: blob.type || 'application/octet-stream' });
            addFiles([file]);
        } catch {
            setUploadStatus({ message: 'Demo-Datei konnte nicht geladen werden.', type: 'error' });
        }
    }

    const handleUpload = async () => {
        if (pendingFiles.length === 0) return;
        setUploading(true);
        setUploadStatus({ message: '', type: '' });
        const responses: UploadResponse[] = [];
        const errors: string[] = [];
        try {
            const backendHost = await getBackendHost();
            for (const { file } of pendingFiles) {
                const formData = new FormData();
                formData.append('file', file);
                try {
                    const res = await fetch(`${backendHost}/upload`, { method: 'POST', body: formData });
                    const data = await res.json();
                    if (!res.ok) {
                        const detail = Array.isArray(data?.detail)
                            ? data.detail.map((d: { msg?: string }) => d.msg ?? String(d)).join(', ')
                            : (data?.detail ?? data?.error ?? `Fehler ${res.status}`);
                        errors.push(`${file.name}: ${detail}`);
                    } else {
                        responses.push(data as UploadResponse);
                    }
                } catch { errors.push(`${file.name}: Netzwerkfehler`); }
            }
            const uploaded = responses.filter(r => r.status === 'uploaded');
            const rejected = responses.filter(r => r.status === 'rejected');
            const parts: string[] = [];
            if (uploaded.length > 0) parts.push(`${uploaded.length} hochgeladen: ${uploaded.map(r => r.original_filename).join(', ')}`);
            if (rejected.length > 0) parts.push(
                rejected.map(r => {
                    const reason = r.reason === 'extension_blocked' ? 'extension_blocked' : (r.reason ?? 'unbekannt');
                    return `${r.original_filename}: status: rejected | reason: ${reason}`;
                }).join(' | ')
            );
            if (errors.length > 0) parts.push(errors.join('; '));
            if (uploaded.length > 0 && rejected.length === 0 && errors.length === 0) {
                setUploadStatus({ message: parts.join(' | '), type: 'success' });
                setPendingFiles([]);
            } else if (uploaded.length > 0) {
                setUploadStatus({ message: parts.join(' | '), type: 'success' });
                setPendingFiles(prev => prev.filter(p => !uploaded.some(u => u.original_filename === p.file.name)));
            } else {
                setUploadStatus({ message: parts.join(' | '), type: 'error' });
            }
        } finally { setUploading(false); }
    };

    return (
        <>
            <header className='fixed top-0 left-0 right-0 z-50 h-20 border-b border-border bg-background-2 shadow-sm'>
                <div className='flex items-center justify-between h-full px-4 md:px-6'>
                    <div className='flex items-center gap-3'>
                        <IconCloud className='size-8 text-primary-2' />
                        <h1 className='text-2xl text-primary-foreground font-bold'>Firmenwebsite</h1>
                    </div>
                    <SearchBar />
                    <div className='flex items-center gap-3'>
                        <button onClick={toggleDarkMode}
                            className='flex items-center justify-center size-9 rounded-full bg-primary-2 text-white hover:bg-primary-3-hover transition-colors'
                            title={darkMode ? 'Light Mode' : 'Dark Mode'}>
                            {darkMode ? <IconSun className='size-5' /> : <IconMoon className='size-5' />}
                        </button>
                        <Link href='/login'
                            className='flex items-center gap-2 bg-primary-2 text-white px-4 py-2 rounded-full hover:bg-primary-3-hover transition-colors min-w-max'>
                            <IconLogout className='size-4' />
                            <span className='text-sm font-medium'>Logout</span>
                        </Link>
                    </div>
                </div>
            </header>

            <div className='flex pt-20'>
                <div className='fixed left-0 top-20 h-screen w-45 bg-card border-r border-border p-3 flex flex-col gap-2 z-40'>
                    <Link href='/' className={clsx('flex items-center gap-2 rounded-2xl px-4 py-4 w-full text-forefround transition-colors', {
                        'bg-primary text-foreground-2 hover:bg-primary-2-hover': pathname === '/',
                        'bg-primary hover:bg-primary-hover': pathname !== '/',
                    })}>
                        <IconHome className='size-5' />
                        <span>Startseite</span>
                    </Link>
                    <Link href='/upload' className={clsx('flex items-center gap-2 rounded-2xl px-4 py-4 w-full text-forground transition-colors', {
                        'bg-primary text-foreground-2 hover:bg-primary-2-hover': pathname === '/upload',
                        'bg-primary hover:bg-primary-hover': pathname !== '/upload',
                    })}>
                        <IconUpload className='size-5' />
                        <span>Datei Upload</span>
                    </Link>
                    <Link href='/contact' className={clsx('flex items-center gap-2 rounded-2xl px-4 py-4 w-full text-forground transition-colors', {
                        'bg-primary text-foreground-2 hover:bg-primary-2-hover': pathname === '/contact',
                        'bg-primary hover:bg-primary-hover': pathname !== '/contact',
                    })}>
                        <IconMail className='size-5' />
                        <span>Kontakt</span>
                    </Link>
                    {isAdmin && (
                        <Link href='/dashboard' className={clsx('flex items-center gap-2 rounded-2xl px-4 py-4 w-full bg-primary text-foreground hover:bg-primary-hover transition-colors')}>
                            <IconSword className='size-5' />
                            <span>Dashboard</span>
                        </Link>
                    )}
                    <Link href='/impressum' className={clsx('gap-2 fixed bottom-2 rounded-2xl px-4 py-4 text-primary-2 hover:bg-primary-hover transition-colors')}>
                        <span>Impressum</span>
                    </Link>
                </div>

                <div className='flex-1 ml-45 p-4 bg-background min-h-screen'>
                    <div className='flex flex-col items-center justify-center gap-4'>
                        <div className='bg-card text-foreground rounded-2xl mt-20 p-20 flex flex-col items-center gap-4'>
                            <h1 className='font-bold text-3xl'>Datei hochladen</h1>
                            <button type='button' onClick={() => fileInputRef.current?.click()}
                                className='w-full border-2 border-dashed border-border rounded-lg p-10 flex flex-col items-center gap-3 cursor-pointer transition-colors hover:border-primary-2 hover:bg-background-2'>
                                <IconUpload className='size-10 text-foreground-muted' />
                                <p className='text-foreground-muted text-sm text-center'>Dateien auswählen</p>
                                <input ref={fileInputRef} type='file' multiple className='hidden'
                                    onChange={e => { if (e.target.files) addFiles([...e.target.files]); e.target.value = ''; }} />
                            </button>

                            {pendingFiles.length > 0 && (
                                <div className='w-full flex flex-col gap-2'>
                                    {pendingFiles.map(({ file, id }) => (
                                        <div key={id} className='flex items-center gap-3 border border-border rounded px-3 py-2 bg-background-2'>
                                            <div className='flex-1 min-w-0'>
                                                <p className='text-sm font-medium truncate text-foreground'>{file.name}</p>
                                                <p className='text-xs text-foreground-muted font-mono'>{formatSize(file.size)}</p>
                                            </div>
                                            <button type='button' onClick={() => removeFile(id)}
                                                className='text-foreground-muted hover:text-red-500 transition-colors' title='Entfernen'>
                                                <IconX className='size-5' />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <button type='button' onClick={handleUpload}
                                disabled={pendingFiles.length === 0 || uploading}
                                className='bg-primary-2 text-white rounded px-24 py-2 w-full hover:bg-primary-3-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed'>
                                {uploading ? 'Lädt hoch…' : 'Hochladen'}
                            </button>

                            {uploadStatus.message && (
                                <div className={`w-full text-sm px-4 py-2 rounded font-mono
                                    ${uploadStatus.type === 'success' ? 'bg-green-900/30 text-green-400 border border-green-700' : ''}
                                    ${uploadStatus.type === 'error'   ? 'bg-red-900/30 text-red-400 border border-red-700' : ''}`}>
                                    {uploadStatus.message}
                                </div>
                            )}

                            {/* Demo-Angriff */}
                            <div className='w-full border-t border-border pt-4 mt-2'>
                                <p className='text-xs text-foreground-muted mb-2 text-center'>Demo-Angriff</p>
                                <button
                                    type='button'
                                    onClick={handleDemoAttack}
                                    className='flex items-center justify-center gap-2 w-full border border-red-500/40 text-red-400 rounded px-4 py-2 text-sm hover:bg-red-500/10 transition-colors'>
                                    <IconBug className='size-4' />
                                    Schädliche Datei laden ({DEMO_FILE_NAME})
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
>>>>>>> origin/integration-test
}