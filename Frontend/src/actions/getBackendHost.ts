'use server';

export async function getBackendHost() {
    return process.env.BACKEND_HOST ?? process.env.NEXT_PUBLIC_BACKEND_HOST ?? 'http://localhost:8000';
}
