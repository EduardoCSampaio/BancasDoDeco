

import { getWinners } from '@/lib/data';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Trophy } from 'lucide-react';
import { WinnerStatusSelect } from '@/components/winner-status-select';

export const dynamic = 'force-dynamic';

export default async function WinnersPage() {
  const winners = await getWinners();

  return (
    <Card className="shadow-lg border-primary/20 bg-card/80 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center gap-3">
          <Trophy className="w-6 h-6 text-accent" />
          <CardTitle className="font-headline text-3xl">Galeria de Ganhadores</CardTitle>
        </div>
        <CardDescription>
          Lista de todos os sortudos dos sorteios anteriores e status do pagamento.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96 w-full rounded-md border">
          <Table>
            <TableHeader className="sticky top-0 bg-secondary">
              <TableRow>
                <TableHead className="font-bold">Nome</TableHead>
                <TableHead className="font-bold">CPF</TableHead>
                <TableHead className="font-bold">ID Cassino</TableHead>
                <TableHead className="font-bold">Data do Sorteio</TableHead>
                <TableHead className="font-bold text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {winners.length > 0 ? (
                winners.map((winner) => (
                  <TableRow key={winner.id}>
                    <TableCell className="font-medium">{winner.name}</TableCell>
                    <TableCell>{winner.cpf}</TableCell>
                    <TableCell>{winner.casinoId}</TableCell>
                    <TableCell>
                      {winner.wonAt.toLocaleString('pt-BR')}
                    </TableCell>
                    <TableCell className="text-right">
                      <WinnerStatusSelect winner={winner} />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    Nenhum ganhador registrado ainda.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
