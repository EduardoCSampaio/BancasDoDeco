
'use server';

import { z } from 'zod';
import { addUser, clearUsers, incrementRaffles, addWinner } from './data';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import type { User } from './definitions';

const RegistrationSchema = z.object({
  name: z.string().min(2, { message: 'Nome deve ter pelo menos 2 caracteres.' }),
  cpf: z.string().refine((cpf) => /^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(cpf), {
    message: 'Formato de CPF inválido. Use XXX.XXX.XXX-XX.',
  }),
  casinoId: z.string().min(1, { message: 'ID da Conta Cassino é obrigatório.' }),
});

export type RegistrationState = {
  errors?: {
    name?: string[];
    cpf?: string[];
    casinoId?: string[];
  };
  message?: string | null;
  success?: boolean;
};

export async function registerUser(prevState: RegistrationState, formData: FormData) {
  const validatedFields = RegistrationSchema.safeParse({
    name: formData.get('name'),
    cpf: formData.get('cpf'),
    casinoId: formData.get('casinoId'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Campos inválidos. Falha ao registrar.',
      success: false,
    };
  }

  try {
    await addUser(validatedFields.data);
    revalidatePath('/dashboard');
    return {
      message: 'Cadastro realizado com sucesso!',
      success: true,
    };
  } catch (error) {
    console.error('Database Error:', error);
    return {
      message: 'Erro no banco de dados: Falha ao registrar usuário.',
      success: false,
    };
  }
}


const LoginSchema = z.object({
  email: z.string().email({ message: 'Por favor, insira um e-mail válido.' }),
  password: z.string().min(6, { message: 'A senha deve ter pelo menos 6 caracteres.' }),
});

export type LoginState = {
    errors?: {
        email?: string[];
        password?: string[];
    };
    message?: string | null;
    success?: boolean;
};

export async function authenticate(prevState: LoginState | undefined, formData: FormData): Promise<LoginState> {
  const validatedFields = LoginSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Campos inválidos.',
      success: false,
    };
  }
  
  const { email, password } = validatedFields.data;
  
  if (email === 'decolivecassino@gmail.com' && password === 'SorteioDecoLive') {
      return { success: true, message: 'Login bem sucedido' };
  }

  return {
    message: 'E-mail ou senha inválidos.',
    success: false,
  };
}


export async function resetEntries() {
  try {
    await clearUsers();
    revalidatePath('/dashboard');
    revalidatePath('/dashboard/roulette');
    return { success: true, message: 'As inscrições foram resetadas.' };
  } catch (error) {
    console.error('Failed to reset entries:', error);
    return { success: false, message: 'Falha ao resetar as inscrições.' };
  }
}

export async function handleNewWinner(winner: User) {
    try {
        await incrementRaffles();
        await addWinner(winner);
        revalidatePath('/dashboard/roulette');
        revalidatePath('/dashboard/winners');
    } catch (error) {
        console.error('Failed to handle new winner:', error);
    }
}
