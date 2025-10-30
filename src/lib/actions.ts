
'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import type { User } from './definitions';
import {
  doc,
  updateDoc,
  collection,
  writeBatch,
  runTransaction,
  addDoc,
  getDocs,
  serverTimestamp,
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

export async function handleNewWinner(db: Firestore, winner: User) {
  // db will be passed from client
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

export async function updateWinnerStatusAction(
  db: Firestore,
  id: string,
  status: 'Pendente' | 'Pix Enviado'
) {
  // db will be passed from client
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
