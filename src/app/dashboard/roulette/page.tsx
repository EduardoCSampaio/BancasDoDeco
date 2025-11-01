
'use client';

import { useState, useEffect } from 'react';
import { useFirestore } from '@/firebase';
import { collection, doc, query, onSnapshot, deleteDoc, runTransaction, addDoc, serverTimestamp } from 'firebase/firestore';
import { Roulette } from '@/components/roulette';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Ticket, Trophy } from 'lucide-react';
import Image from 'next/image';
import type { User } from '@/lib/definitions';
import { Skeleton } from '@/components/ui/skeleton';

function RouletteSkeleton() {
    return (
        <div className="flex flex-col items-center gap-8">
            <Skeleton className="relative w-80 h-80 md:w-96 md:h-96 rounded-full" />
            <div className="text-center h-20" />
            <Skeleton className="h-20 w-64 rounded-full" />
            <Skeleton className="h-8 w-48" />
        </div>
    )
}

async function handleNewWinner(db: any, winner: User) {
    try {
      // 1. Add to permanent winners collection and increment stats
      const statsDocRef = doc(db, 'stats', 'raffle');
      await runTransaction(db, async (transaction) => {
        const sfDoc = await transaction.get(statsDocRef);
        if (!sfDoc.exists()) {
          transaction.set(statsDocRef, { totalRaffles: 1 });
        } else {
          const newTotal = (sfDoc.data()?.totalRaffles || 0) + 1;
          transaction.update(statsDocRef, { totalRaffles: newTotal });
        }
      });
  
      const winnersCol = collection(db, 'winners');
      await addDoc(winnersCol, {
        ...winner,
        wonAt: serverTimestamp(),
        status: 'Pendente',
      });
  
      // 2. Remove winner from the active participants list
      const userRegistrationRef = doc(db, 'user_registrations', winner.id);
      await deleteDoc(userRegistrationRef);
  
    } catch (error) {
      console.error('Failed to handle new winner:', error);
    }
  }

export default function RoulettePage() {
    const [users, setUsers] = useState<User[]>([]);
    const [totalRaffles, setTotalRaffles] = useState(0);
    const [loading, setLoading] = useState(true);
    const firestore = useFirestore();

    useEffect(() => {
        if (!firestore) return;

        // Get Users
        const usersCol = collection(firestore, 'user_registrations');
        const usersQuery = query(usersCol);
        const unsubscribeUsers = onSnapshot(usersQuery, (snapshot) => {
            const usersData = snapshot.docs.map((doc) => {
                const data = doc.data();
                return {
                    id: doc.id,
                    // Handle old data structure with 'name' and new with 'twitchNick'
                    twitchNick: data.twitchNick || data.name || '',
                    cpf: data.cpf,
                    casinoId: data.casinoId || data.casinoAccountId,
                    pixKeyType: data.pixKeyType,
                    pixKey: data.pixKey,
                    createdAt: data.createdAt?.toDate(),
                } as User
            }).filter(u => u.createdAt);
            
            usersData.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
            setUsers(usersData);
            setLoading(false);
        }, (error) => {
            console.error("Failed to fetch users:", error);
            setLoading(false);
        });

        // Get Stats
        const statsDocRef = doc(firestore, 'stats', 'raffle');
        const unsubscribeStats = onSnapshot(statsDocRef, (docSnap) => {
            const totalRafflesData = docSnap.exists() ? (docSnap.data()?.totalRaffles || 0) : 0;
            setTotalRaffles(totalRafflesData);
        }, (error) => {
            console.error("Failed to fetch raffle stats:", error);
        });
        
        return () => {
            unsubscribeUsers();
            unsubscribeStats();
        }
    }, [firestore]);

    return (
        <div className="flex justify-center">
            <Card className="shadow-lg border-primary/20 w-full max-w-2xl bg-card/80 backdrop-blur-sm">
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <Ticket className="w-8 h-8 text-primary" />
                        <CardTitle className="font-headline text-3xl">Roleta da Sorte</CardTitle>
                    </div>
                    <CardDescription>Gire a roleta para selecionar um vencedor aleatório.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="relative h-64 w-full rounded-lg overflow-hidden mb-8 shadow-inner">
                        <Image
                            src="/prize-image.png"
                            alt="Prêmio principal do sorteio"
                            fill
                            style={{ objectFit: 'cover' }}
                            data-ai-hint="prêmio produto"
                        />
                    </div>
                    {loading ? <RouletteSkeleton /> : (
                        <>
                            <Roulette participants={users} onNewWinner={(winner) => handleNewWinner(firestore, winner)} />
                            <div className="mt-8 flex flex-col items-center gap-4">
                                <div className="flex items-center gap-2 text-lg font-semibold text-muted-foreground">
                                    <Trophy className="w-6 h-6 text-accent" />
                                    <span>Sorteios Realizados: {totalRaffles}</span>
                                </div>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
