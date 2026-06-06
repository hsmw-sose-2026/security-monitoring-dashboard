'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import { IconCloud, IconLogout, IconX, IconUpload, IconMoon, IconSun, IconHome, IconMail, IconBug } from '@tabler/icons-react';
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
    const { darkMode, toggleDarkMode } = useDarkMode();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);
    const [uploadStatus, setUploadStatus] = useState<{ message: string; type: 'success' | 'error' | '' }>({ message: '', type: '' });
    const [uploading, setUploading] = useState(false);

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
            if (rejected.length > 0) parts.push(`Abgelehnt – ${rejected.map(r => `${r.original_filename}: ${r.reason ?? 'Dateiendung nicht erlaubt'}`).join('; ')}`);
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

    useEffect(() => {
        const role = localStorage.getItem("role");
        if (role !== "user" && role !== "admin") {
            router.replace("/login");
        }
    }, [router]);

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
}