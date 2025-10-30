
'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import type { User } from './definitions';
import {
  getFirestore,
  doc,
  updateDoc,
  collection,
  writeBatch,
  runTransaction,
  addDoc,
  getDocs,
  serverTimestamp
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

export async function registerUser(prevState: RegistrationState, formData: FormData) {
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


const LoginSchema = z.object({
  email: z.string().email({ message: 'Por favor, insira um e-mail válido.' }),
  password: z.string().min(1, { message: 'A senha é obrigatória.' }),
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

  // This is a simplified check.
  if (email === 'decolivecassino@gmail.com' && password === 'Banca@123') {
     revalidatePath('/dashboard');
     return { success: true, message: 'Login bem sucedido' };
  }
  
  return { message: 'E-mail ou senha inválidos.', success: false };
}


export async function resetEntries(db: any) { // db will be passed from client
  try {
    const usersCol = collection(db, 'registered_users');
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

export async function handleNewWinner(db: any, winner: User) { // db will be passed from client
    try {
        const statsDocRef = doc(db, 'stats', 'raffle');
        await runTransaction(db, async (transaction) => {
            const sfDoc = await transaction.get(statsDocRef);
            if (!sfDoc.exists()) {
                transaction.set(statsDocRef, { totalRaffles: 1 });
            } else {
                const newTotal = (sfDoc.data()?.totalRaffles || 0) + 1;
                transaction.update(statsDocRef, { totalRaffles: newTotal });
            }
        });

        const winnersCol = collection(db, 'winners');
        await addDoc(winnersCol, {
             ...winner,
            wonAt: serverTimestamp(),
            status: 'Pendente',
        });
        
        revalidatePath('/dashboard/roulette');
        revalidatePath('/dashboard/winners');
    } catch (error) {
        console.error('Failed to handle new winner:', error);
    }
}

export async function updateWinnerStatusAction(db: any, id: string, status: 'Pendente' | 'Pix Enviado') { // db will be passed from client
  try {
    const winnerRef = doc(db, 'winners', id);
    await updateDoc(winnerRef, { status });
    revalidatePath('/dashboard/winners');
    return { success: true, message: 'Status atualizado com sucesso.' };
  } catch (error) {
    console.error('Failed to update winner status:', error);
    return { success: false, message: 'Falha ao atualizar o status.' };
  }
}
