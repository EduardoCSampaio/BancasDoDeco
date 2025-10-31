
'use client';

import { Button } from './ui/button';
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
import { useFirestore } from '@/firebase';
import {
    collection,
    writeBatch,
    getDocs,
    Firestore,
  } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';

async function resetEntries(db: Firestore) {
    try {
      const usersCol = collection(db, 'user_registrations');
      const querySnapshot = await getDocs(usersCol);
      if (querySnapshot.empty) {
        return { success: true, message: 'Nenhuma inscrição para resetar.' };
      }
  
      const batch = writeBatch(db);
      querySnapshot.forEach((doc) => {
        batch.delete(doc.ref);
      });
      await batch.commit();
  
      // Client-side revalidation is not a concept like server-side revalidatePath.
      // The UI will update automatically due to the onSnapshot listener in the dashboard page.
      return { success: true, message: 'As inscrições foram resetadas.' };
    } catch (error) {
      console.error('Failed to reset entries:', error);
      return { success: false, message: 'Falha ao resetar as inscrições.' };
    }
  }

export function ResetButton() {
    const { toast } = useToast();
    const firestore = useFirestore();

    const handleReset = async () => {
        if (!firestore) {
            toast({ title: 'Erro', description: 'Firestore não está disponível.', variant: 'destructive' });
            return;
        }
        const result = await resetEntries(firestore);
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
                <Button variant="destructive" size="sm">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Resetar Inscrições
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Esta ação não pode ser desfeita. Isso irá limpar permanentemente
                        a lista de todos os participantes atuais, mas os ganhadores anteriores serão mantidos no histórico. A contagem de sorteios realizados não será afetada.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleReset} asChild>
                        <Button variant="destructive">
                            Sim, Resetar
                        </Button>
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
