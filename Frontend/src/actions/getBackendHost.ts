'use server';

export async function getBackendHost() {
    return process.env.BACKEND_HOST;
}
