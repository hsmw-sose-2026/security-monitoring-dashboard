"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {IconUserCircle} from '@tabler/icons-react';

export default function Login() {
    const router = useRouter();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const apiBase = process.env.NEXT_PUBLIC_BACKEND_HOST ?? "http://localhost:8000";

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${apiBase}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.detail ?? "Login fehlgeschlagen");
        return;
      }

      // Optional für Demo
      localStorage.setItem("username", data.username);
      localStorage.setItem("role", data.role);

      // Weiterleitung
      if (data.role === "admin") router.push("/dashboard");
      else router.push("/");
    } catch {
      setError("Server nicht erreichbar");
    } finally {
      setLoading(false);
    }
  }
    

    return (
        <div className='flex flex-col flex-1 items-center justify-center gap-4'>
            <form onSubmit={handleSubmit} className='border-black border-2 rounded-lg p-20 flex flex-col items-center gap-4'>
                <IconUserCircle className='size-8' />
                <h1 className='font-bold text-3xl'>Login</h1>
                <input type='text' placeholder='Benutzername' className='border border-gray-300 rounded px-4 py-2 w-full' value={username} onChange={(e) => setUsername(e.target.value)} />
                <input type='password' placeholder='Passwort' className='border border-gray-300 rounded px-4 py-2 w-full' value={password} onChange={(e) => setPassword(e.target.value)} />
                
                {error && <p className='text-red-500'>{error}</p>}
                <button type="submit" disabled={loading} className='bg-blue-500 text-white rounded px-24 py-2 w-full hover:bg-blue-600'>{loading ? "Anmelden..." : "Anmelden"}</button>
           </form>
        </div>
    );
}
    