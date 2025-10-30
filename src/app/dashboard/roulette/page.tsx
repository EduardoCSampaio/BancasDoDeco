import { getRaffleStats, getUsers } from '@/lib/data';
import { Roulette } from '@/components/roulette';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Gift, Trophy } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function RoulettePage() {
  const users = await getUsers();
  const { totalRaffles } = await getRaffleStats();

  return (
    <div className="flex justify-center">
        <Card className="shadow-lg border-primary/20 w-full max-w-2xl bg-card/80 backdrop-blur-sm">
            <CardHeader>
                <div className="flex items-center gap-3">
                    <Gift className="w-8 h-8 text-primary" />
                    <CardTitle className="font-headline text-3xl">Roleta da Sorte</CardTitle>
                </div>
                <CardDescription>Gire a roleta para selecionar um vencedor aleatório.</CardDescription>
            </CardHeader>
            <CardContent>
                <Roulette participants={users} />
                <div className="mt-8 flex flex-col items-center gap-4">
                   <div className="flex items-center gap-2 text-lg font-semibold text-muted-foreground">
                      <Trophy className="w-6 h-6 text-accent"/>
                      <span>Sorteios Realizados: {totalRaffles}</span>
                   </div>
                </div>
            </CardContent>
        </Card>
    </div>
  );
}
