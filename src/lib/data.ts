
import { dbAdmin } from './firebase-admin';
import {
  Timestamp,
} from 'firebase-admin/firestore';
import type { User, Winner, UserData, WinnerData } from './definitions';

export async function getRaffleStats(): Promise<{ totalRaffles: number }> {
  const docRef = dbAdmin.collection('stats').doc('raffle');
  const docSnap = await docRef.get();
  if (docSnap.exists) {
    return { totalRaffles: docSnap.data()?.totalRaffles || 0 };
  }
  return { totalRaffles: 0 };
}

export async function incrementRaffles(): Promise<void> {
  const docRef = dbAdmin.collection('stats').doc('raffle');
  try {
    await dbAdmin.runTransaction(async (transaction) => {
      const sfDoc = await transaction.get(docRef);
      if (!sfDoc.exists) {
        transaction.set(docRef, { totalRaffles: 1 });
      } else {
        const newTotal = (sfDoc.data()?.totalRaffles || 0) + 1;
        transaction.update(docRef, { totalRaffles: newTotal });
      }
    });
  } catch (e) {
    console.error("Transaction failed: ", e);
  }
}

export async function getUsers(): Promise<User[]> {
  const usersCol = dbAdmin.collection('registered_users');
  const q = usersCol.orderBy('createdAt', 'desc');
  const userSnapshot = await q.get();
  return userSnapshot.docs.map((doc) => {
    const data = doc.data() as UserData;
    return {
      id: doc.id,
      name: data.name,
      cpf: data.cpf,
      casinoId: data.casinoId,
      createdAt: data.createdAt.toDate(),
    };
  });
}

export async function addUser(data: { name: string; cpf: string; casinoId: string }): Promise<void> {
    const usersCol = dbAdmin.collection('registered_users');
    const userData: UserData = {
        ...data,
        createdAt: Timestamp.now(),
    }
    await usersCol.add(userData);
}


export async function clearUsers(): Promise<void> {
    const usersCol = dbAdmin.collection('registered_users');
    const userSnapshot = await usersCol.get();
    const batch = dbAdmin.batch();
    userSnapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
    });
    await batch.commit();
}

export async function addWinner(user: User): Promise<void> {
    const winnersCol = dbAdmin.collection('winners');
    const winnerData: WinnerData = {
        name: user.name,
        cpf: user.cpf,
        casinoId: user.casinoId,
        createdAt: Timestamp.fromDate(user.createdAt),
        wonAt: Timestamp.now(),
    }
    await winnersCol.add(winnerData);
}

export async function getWinners(): Promise<Winner[]> {
    const winnersCol = dbAdmin.collection('winners');
    const q = winnersCol.orderBy('wonAt', 'desc');
    const winnerSnapshot = await q.get();
    return winnerSnapshot.docs.map((doc) => {
        const data = doc.data() as WinnerData;
        return {
            id: doc.id,
            name: data.name,
            cpf: data.cpf,
            casinoId: data.casinoId,
            createdAt: data.createdAt.toDate(),
            wonAt: data.wonAt.toDate(),
        };
    });
}
