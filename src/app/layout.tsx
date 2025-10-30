import type { Metadata } from 'next';
import './globals.css';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Toaster } from '@/components/ui/toaster';
import { Crown } from 'lucide-react';
import { Inter, Playfair_Display } from 'next/font/google';
import { FirebaseClientProvider } from '@/firebase/client-provider';

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
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        className={cn(
          'min-h-screen bg-background font-body antialiased',
          inter.variable,
          playfairDisplay.variable
        )}
      >
        <FirebaseClientProvider>
          <div className="relative flex min-h-screen flex-col">
            <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <div className="container flex h-16 items-center">
                <Link href="/" className="mr-6 flex items-center space-x-2">
                  <Crown className="h-8 w-8 text-accent" />
                  <span className="font-headline text-xl font-bold sm:inline-block">
                    Sorteio VIP
                  </span>
                </Link>
              </div>
            </header>
            <main className="flex-1">{children}</main>
          </div>
          <Toaster />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
