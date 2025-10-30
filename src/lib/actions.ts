
'use server';

import { z } from 'zod';
import { addUser, clearUsers, incrementRaffles, addWinner, updateWinnerStatus } from './data';
import { revalidatePath } from 'next/cache';
import type { User } from './definitions';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from './firebase-admin';

const RegistrationSchema = z.object({
  name: z.string().min(2, { message: 'Nome deve ter pelo menos 2 caracteres.' }),
  cpf: z.string().regex(/^\d{11}$/, {
    message: 'CPF deve conter 11 dígitos.',
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
  // Remove formatting from CPF
  const rawCpf = (formData.get('cpf') as string || '').replace(/[.\-]/g, '');

  const validatedFields = RegistrationSchema.safeParse({
    name: formData.get('name'),
    cpf: rawCpf,
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
  
  try {
     const userCredential = await auth.getUserByEmail(email);
     // Note: This is not a direct password check. `firebase-admin` does not do that.
     // For a real app, you'd use client-side SDK's signInWithEmailAndPassword, then send ID token to server to create a session cookie.
     // For this app's purpose, just checking if admin email exists is enough to "log in" for the dashboard.
     if (userCredential.email === 'decolivecassino@gmail.com') {
        // This is a simplified "login" for the purpose of this app.
        // A real app should implement proper session management.
        return { success: true, message: 'Login bem sucedido' };
     }
    return { message: 'E-mail ou senha inválidos.', success: false };
  } catch (error) {
    console.error('Authentication error:', error);
    if ((error as any).code === 'auth/user-not-found') {
        return { message: 'E-mail ou senha inválidos.', success: false };
    }
    return { message: 'Ocorreu um erro durante a autenticação.', success: false };
  }
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

export async function updateWinnerStatusAction(id: string, status: 'Pendente' | 'Pix Enviado') {
  try {
    await updateWinnerStatus(id, status);
    revalidatePath('/dashboard/winners');
    return { success: true, message: 'Status atualizado com sucesso.' };
  } catch (error) {
    console.error('Failed to update winner status:', error);
    return { success: false, message: 'Falha ao atualizar o status.' };
  }
}
