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
