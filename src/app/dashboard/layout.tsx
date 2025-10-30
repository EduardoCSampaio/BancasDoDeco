import type { Metadata } from 'next';
import { Nav } from './_components/nav';

export const metadata: Metadata = {
  title: 'Painel do Admin',
  description: 'Gerencie participantes e escolha os vencedores.',
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-gradient-to-b from-background to-secondary/40 min-h-screen">
      <div className="container mx-auto py-8">
        <div className="flex flex-col items-center justify-center text-center mb-12">
            <h1 className="text-5xl font-bold font-headline text-primary">Painel do Sorteio</h1>
            <p className="text-lg text-muted-foreground mt-2">Gerencie os participantes e realize os sorteios.</p>
        </div>
        <Nav />
        <main className="mt-8">{children}</main>
      </div>
    </div>
  );
}
