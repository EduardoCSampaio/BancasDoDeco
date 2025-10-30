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
import { PartyPopperIcon } from 'lucide-react';

const RegistrationSchema = z.object({
  name: z.string().min(2, { message: 'Nome deve ter pelo menos 2 caracteres.' }),
  cpf: z.string().refine((cpf) => /^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(cpf), {
    message: 'Formato de CPF inválido. Use XXX.XXX.XXX-XX.',
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

  useEffect(() => {
    if (state.message) {
      if (state.success) {
        toast({
          title: 'Sucesso!',
          description: state.message,
          variant: 'default',
        });
        form.reset();
        formRef.current?.reset();
      } else {
        toast({
          title: 'Erro de Inscrição',
          description: state.message,
          variant: 'destructive',
        });
      }
    }
  }, [state, toast, form]);

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
              <FormMessage>{state.errors?.name}</FormMessage>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="cpf"
          render={({ field }) => (
            <FormItem>
              <FormLabel>CPF</FormLabel>
              <FormControl>
                <Input placeholder="000.000.000-00" {...field} />
              </FormControl>
              <FormMessage>{state.errors?.cpf}</FormMessage>
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
              <FormMessage>{state.errors?.casinoId}</FormMessage>
            </FormItem>
          )}
        />
        <SubmitButton />
      </form>
    </Form>
  );
}
