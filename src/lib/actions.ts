
'use server';

import { z } from 'zod';
import { addUser } from './data';
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

  // In a real app, you'd look up the user in the database
  // and check their password. We'll use hardcoded values for this example.
  if (email === 'admin@example.com' && password === 'password') {
    // Here you would typically create a session and set a cookie.
    // For this example, we'll just redirect.
    redirect('/dashboard');
  }

  return {
    message: 'E-mail ou senha inválidos.',
  };
}
