

export type User = {
  id: string;
  twitchNick: string;
  cpf: string;
  casinoId: string;
  pixKeyType: 'cpf' | 'email' | 'telefone' | 'aleatoria';
  pixKey: string;
  createdAt: any; // Can be Date or Timestamp
};

export type Winner = User & {
    wonAt: Date;
    status: 'Pendente' | 'Pix Enviado';
}
