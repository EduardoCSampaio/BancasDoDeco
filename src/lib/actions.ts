
'use server';

import { z } from 'zod';
import { addUser, clearUsers, incrementRaffles } from './data';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

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
};

export async function authenticate(prevState: LoginState, formData: FormData) {
  const validatedFields = LoginSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Campos inválidos.',
    };
  }
  
  const { email, password } = validatedFields.data;

  // Em um aplicativo real, você procuraria o usuário no banco de dados
  // e verificaria a senha. Usaremos valores fixos para este exemplo.
  if (email === 'admin@example.com' && password === 'password') {
    // Aqui você normalmente criaria uma sessão e definiria um cookie.
    // Para este exemplo, apenas redirecionaremos.
    redirect('/dashboard');
  }

  return {
    message: 'E-mail ou senha inválidos.',
  };
}


export async function resetEntries() {
  try {
    await clearUsers();
    revalidatePath('/dashboard');
    return { success: true, message: 'As inscrições foram resetadas.' };
  } catch (error) {
    return { success: false, message: 'Falha ao resetar as inscrições.' };
  }
}

export async function incrementRaffleCount() {
    try {
        await incrementRaffles();
        revalidatePath('/dashboard');
    } catch (error) {
        console.error('Failed to increment raffle count:', error);
    }
}
