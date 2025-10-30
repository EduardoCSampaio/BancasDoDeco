import { db } from './firebase';
import {
  collection,
  getDocs,
  addDoc,
  doc,
  writeBatch,
  getDoc,
  runTransaction,
  Timestamp,
  orderBy,
  query
} from 'firebase/firestore';
import type { User, Winner, UserData, WinnerData } from './definitions';

export async function getRaffleStats(): Promise<{ totalRaffles: number }> {
  const docRef = doc(db, 'stats', 'raffle');
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { totalRaffles: docSnap.data().totalRaffles || 0 };
  }
  return { totalRaffles: 0 };
}

export async function incrementRaffles(): Promise<void> {
  const docRef = doc(db, 'stats', 'raffle');
  try {
    await runTransaction(db, async (transaction) => {
      const sfDoc = await transaction.get(docRef);
      if (!sfDoc.exists()) {
        transaction.set(docRef, { totalRaffles: 1 });
      } else {
        const newTotal = (sfDoc.data().totalRaffles || 0) + 1;
        transaction.update(docRef, { totalRaffles: newTotal });
      }
    });
  } catch (e) {
    console.error("Transaction failed: ", e);
  }
}

export async function getUsers(): Promise<User[]> {
  const usersCol = collection(db, 'registered_users');
  const q = query(usersCol, orderBy('createdAt', 'desc'));
  const userSnapshot = await getDocs(q);
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
    const usersCol = collection(db, 'registered_users');
    const userData: UserData = {
        ...data,
        createdAt: Timestamp.now(),
    }
    await addDoc(usersCol, userData);
}


export async function clearUsers(): Promise<void> {
    const usersCol = collection(db, 'registered_users');
    const userSnapshot = await getDocs(usersCol);
    const batch = writeBatch(db);
    userSnapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
    });
    await batch.commit();
}

export async function addWinner(user: User): Promise<void> {
    const winnersCol = collection(db, 'winners');
    const winnerData: WinnerData = {
        name: user.name,
        cpf: user.cpf,
        casinoId: user.casinoId,
        createdAt: Timestamp.fromDate(user.createdAt),
        wonAt: Timestamp.now(),
    }
    await addDoc(winnersCol, winnerData);
}

export async function getWinners(): Promise<Winner[]> {
    const winnersCol = collection(db, 'winners');
    const q = query(winnersCol, orderBy('wonAt', 'desc'));
    const winnerSnapshot = await getDocs(q);
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
