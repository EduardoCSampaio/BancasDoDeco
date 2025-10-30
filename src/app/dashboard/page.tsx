import { getUsers } from '@/lib/data';
import { UserTable } from '@/components/user-table';
import { ResetButton } from '@/components/reset-button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Users } from 'lucide-react';


export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const users = await getUsers();

  return (
    <Card className="shadow-lg border-primary/20 bg-card/80 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
            <div className='flex items-center gap-3'>
                <Users className="w-6 h-6 text-primary" />
                <CardTitle className="font-headline text-3xl">Usuários Cadastrados</CardTitle>
            </div>
          <ResetButton />
        </div>
        <CardDescription>
          Acompanhe e gerencie todos os participantes inscritos no sorteio.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <UserTable users={users} />
      </CardContent>
    </Card>
  );
}
