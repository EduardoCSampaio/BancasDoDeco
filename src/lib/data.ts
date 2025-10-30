
import type { User, Winner } from './definitions';

// In-memory data store
let users: User[] = [];
let winners: Winner[] = [];
let raffleStats = { totalRaffles: 0 };

export async function getRaffleStats(): Promise<{ totalRaffles: number }> {
  return Promise.resolve(raffleStats);
}

export async function incrementRaffles(): Promise<void> {
  raffleStats.totalRaffles += 1;
  return Promise.resolve();
}

export async function getUsers(): Promise<User[]> {
  // Sort users by creation date, descending
  const sortedUsers = [...users].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  return Promise.resolve(sortedUsers);
}

export async function addUser(data: { name: string; cpf: string; casinoId: string }): Promise<void> {
    const newUser: User = {
        id: new Date().toISOString() + Math.random(), // simple unique id
        ...data,
        createdAt: new Date(),
    }
    users.push(newUser);
    return Promise.resolve();
}

export async function clearUsers(): Promise<void> {
    users = [];
    return Promise.resolve();
}

export async function addWinner(user: User): Promise<void> {
    const newWinner: Winner = {
        ...user,
        wonAt: new Date(),
    }
    winners.push(newWinner);
    return Promise.resolve();
}

export async function getWinners(): Promise<Winner[]> {
    const sortedWinners = [...winners].sort((a, b) => b.wonAt.getTime() - a.wonAt.getTime());
    return Promise.resolve(sortedWinners);
}
