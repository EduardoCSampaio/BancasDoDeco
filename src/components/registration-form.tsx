
'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEffect, useRef } from 'react';
import { registerUser, type RegistrationState } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useFirestore } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const RegistrationSchema = z.object({
  name: z.string().min(2, { message: 'Nome deve ter pelo menos 2 caracteres.' }),
  cpf: z.string().regex(/^\d{11}$/, {
    message: 'CPF deve conter 11 dígitos.',
  }),
  casinoId: z.string().min(1, { message: 'ID da Conta Cassino é obrigatório.' }),
});

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90 text-lg font-bold py-6" disabled={pending}>
      {pending ? 'Confirmando...' : 'Confirmar Inscrição'}
    </Button>
  );
}

export function RegistrationForm() {
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const firestore = useFirestore();
  
  const initialState: RegistrationState = { message: null, errors: {}, success: false };
  const [state, dispatch] = useActionState(registerUser, initialState);

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
    return value;
  };
  
  useEffect(() => {
    if (state.errors?.cpf) {
        form.setError('cpf', { type: 'manual', message: state.errors.cpf[0] });
    }
    if (state.errors?.name) {
        form.setError('name', { type: 'manual', message: state.errors.name[0] });
    }
    if (state.errors?.casinoId) {
        form.setError('casinoId', { type: 'manual', message: state.errors.casinoId[0] });
    }
  }, [state.errors, form]);


  useEffect(() => {
    // Handle server action result
    if (!state) return;

    if (state.success && state.validatedData && firestore) {
      // Data is valid, now write to Firestore on the client
      const usersCol = collection(firestore, 'registered_users');
      addDoc(usersCol, {
        ...state.validatedData,
        createdAt: serverTimestamp(),
      }).then(() => {
        toast({
          title: 'Sucesso!',
          description: "Cadastro realizado com sucesso!",
        });
        form.reset();
        formRef.current?.reset();
      }).catch((error) => {
        console.error("Error writing to Firestore: ", error);
        toast({
          title: 'Erro de Inscrição',
          description: "Falha ao salvar no banco de dados.",
          variant: 'destructive',
        });
      });
    } else if (!state.success && state.message) {
      // Validation failed or other server error
       toast({
            title: 'Erro de Inscrição',
            description: state.message,
            variant: 'destructive',
        });
    }
  }, [state, firestore, toast, form]);

  return (
    <Form {...form}>
      <form ref={formRef} action={dispatch} className="space-y-6">
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
                  onChange={(e) => field.onChange(handleCpfChange(e))}
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
        <SubmitButton />
      </form>
    </Form>
  );
}
