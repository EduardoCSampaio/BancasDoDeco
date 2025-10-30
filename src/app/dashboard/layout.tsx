import type { Metadata } from 'next';

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
    <div className="bg-gradient-to-br from-background via-secondary to-background">
      {children}
    </div>
  );
}
