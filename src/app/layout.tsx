

import type { Metadata } from 'next';
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';
import { Crown } from 'lucide-react';
import { Inter, Playfair_Display } from 'next/font/google';
import { FirebaseClientProvider } from '@/firebase';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair-display',
});

export const metadata: Metadata = {
  title: 'Inscrição Sorteio',
  description: 'Cadastro de usuários para nosso clube exclusivo.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const doveFavicon = `data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🕊️</text></svg>`;

  return (
    <html lang="pt-BR" suppressHydrationWarning>
       <head>
        <link rel="icon" href={doveFavicon} />
      </head>
      <body
        className={cn(
          'min-h-screen bg-background font-body antialiased',
          inter.variable,
          playfairDisplay.variable
        )}
      >
        <FirebaseClientProvider>
          <div className="relative flex min-h-screen flex-col">
            <main className="flex-1">{children}</main>
          </div>
          <Toaster />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
