
'use client';

import { useState, useEffect } from 'react';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import type { Winner } from '@/lib/definitions';
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
import { Skeleton } from '@/components/ui/skeleton';

function WinnersSkeleton() {
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nick na Twitch</TableHead>
            <TableHead>CPF</TableHead>
            <TableHead>ID Cassino</TableHead>
            <TableHead>Chave Pix</TableHead>
            <TableHead>Data do Sorteio</TableHead>
            <TableHead className="text-right">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 5 }).map((_, i) => (
            <TableRow key={i}>
              <TableCell><Skeleton className="h-4 w-32" /></TableCell>
              <TableCell><Skeleton className="h-4 w-24" /></TableCell>
              <TableCell><Skeleton className="h-4 w-20" /></TableCell>
              <TableCell><Skeleton className="h-4 w-28" /></TableCell>
              <TableCell><Skeleton className="h-4 w-24" /></TableCell>
              <TableCell className="text-right"><Skeleton className="h-8 w-32 ml-auto" /></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  }

export default function WinnersPage() {
  const [winners, setWinners] = useState<Winner[]>([]);
  const [loading, setLoading] = useState(true);
  const firestore = useFirestore();

  useEffect(() => {
    if (!firestore) return;
    
    const winnersCol = collection(firestore, 'winners');
    const q = query(winnersCol); 

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const winnersData = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          twitchNick: data.twitchNick || data.name || '',
          cpf: data.cpf,
          casinoAccountId: data.casinoAccountId || data.casinoId,
          pixKeyType: data.pixKeyType,
          pixKey: data.pixKey,
          createdAt: data.createdAt?.toDate(),
          wonAt: data.wonAt?.toDate(),
          status: data.status || 'Pendente',
        } as Winner;
      }).filter(w => w.wonAt); 

      winnersData.sort((a, b) => b.wonAt.getTime() - a.wonAt.getTime());

      setWinners(winnersData.slice(0, 100)); 
      setLoading(false);
    }, (error) => {
        console.error("Error fetching winners:", error);
        setLoading(false);
    });

    return () => unsubscribe();
  }, [firestore]);

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
          {loading ? (
            <WinnersSkeleton />
          ) : (
            <Table>
              <TableHeader className="sticky top-0 bg-secondary">
                <TableRow>
                  <TableHead className="font-bold">Nick na Twitch</TableHead>
                  <TableHead className="font-bold">CPF</TableHead>
                  <TableHead className="font-bold">ID Cassino</TableHead>
                  <TableHead className="font-bold">Chave Pix</TableHead>
                  <TableHead className="font-bold">Data do Sorteio</TableHead>
                  <TableHead className="font-bold text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {winners.length > 0 ? (
                  winners.map((winner) => (
                    <TableRow key={winner.id}>
                      <TableCell className="font-medium">{winner.twitchNick}</TableCell>
                      <TableCell>{winner.cpf}</TableCell>
                      <TableCell>{winner.casinoAccountId}</TableCell>
                      <TableCell>{winner.pixKey}</TableCell>
                      <TableCell>
                        {winner.wonAt?.toLocaleString('pt-BR') || 'Data indisponível'}
                      </TableCell>
                      <TableCell className="text-right">
                        <WinnerStatusSelect winner={winner} />
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      Nenhum ganhador registrado ainda.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
