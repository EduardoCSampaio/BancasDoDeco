
'use server';

import { db } from '@/lib/firebase';
import type { User, Winner } from './definitions';
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

// Collection references
const usersCol = collection(db, 'registered_users');
const winnersCol = collection(db, 'winners');
const statsDoc = doc(db, 'stats', 'raffle');

export async function getRaffleStats(): Promise<{ totalRaffles: number }> {
  try {
    const docSnap = await runTransaction(db, async (transaction) => {
        const sfDoc = await transaction.get(statsDoc);
        if (!sfDoc.exists()) {
            return { totalRaffles: 0 };
        }
        return sfDoc.data() as { totalRaffles: number };
    });
    return docSnap;
  } catch (e) {
    console.error("Error getting raffle stats: ", e);
    // Return a default value in case of error
    return { totalRaffles: 0 };
  }
}

export async function incrementRaffles(): Promise<void> {
  try {
    await runTransaction(db, async (transaction) => {
      const sfDoc = await transaction.get(statsDoc);
      if (!sfDoc.exists()) {
        transaction.set(statsDoc, { totalRaffles: 1 });
      } else {
        const newTotal = (sfDoc.data().totalRaffles || 0) + 1;
        transaction.update(statsDoc, { totalRaffles: newTotal });
      }
    });
  } catch (e) {
    console.error("Error incrementing raffles: ", e);
  }
}

export async function getUsers(): Promise<User[]> {
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
    };
  });
  return users;
}

export async function addUser(data: { name: string; cpf: string; casinoId: string }): Promise<void> {
    await addDoc(usersCol, {
        ...data,
        createdAt: serverTimestamp(),
    });
}

export async function clearUsers(): Promise<void> {
    const querySnapshot = await getDocs(usersCol);
    const batch = writeBatch(db);
    querySnapshot.forEach((doc) => {
        batch.delete(doc.ref);
    });
    await batch.commit();
}

export async function addWinner(user: User): Promise<void> {
    await addDoc(winnersCol, {
        ...user,
        wonAt: serverTimestamp(),
        status: 'Pendente',
    });
}

export async function updateWinnerStatus(id: string, status: 'Pendente' | 'Pix Enviado'): Promise<void> {
    const winnerRef = doc(db, 'winners', id);
    await updateDoc(winnerRef, { status });
}


export async function getWinners(): Promise<Winner[]> {
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
        }
    });
    return winners;
}
