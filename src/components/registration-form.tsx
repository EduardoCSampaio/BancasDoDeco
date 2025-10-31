
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
  Firestore,
} from 'firebase/firestore';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useFirestore } from '@/firebase';

const RegistrationSchema = z.object({
  name: z.string().min(2, { message: 'Nome deve ter pelo menos 2 caracteres.' }),
  cpf: z.string().regex(/^\d{11}$/, {
    message: 'CPF deve conter 11 dígitos.',
  }),
  casinoId: z.string().min(1, { message: 'ID da Conta Cassino é obrigatório.' }),
});

async function isCpfAlreadyRegistered(db: Firestore, cpf: string) {
  const usersCol = collection(db, 'user_registrations');
  const q = query(usersCol, where('cpf', '==', cpf));
  const querySnapshot = await getDocs(q);
  return !querySnapshot.empty;
}

export function RegistrationForm() {
  const { toast } = useToast();
  const firestore = useFirestore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof RegistrationSchema>>({
    resolver: zodResolver(RegistrationSchema),
    defaultValues: {
      name: '',
      cpf: '',
      casinoId: '',
    },
  });

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 11);
    form.setValue('cpf', value, { shouldValidate: true });
  };
  
  const onSubmit = async (data: z.infer<typeof RegistrationSchema>) => {
    if (!firestore) {
      toast({
        title: 'Erro de Conexão',
        description: 'Não foi possível conectar ao banco de dados. Tente novamente.',
        variant: 'destructive',
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const cpfExists = await isCpfAlreadyRegistered(firestore, data.cpf);
      if (cpfExists) {
        toast({
          title: 'Erro de Inscrição',
          description: 'Este CPF já foi cadastrado para o sorteio atual.',
          variant: 'destructive',
        });
        form.setError('cpf', { message: 'Este CPF já foi cadastrado.' });
        setIsSubmitting(false);
        return;
      }
      
      const usersCol = collection(firestore, 'user_registrations');
      await addDoc(usersCol, {
        ...data,
        createdAt: serverTimestamp(),
      });
      
      toast({
        title: 'Sucesso!',
        description: 'Cadastro realizado com sucesso!',
      });
      form.reset();
      
    } catch (error) {
      console.error("Error during registration: ", error);
      toast({
        title: 'Erro de Inscrição',
        description: 'Ocorreu uma falha ao realizar o cadastro. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome Completo</FormLabel>
              <FormControl>
                <Input placeholder="Seu nome completo" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="cpf"
          render={({ field }) => (
            <FormItem>
              <FormLabel>CPF (apenas números)</FormLabel>
              <FormControl>
                <Input 
                  placeholder="12345678900" 
                  {...field} 
                  onChange={handleCpfChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="casinoId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>ID da Conta Cassino</FormLabel>
              <FormControl>
                <Input placeholder="Seu ID de jogador" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90 text-lg font-bold py-6" disabled={isSubmitting}>
            {isSubmitting ? 'Confirmando...' : 'Confirmar Inscrição'}
        </Button>
      </form>
    </Form>
  );
}
