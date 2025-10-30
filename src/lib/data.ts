
'use server';

import { getFirestore } from 'firebase-admin/firestore';
import {
  collection,
  getDocs,
  addDoc,
  writeBatch,
  doc,
  runTransaction,
  serverTimestamp,
  query,
  orderBy,
  limit,
  updateDoc
} from 'firebase/firestore';
import { initializeFirebase } from '@/firebase';

import type { User, Winner } from './definitions';

// This function will now use the client-side SDK via initializeFirebase
export async function getRaffleStats(): Promise<{ totalRaffles: number }> {
    const { firestore } = initializeFirebase();
    const statsDocRef = doc(firestore, 'stats', 'raffle');
    try {
        const docSnap = await runTransaction(firestore, async (transaction) => {
            const sfDoc = await transaction.get(statsDocRef);
            if (!sfDoc.exists()) {
                return { totalRaffles: 0 };
            }
            return sfDoc.data() as { totalRaffles: number };
        });
        return docSnap;
    } catch (e) {
        console.error("Error getting raffle stats: ", e);
        return { totalRaffles: 0 };
    }
}


export async function incrementRaffles(): Promise<void> {
    const { firestore } = initializeFirebase();
    const statsDocRef = doc(firestore, 'stats', 'raffle');
    try {
        await runTransaction(firestore, async (transaction) => {
            const sfDoc = await transaction.get(statsDocRef);
            if (!sfDoc.exists()) {
                transaction.set(statsDocRef, { totalRaffles: 1 });
            } else {
                const newTotal = (sfDoc.data().totalRaffles || 0) + 1;
                transaction.update(statsDocRef, { totalRaffles: newTotal });
            }
        });
    } catch (e) {
        console.error("Error incrementing raffles: ", e);
    }
}


export async function getUsers(): Promise<User[]> {
    const { firestore } = initializeFirebase();
    const usersCol = collection(firestore, 'registered_users');
    const q = query(usersCol, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    const users = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
            id: doc.id,
            name: data.name,
            cpf: data.cpf,
            casinoId: data.casinoId,
            createdAt: data.createdAt.toDate(),
        } as User;
    });
    return users;
}

export async function addUser(data: { name: string; cpf: string; casinoId: string }): Promise<void> {
    const { firestore } = initializeFirebase();
    const usersCol = collection(firestore, 'registered_users');
    await addDoc(usersCol, {
        ...data,
        createdAt: serverTimestamp(),
    });
}

export async function clearUsers(): Promise<void> {
    const { firestore } = initializeFirebase();
    const usersCol = collection(firestore, 'registered_users');
    const querySnapshot = await getDocs(usersCol);
    const batch = writeBatch(firestore);
    querySnapshot.forEach((doc) => {
        batch.delete(doc.ref);
    });
    await batch.commit();
}


export async function addWinner(user: User): Promise<void> {
    const { firestore } = initializeFirebase();
    const winnersCol = collection(firestore, 'winners');
    await addDoc(winnersCol, {
        ...user,
        wonAt: serverTimestamp(),
        status: 'Pendente',
    });
}

export async function updateWinnerStatus(id: string, status: 'Pendente' | 'Pix Enviado'): Promise<void> {
    const { firestore } = initializeFirebase();
    const winnerRef = doc(firestore, 'winners', id);
    await updateDoc(winnerRef, { status });
}

export async function getWinners(): Promise<Winner[]> {
    const { firestore } = initializeFirebase();
    const winnersCol = collection(firestore, 'winners');
    const q = query(winnersCol, orderBy('wonAt', 'desc'), limit(100));
    const querySnapshot = await getDocs(q);
    const winners = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
            id: doc.id,
            name: data.name,
            cpf: data.cpf,
            casinoId: data.casinoId,
            createdAt: data.createdAt.toDate(),
            wonAt: data.wonAt.toDate(),
            status: data.status || 'Pendente',
        } as Winner;
    });
    return winners;
}
