
export type User = {
  id: string;
  name: string;
  cpf: string;
  casinoId: string;
  createdAt: any; // Can be Date or Timestamp
};

export type Winner = User & {
    wonAt: Date;
    status: 'Pendente' | 'Pix Enviado';
}
