
import { getFirestore } from 'firebase-admin/firestore';
import { initializeAdminApp } from './firebase-admin';

import type { User, Winner } from './definitions';

// Initialize the admin app
const admin = initializeAdminApp();
const db = getFirestore(admin);


export async function getRaffleStats(): Promise<{ totalRaffles: number }> {
    const statsDocRef = db.collection('stats').doc('raffle');
    try {
        const docSnap = await statsDocRef.get();
        if (!docSnap.exists) {
            return { totalRaffles: 0 };
        }
        return docSnap.data() as { totalRaffles: number };
    } catch (e) {
        console.error("Error getting raffle stats: ", e);
        return { totalRaffles: 0 };
    }
}


export async function incrementRaffles(): Promise<void> {
    const statsDocRef = db.collection('stats').doc('raffle');
    try {
        await db.runTransaction(async (transaction) => {
            const sfDoc = await transaction.get(statsDocRef);
            if (!sfDoc.exists) {
                transaction.set(statsDocRef, { totalRaffles: 1 });
            } else {
                const newTotal = (sfDoc.data()?.totalRaffles || 0) + 1;
                transaction.update(statsDocRef, { totalRaffles: newTotal });
            }
        });
    } catch (e) {
        console.error("Error incrementing raffles: ", e);
    }
}


export async function getUsers(): Promise<User[]> {
    const usersCol = db.collection('registered_users');
    const q = usersCol.orderBy('createdAt', 'desc');
    const querySnapshot = await q.get();
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
    const usersCol = db.collection('registered_users');
    await usersCol.add({
        ...data,
        createdAt: new Date(),
    });
}

export async function clearUsers(): Promise<void> {
    const usersCol = db.collection('registered_users');
    const querySnapshot = await usersCol.get();
    const batch = db.batch();
    querySnapshot.forEach((doc) => {
        batch.delete(doc.ref);
    });
    await batch.commit();
}


export async function addWinner(user: User): Promise<void> {
    const winnersCol = db.collection('winners');
    await winnersCol.add({
        ...user,
        wonAt: new Date(),
        status: 'Pendente',
    });
}

export async function updateWinnerStatus(id: string, status: 'Pendente' | 'Pix Enviado'): Promise<void> {
    const winnerRef = db.collection('winners').doc(id);
    await winnerRef.update({ status });
}

export async function getWinners(): Promise<Winner[]> {
    const winnersCol = db.collection('winners');
    const q = winnersCol.orderBy('wonAt', 'desc').limit(100);
    const querySnapshot = await q.get();
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
