import type { User, Winner } from './definitions';

// Em uma aplicação real, isso seria um banco de dados como o Firestore.
let users: User[] = [
  { id: '1', name: 'João da Silva', cpf: '111.222.333-44', casinoId: 'CASINO-001', createdAt: new Date('2023-10-01T10:00:00Z') },
  { id: '2', name: 'Maria Oliveira', cpf: '555.666.777-88', casinoId: 'CASINO-002', createdAt: new Date('2023-10-02T11:30:00Z') },
  { id: '3', name: 'Pedro Santos', cpf: '999.000.111-22', casinoId: 'CASINO-003', createdAt: new Date('2023-10-03T14:00:00Z') },
  { id: '4', name: 'Ana Souza', cpf: '123.456.789-00', casinoId: 'CASINO-004', createdAt: new Date('2023-10-04T09:15:00Z') },
  { id: '5', name: 'Carlos Pereira', cpf: '098.765.432-11', casinoId: 'CASINO-005', createdAt: new Date('2023-10-05T18:45:00Z') },
];
let winners: Winner[] = [];

let nextId = 6;
let totalRaffles = 0;

export async function getRaffleStats(): Promise<{ totalRaffles: number }> {
    await new Promise(resolve => setTimeout(resolve, 50));
    return { totalRaffles };
}

export async function incrementRaffles(): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 50));
    totalRaffles++;
}

export async function getUsers(): Promise<User[]> {
  // Simula um atraso de rede
  await new Promise(resolve => setTimeout(resolve, 300));
  return users.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export async function getUserByName(name: string): Promise<User | undefined> {
    await new Promise(resolve => setTimeout(resolve, 50));
    return users.find(user => user.name === name);
}

export async function addUser(data: { name: string; cpf: string; casinoId: string }): Promise<User> {
  await new Promise(resolve => setTimeout(resolve, 500));
  const newUser: User = {
    id: String(nextId++),
    ...data,
    createdAt: new Date(),
  };
  users.unshift(newUser); // Adiciona ao início do array
  return newUser;
}

export async function clearUsers(): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 200));
    users = [];
    nextId = 1;
}

export async function addWinner(user: User): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 50));
    const newWinner: Winner = {
        ...user,
        wonAt: new Date(),
    };
    winners.unshift(newWinner);
}

export async function getWinners(): Promise<Winner[]> {
    await new Promise(resolve => setTimeout(resolve, 100));
    return winners.sort((a, b) => b.wonAt.getTime() - a.wonAt.getTime());
}
