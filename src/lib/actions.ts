
'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import type { User, Winner } from './definitions';
import { getFirestore, doc, updateDoc, collection, getDocs, query, orderBy, getDoc, runTransaction, addDoc, writeBatch } from 'firebase/firestore';
import { db } from '@/firebase/config-for-actions';


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
    
    // Apenas validação aqui. A escrita será feita no cliente.
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

  // This is a simplified check. In a real app, use Firebase Auth client-side SDK.
  if (email === 'decolivecassino@gmail.com' && password === 'Banca@123') {
     return { success: true, message: 'Login bem sucedido' };
  }
  
  return { message: 'E-mail ou senha inválidos.', success: false };
}


export async function resetEntries() {
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

export async function handleNewWinner(winner: User) {
    try {
        const statsDocRef = doc(db, 'stats', 'raffle');
        await runTransaction(db, async (transaction) => {
            const sfDoc = await transaction.get(statsDocRef);
            if (!sfDoc.exists) {
                transaction.set(statsDocRef, { totalRaffles: 1 });
            } else {
                const newTotal = (sfDoc.data()?.totalRaffles || 0) + 1;
                transaction.update(statsDocRef, { totalRaffles: newTotal });
            }
        });

        const winnersCol = collection(db, 'winners');
        await addDoc(winnersCol, {
             ...winner,
            wonAt: new Date(),
            status: 'Pendente',
        });
        
        revalidatePath('/dashboard/roulette');
        revalidatePath('/dashboard/winners');
    } catch (error) {
        console.error('Failed to handle new winner:', error);
    }
}

export async function updateWinnerStatusAction(id: string, status: 'Pendente' | 'Pix Enviado') {
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

export async function getRouletteData() {
    // Get Users
    const usersCol = collection(db, 'registered_users');
    const usersQuery = query(usersCol, orderBy('createdAt', 'desc'));
    const usersSnapshot = await getDocs(usersQuery);
    const users = usersSnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
            id: doc.id,
            name: data.name,
            cpf: data.cpf,
            casinoId: data.casinoId,
            // Firestore timestamps need to be converted to be serializable
            createdAt: data.createdAt.toDate().toISOString(),
        } as User;
    });

    // Get Stats
    const statsDocRef = doc(db, 'stats', 'raffle');
    const docSnap = await getDoc(statsDocRef);
    const totalRaffles = docSnap.exists() ? (docSnap.data()?.totalRaffles || 0) : 0;
    
    return { users, totalRaffles };
}
