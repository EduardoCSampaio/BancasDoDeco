import type { User } from './definitions';

// In a real application, this would be a database like Firestore.
const users: User[] = [
  { id: '1', name: 'João da Silva', cpf: '111.222.333-44', casinoId: 'CASINO-001', createdAt: new Date('2023-10-01T10:00:00Z') },
  { id: '2', name: 'Maria Oliveira', cpf: '555.666.777-88', casinoId: 'CASINO-002', createdAt: new Date('2023-10-02T11:30:00Z') },
  { id: '3', name: 'Pedro Santos', cpf: '999.000.111-22', casinoId: 'CASINO-003', createdAt: new Date('2023-10-03T14:00:00Z') },
  { id: '4', name: 'Ana Souza', cpf: '123.456.789-00', casinoId: 'CASINO-004', createdAt: new Date('2023-10-04T09:15:00Z') },
  { id: '5', name: 'Carlos Pereira', cpf: '098.765.432-11', casinoId: 'CASINO-005', createdAt: new Date('2023-10-05T18:45:00Z') },
];

let nextId = 6;

export async function getUsers(): Promise<User[]> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300));
  return users.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export async function addUser(data: { name: string; cpf: string; casinoId: string }): Promise<User> {
  await new Promise(resolve => setTimeout(resolve, 500));
  const newUser: User = {
    id: String(nextId++),
    ...data,
    createdAt: new Date(),
  };
  users.unshift(newUser); // Add to the beginning of the array
  return newUser;
}
