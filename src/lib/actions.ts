
'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import type { User, Winner } from './definitions';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeAdminApp } from './firebase-admin';

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

// --- DATABASE FUNCTIONS ---
// These functions interact with Firestore and should only be called from server actions.

async function getDb() {
    const adminApp = initializeAdminApp();
    return getFirestore(adminApp);
}

async function addUserToDb(data: { name: string; cpf: string; casinoId: string }): Promise<void> {
    const db = await getDb();
    const usersCol = db.collection('registered_users');
    await usersCol.add({
        ...data,
        createdAt: new Date(),
    });
}

async function clearUsersFromDb(): Promise<void> {
    const db = await getDb();
    const usersCol = db.collection('registered_users');
    const querySnapshot = await usersCol.get();
    if (querySnapshot.empty) return;
    
    const batch = db.batch();
    querySnapshot.forEach((doc) => {
        batch.delete(doc.ref);
    });
    await batch.commit();
}

async function addWinnerToDb(user: User): Promise<void> {
    const db = await getDb();
    const winnersCol = db.collection('winners');
    await winnersCol.add({
        ...user,
        wonAt: new Date(),
        status: 'Pendente',
    });
}

async function updateWinnerStatusInDb(id: string, status: 'Pendente' | 'Pix Enviado'): Promise<void> {
    const db = await getDb();
    const winnerRef = db.collection('winners').doc(id);
    await winnerRef.update({ status });
}

async function incrementRafflesInDb(): Promise<void> {
    const db = await getDb();
    const statsDocRef = db.collection('stats').doc('raffle');
    await db.runTransaction(async (transaction) => {
        const sfDoc = await transaction.get(statsDocRef);
        if (!sfDoc.exists) {
            transaction.set(statsDocRef, { totalRaffles: 1 });
        } else {
            const newTotal = (sfDoc.data()?.totalRaffles || 0) + 1;
            transaction.update(statsDocRef, { totalRaffles: newTotal });
        }
    });
}


// --- SERVER ACTIONS ---

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
      message: 'Campos inválidos. Falha ao registrar.',
      success: false,
    };
  }

  try {
    await addUserToDb(validatedFields.data);
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
    await clearUsersFromDb();
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
        await incrementRafflesInDb();
        await addWinnerToDb(winner);
        revalidatePath('/dashboard/roulette');
        revalidatePath('/dashboard/winners');
    } catch (error) {
        console.error('Failed to handle new winner:', error);
    }
}

export async function updateWinnerStatusAction(id: string, status: 'Pendente' | 'Pix Enviado') {
  try {
    await updateWinnerStatusInDb(id, status);
    revalidatePath('/dashboard/winners');
    return { success: true, message: 'Status atualizado com sucesso.' };
  } catch (error) {
    console.error('Failed to update winner status:', error);
    return { success: false, message: 'Falha ao atualizar o status.' };
  }
}

export async function getRouletteData() {
    const db = await getDb();
    
    // Get Users
    const usersCol = db.collection('registered_users');
    const usersQuery = usersCol.orderBy('createdAt', 'desc');
    const usersSnapshot = await usersQuery.get();
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
    const statsDocRef = db.collection('stats').doc('raffle');
    const docSnap = await statsDocRef.get();
    const totalRaffles = docSnap.exists ? (docSnap.data()?.totalRaffles || 0) : 0;
    
    return { users, totalRaffles };
}
