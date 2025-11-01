
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useFirestore } from '@/firebase';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';

const RegistrationSchema = z.object({
  twitchNick: z.string().min(2, { message: 'Nick deve ter pelo menos 2 caracteres.' }),
  cpf: z.string().regex(/^\d{11}$/, {
    message: 'CPF deve conter 11 dígitos.',
  }),
  pixKeyType: z.enum(['cpf', 'email', 'telefone', 'aleatoria'], {
    required_error: 'Você precisa selecionar um tipo de chave Pix.',
  }),
  pixKey: z.string().optional(),
  casinoAccountId: z.string().min(1, { message: 'ID da Conta Cassino é obrigatório.' }),
}).refine(data => {
    if (data.pixKeyType !== 'cpf') {
        return !!data.pixKey && data.pixKey.length > 0;
    }
    return true;
}, {
    message: 'A Chave Pix é obrigatória para o tipo selecionado.',
    path: ['pixKey'],
}).refine(data => {
    if (data.pixKeyType === 'email') {
        return z.string().email({message: 'Formato de email inválido.'}).safeParse(data.pixKey).success;
    }
    return true;
}, {
    message: 'Formato de email inválido.',
    path: ['pixKey'],
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
      twitchNick: '',
      cpf: '',
      pixKeyType: 'cpf',
      pixKey: '',
      casinoAccountId: '',
    },
  });

  const pixKeyType = form.watch('pixKeyType');

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
      
      const submissionData: any = {
        twitchNick: data.twitchNick,
        cpf: data.cpf,
        casinoAccountId: data.casinoAccountId,
        pixKeyType: data.pixKeyType,
        createdAt: serverTimestamp(),
      };

      if (data.pixKeyType !== 'cpf') {
        submissionData.pixKey = data.pixKey;
      } else {
        submissionData.pixKey = data.cpf;
      }

      await addDoc(usersCol, submissionData);
      
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
          name="twitchNick"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nick na Twitch</FormLabel>
              <FormControl>
                <Input placeholder="Seu nick na Twitch" {...field} />
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
          name="pixKeyType"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Tipo de Chave Pix</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col space-y-1"
                >
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="cpf" />
                    </FormControl>
                    <FormLabel className="font-normal">CPF</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="email" />
                    </FormControl>
                    <FormLabel className="font-normal">Email</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="telefone" />
                    </FormControl>
                    <FormLabel className="font-normal">Telefone</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="aleatoria" />
                    </FormControl>
                    <FormLabel className="font-normal">Chave Aleatória</FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {pixKeyType && pixKeyType !== 'cpf' && (
           <FormField
            control={form.control}
            name="pixKey"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                    {
                        pixKeyType === 'email' ? 'Email' :
                        pixKeyType === 'telefone' ? 'Telefone' :
                        'Chave Aleatória'
                    }
                </FormLabel>
                <FormControl>
                  <Input placeholder={`Sua chave ${pixKeyType}`} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}


        <FormField
          control={form.control}
          name="casinoAccountId"
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
