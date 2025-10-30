import type { Timestamp } from 'firebase/firestore';

export type User = {
  id: string;
  name: string;
  cpf: string;
  casinoId: string;
  createdAt: Date;
};

export type Winner = User & {
    wonAt: Date;
}

export type UserData = {
    name: string;
    cpf: string;
    casinoId: string;
    createdAt: Timestamp;
};

export type WinnerData = UserData & {
    wonAt: Timestamp;
}
