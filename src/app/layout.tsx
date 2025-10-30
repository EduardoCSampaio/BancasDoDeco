import type { Metadata } from 'next';
import './globals.css';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { ChipIcon } from '@/components/icons';
import { Toaster } from '@/components/ui/toaster';

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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Alegreya:ital,wght@0,400..900;1,400..900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className={cn(
          'min-h-screen bg-background font-body antialiased',
          'font-body'
        )}
      >
        <div className="relative flex min-h-screen flex-col">
          <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center">
              <Link href="/" className="mr-6 flex items-center space-x-2">
                <ChipIcon className="h-8 w-8 text-primary" />
                <span className="font-headline text-xl font-bold sm:inline-block">
                  Sorteio VIP
                </span>
              </Link>
            </div>
          </header>
          <main className="flex-1">{children}</main>
        </div>
        <Toaster />
      </body>
    </html>
  );
}
