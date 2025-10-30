'use client';

import { useFormStatus } from 'react-dom';
import { Button } from './ui/button';
import { resetEntries } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Trash2 } from 'lucide-react';

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <AlertDialogAction asChild>
            <Button
                type="submit"
                variant="destructive"
                disabled={pending}
                aria-disabled={pending}
            >
                {pending ? "Resetando..." : "Sim, Resetar"}
            </Button>
        </AlertDialogAction>
    )
}

export function ResetButton() {
    const { toast } = useToast();

    const handleReset = async () => {
        const result = await resetEntries();
        if (result.success) {
            toast({
                title: 'Sucesso!',
                description: result.message,
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
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-64">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Resetar Inscrições
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Esta ação não pode ser desfeita. Isso irá limpar permanentemente
                        a lista de todos os participantes atuais. A contagem de sorteios realizados não será afetada.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <form action={handleReset} className="flex gap-2">
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <SubmitButton />
                    </form>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
