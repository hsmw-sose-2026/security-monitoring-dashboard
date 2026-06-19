import type {Metadata} from 'next';
import {Geist, JetBrains_Mono} from 'next/font/google';
import {Toaster} from '@/components/ui/sonner';
import {TooltipProvider} from '@/components/ui/tooltip';
import './globals.css';

const geistSans = Geist({
    variable: '--font-geist-sans',
    subsets: ['latin'],
});

const jbMono = JetBrains_Mono({
    variable: '--font-jb-mono',
    subsets: ['latin'],
});

export const metadata: Metadata = {
    title: 'Firmenwebsite – Security Monitoring Demo',
    description: 'Demo-Anwendung für das Security-Monitoring-Dashboard. Enthält Login, Kontaktformular, Datei-Upload und Suche als Angriffsflächen.',
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang='de' className={`${geistSans.variable} ${jbMono.variable} font-sans h-full antialiased bg-background text-foreground`}>
            <body className='min-h-full flex flex-col'>
                <Toaster
                    position='top-right'
                    duration={5000}
                    richColors
                    closeButton
                    toastOptions={{
                        className:
                            'rounded-2xl! bg-neutral-900! shadow-[0_0.5rem_2rem_#0A0A0A64]! border-2! pointer-events-auto! text-base! **:font-semibold! w-max! min-w-[var(--width)]',
                        classNames: {
                            success: 'border-emerald-400! text-emerald-400!',
                            info: 'border-blue-400! text-blue-400!',
                            warning: 'border-yellow-400! text-yellow-400!',
                            error: 'border-red-400! text-red-400!',
                            description: 'text-sm! opacity-80',
                        },
                    }}
                    expand
                    visibleToasts={10}
                />
                <TooltipProvider>{children}</TooltipProvider>
            </body>
        </html>
    );
}
