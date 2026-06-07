'use client';

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

import {IconHome, IconSearch, IconCloud, IconLogout} from '@tabler/icons-react';

// Importe: Hier werden die notwendigen React-Hooks, Icons und Next.js-Komponenten importiert
import { useRef, useState, useCallback } from 'react';
import { IconCloud, IconSearch, IconLogout, IconX, IconUpload } from '@tabler/icons-react';

import Link from 'next/link';


export default function Upload() {
    const pathname = usePathname();
    return (
        <>
        {/* Header------------------------------------------------------------------------ */}

            <header className='fixed top-0 left-0 right-0 z-50 h-20 border-b border-gray-300 bg-white shadow-sm'>
                <div className='flex items-center justify-between h-full px-4 md:px-6'>
                    {/* Logo und Firma */}
                    <div className='flex items-center gap-3'>
                        <IconCloud className='size-8 text-blue-500'/>
                        <h1 className='text-2xl text-blue-500 font-bold'>Firmenwebsite</h1>
                    </div>
                    
                    {/* Suchleiste  */}
                    <div className='flex-1 max-w-2xl mx-8'>
                        <div className='flex items-center gap-2 border border-gray-300 rounded-full px-4 py-2 bg-white shadow-sm'>
                            <IconSearch className='size-5 text-blue-500' />
                            <input type='text' placeholder='Suche ...' className='outline-none w-full text-sm'/>
                        </div>
                    </div>
                    
                    {/* Logout Button */}
                    <div className='flex items-center'>
                        <Link 
                            href='/login' 
                            className='flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600 transition-colors min-w-max'>
                            <IconLogout className='size-4' />
                            <span className='text-sm font-medium'>Logout</span>
                        </Link>
                    </div>
                </div>
            </header>

        {/* Main Container-------------------------------------------------------------- */}

            <div className='flex pt-20'>

                {/* Navigation Sidebar --------------------------------------------------*/}

                <div className='fixed left-0 top-20 h-screen w-45 bg-white p-4 flex flex-col gap-2 z-40'>
                    <Link href='/' className={clsx('flex items-center gap-2 rounded-2xl px-6 py-4 w-full', { 
                        'bg-blue-400 text-white': pathname === '/',
                        'bg-blue-500 text-white hover:bg-blue-600': pathname !== '/'
                     })}>
                        <span>Startseite</span>
                    </Link>
                    <Link href='/upload' className={clsx('flex items-center gap-2 rounded-2xl px-6 py-4 w-full', { 
                        'bg-blue-400 text-white': pathname === '/upload',
                        'bg-blue-500 text-white hover:bg-blue-600': pathname !== '/upload' })}>
                        <span>Datei Upload</span>
                    </Link>
                    <Link href='/contact' className={clsx('flex items-center gap-2 rounded-2xl px-6 py-4 w-full', { 
                        'bg-blue-400 text-white': pathname === '/contact',
                        'bg-blue-500 text-white hover:bg-blue-600': pathname !== '/contact' })}>
                        <span>Kontakt</span>
                    </Link>  

                    {/* Impressum */}
                    <Link href='/impressum' className='fixed bottom-2 gap-2 text-blue-500 hover:text-blue-600 p-4'>
                        <span>Impressum</span>
                    </Link>
                </div>

                {/* Upload Formular ------------------------------------------------ */}
                
                <div className='flex-1 ml-45 p-4 bg-gray-100 min-h-screen'>
                    <div className='flex flex-col flex-1 items-center justify-center gap-4'>
                        <div className='bg-white rounded-lg mt-10 p-20 flex flex-col items-center gap-4'>
                            <h1 className='font-bold text-3xl'>Datei hochladen</h1>
>>>>>>> origin/integration-test
=======
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
>>>>>>> origin/integration-test

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
}