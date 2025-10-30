'use client';

import { useState, useEffect } from 'react';
import type { User } from '@/lib/definitions';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { UserTable } from '@/components/user-table';
import { ResetButton } from '@/components/reset-button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Users } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

function DashboardSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-1/3" />
      <div className="rounded-md border">
        <div className="h-96 w-full space-y-2 p-4">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
      </div>
    </div>
  );
}


export default function DashboardPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const firestore = useFirestore();

  useEffect(() => {
    if (!firestore) return;

    const usersCol = collection(firestore, 'registered_users');
    const q = query(usersCol);

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const usersData = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name,
          cpf: data.cpf,
          casinoId: data.casinoId,
          createdAt: data.createdAt?.toDate(), 
        } as User;
      }).filter(u => u.createdAt);
      
      // Sort on the client-side
      usersData.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

      setUsers(usersData);
      setLoading(false);
    }, (error) => {
        console.error("Error fetching users:", error);
        setLoading(false);
    });

    return () => unsubscribe();
  }, [firestore]);

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
        {loading ? <DashboardSkeleton /> : <UserTable users={users} />}
      </CardContent>
    </Card>
  );
}
