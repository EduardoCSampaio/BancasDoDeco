
'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { updateWinnerStatusAction } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import type { Winner } from '@/lib/definitions';
import { Badge } from './ui/badge';
import { cn } from '@/lib/utils';


export function WinnerStatusSelect({ winner }: { winner: Winner }) {
    const { toast } = useToast();

    const handleStatusChange = async (newStatus: 'Pendente' | 'Pix Enviado') => {
        const result = await updateWinnerStatusAction(winner.id, newStatus);
        if (result.success) {
            toast({
                title: 'Status Atualizado',
                description: `O status de ${winner.name} foi alterado para ${newStatus}.`,
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
