import { getRaffleStats, getUsers } from '@/lib/data';
import { Roulette } from '@/components/roulette';
import { UserTable } from '@/components/user-table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RouletteWheelIcon } from '@/components/icons';
import { ResetButton } from '@/components/reset-button';
import { Trophy } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const users = await getUsers();
  const { totalRaffles } = await getRaffleStats();
  const userNames = users.map((user) => user.name);

  return (
    <div className="container mx-auto py-8">
      <div className="grid gap-8 lg:grid-cols-5">
        
        <div className="lg:col-span-3">
            <UserTable users={users} />
        </div>

        <div className="lg:col-span-2">
            <Card className="shadow-lg border-primary/20 sticky top-20">
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <RouletteWheelIcon className="w-8 h-8 text-primary" />
                        <CardTitle className="font-headline text-3xl">Roleta da Sorte</CardTitle>
                    </div>
                    <CardDescription>Gire a roleta para selecionar um vencedor aleatório.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Roulette participants={userNames} />
                    <div className="mt-8 flex flex-col items-center gap-4">
                      <ResetButton />
                       <div className="flex items-center gap-2 text-lg font-semibold text-muted-foreground">
                          <Trophy className="w-6 h-6 text-accent"/>
                          <span>Sorteios Realizados: {totalRaffles}</span>
                       </div>
                    </div>
                </CardContent>
            </Card>
        </div>

      </div>
    </div>
  );
}
