"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { IconUserCircle, IconMoon, IconSun, IconBug } from '@tabler/icons-react';
import { getBackendHost } from '@/actions/getBackendHost';
import { useDarkMode } from '@/app/hooks/useDarkMode';

const SQL_INJECTION_DEMO = "' OR '1'='1' --";

export default function Login() {
    const router = useRouter();
    const { darkMode, toggleDarkMode } = useDarkMode();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            const backendHost = await getBackendHost();
            const res = await fetch(`${backendHost}/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });
            const data = await res.json();
            if (!res.ok) { setError(data?.detail ?? "Login fehlgeschlagen"); return; }
            localStorage.setItem("access_token", data.access_token);
            localStorage.setItem("username", data.username);
            localStorage.setItem("role", data.role);
            router.push("/");
        } catch {
            setError("Server nicht erreichbar");
        } finally {
            setLoading(false);
        }
    }

    function handleSqlDemo() {
        setUsername(SQL_INJECTION_DEMO);
        setPassword('anything');
        setError('');
    }

    return (
        <div className='flex flex-col flex-1 items-center justify-center gap-4 bg-background min-h-screen'>
            <div className='fixed top-4 right-4'>
                <button onClick={toggleDarkMode}
                    className='flex items-center justify-center size-9 rounded-full bg-primary-2 text-white hover:bg-primary-3-hover transition-colors'
                    title={darkMode ? 'Light Mode' : 'Dark Mode'}>
                    {darkMode ? <IconSun className='size-5' /> : <IconMoon className='size-5' />}
                </button>
            </div>

            <form onSubmit={handleSubmit}
                className='bg-card text-foreground border border-border rounded-2xl p-20 flex flex-col items-center gap-4'>
                <IconUserCircle className='size-8 text-primary-2' />
                <h1 className='font-bold text-3xl'>Login</h1>
                <input type='text' placeholder='Benutzername' value={username} onChange={e => setUsername(e.target.value)}
                    className='bg-input border border-border text-foreground placeholder:text-foreground-muted rounded px-4 py-2 w-full outline-none focus:ring-2 focus:ring-ring' />
                <input type='password' placeholder='Passwort' value={password} onChange={e => setPassword(e.target.value)}
                    className='bg-input border border-border text-foreground placeholder:text-foreground-muted rounded px-4 py-2 w-full outline-none focus:ring-2 focus:ring-ring' />
                {error && <p className='text-red-500 text-sm'>{error}</p>}
                <button type="submit" disabled={loading}
                    className='bg-primary-2 text-white rounded px-24 py-2 w-full hover:bg-primary-3-hover disabled:opacity-50 transition-colors'>
                    {loading ? "Anmelden..." : "Anmelden"}
                </button>

                {/* Demo-Angriff */}
                <div className='w-full border-t border-border pt-4 mt-2'>
                    <p className='text-xs text-foreground-muted mb-2 text-center'>Demo-Angriff</p>
                    <button
                        type='button'
                        onClick={handleSqlDemo}
                        className='flex items-center justify-center gap-2 w-full border border-red-500/40 text-red-400 rounded px-4 py-2 text-sm hover:bg-red-500/10 transition-colors'>
                        <IconBug className='size-4' />
                        SQL-Injection simulieren
                    </button>
                </div>
            </form>
        </div>
    );
}