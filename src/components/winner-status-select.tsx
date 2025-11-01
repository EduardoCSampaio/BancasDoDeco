
'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import type { Winner } from '@/lib/definitions';
import { Badge } from './ui/badge';
import { cn } from '@/lib/utils';
import { useFirestore } from '@/firebase';
import { doc, updateDoc, Firestore } from 'firebase/firestore';


async function updateWinnerStatus(
  db: Firestore,
  id: string,
  status: 'Pendente' | 'Pix Enviado'
) {
  try {
    const winnerRef = doc(db, 'winners', id);
    await updateDoc(winnerRef, { status });
    return { success: true, message: 'Status atualizado com sucesso.' };
  } catch (error) {
    console.error('Failed to update winner status:', error);
    return { success: false, message: 'Falha ao atualizar o status.' };
  }
}


export function WinnerStatusSelect({ winner }: { winner: Winner }) {
    const { toast } = useToast();
    const firestore = useFirestore();

    const handleStatusChange = async (newStatus: 'Pendente' | 'Pix Enviado') => {
        if (!firestore) {
            toast({ title: 'Erro', description: 'Firestore não está disponível.', variant: 'destructive' });
            return;
        }
        const result = await updateWinnerStatus(firestore, winner.id, newStatus);
        if (result.success) {
            toast({
                title: 'Status Atualizado',
                description: `O status de ${winner.twitchNick} foi alterado para ${newStatus}.`,
            });
        } else {
            toast({
                title: 'Erro',
                description: result.message,
                variant: 'destructive',
            });
        }
    };

    return (
        <Select defaultValue={winner.status} onValueChange={handleStatusChange}>
            <SelectTrigger className={cn(
                "w-40 text-xs font-bold",
                winner.status === 'Pendente' ? 'bg-yellow-100 border-yellow-300' : 'bg-green-100 border-green-300'
            )}>
                 <SelectValue>
                    <Badge variant={winner.status === 'Pendente' ? 'destructive' : 'default'} className={cn(
                        winner.status === 'Pendente' ? 'bg-yellow-500 hover:bg-yellow-500/80' : 'bg-green-600 hover:bg-green-600/80'
                    )}>
                        {winner.status}
                    </Badge>
                </SelectValue>
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="Pendente">Pendente</SelectItem>
                <SelectItem value="Pix Enviado">Pix Enviado</SelectItem>
            </SelectContent>
        </Select>
    );
}
