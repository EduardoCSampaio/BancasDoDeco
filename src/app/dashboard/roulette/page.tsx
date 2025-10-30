
import { getRaffleStats, getUsers } from '@/lib/data';
import { Roulette } from '@/components/roulette';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Ticket, Trophy } from 'lucide-react';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export const dynamic = 'force-dynamic';

export default async function RoulettePage() {
  const users = await getUsers();
  const { totalRaffles } = await getRaffleStats();
  const prizeImage = PlaceHolderImages.find(p => p.id === 'prize-image');


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
                {prizeImage && (
                    <div className="relative h-64 w-full rounded-lg overflow-hidden mb-8 shadow-inner">
                        <Image 
                            src={prizeImage.imageUrl} 
                            alt={prizeImage.description}
                            fill
                            style={{ objectFit: 'cover' }}
                            data-ai-hint={prizeImage.imageHint}
                        />
                    </div>
                )}
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
