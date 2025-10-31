
'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import {
  collection,
  writeBatch,
  getDocs,
  Firestore,
} from 'firebase/firestore';

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
  validatedData?: z.infer<typeof RegistrationSchema>;
};

export async function registerUser(
  prevState: RegistrationState,
  formData: FormData
) {
  const rawCpf = (formData.get('cpf') as string || '').replace(/[.\-]/g, '');

  const validatedFields = RegistrationSchema.safeParse({
    name: formData.get('name'),
    cpf: rawCpf,
    casinoId: formData.get('casinoId'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Campos inválidos. Falha ao validar.',
      success: false,
    };
  }

  // Since write is on client, we just revalidate and return success
  revalidatePath('/dashboard');
  return {
    message: 'Validação bem-sucedida!',
    success: true,
    validatedData: validatedFields.data,
  };
}


export async function resetEntries(db: Firestore) {
  // db will be passed from client
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

    revalidatePath('/dashboard');
    revalidatePath('/dashboard/roulette');
    return { success: true, message: 'As inscrições foram resetadas.' };
  } catch (error) {
    console.error('Failed to reset entries:', error);
    return { success: false, message: 'Falha ao resetar as inscrições.' };
  }
}
