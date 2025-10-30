import type { User } from '@/lib/definitions';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ScrollArea } from './ui/scroll-area';

export function UserTable({ users }: { users: User[] }) {
  return (
    <ScrollArea className="h-96 w-full rounded-md border">
        <Table>
        <TableHeader className="sticky top-0 bg-muted/50">
            <TableRow>
            <TableHead className="font-bold">Nome</TableHead>
            <TableHead className="font-bold">CPF</TableHead>
            <TableHead className="font-bold">ID Cassino</TableHead>
            <TableHead className="font-bold text-right">Data de Cadastro</TableHead>
            </TableRow>
        </TableHeader>
        <TableBody>
            {users.length > 0 ? (
            users.map((user) => (
                <TableRow key={user.id}>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell>{user.cpf}</TableCell>
                <TableCell>{user.casinoId}</TableCell>
                <TableCell className="text-right">
                    {user.createdAt.toLocaleDateString('pt-BR')}
                </TableCell>
                </TableRow>
            ))
            ) : (
            <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                Nenhum usuário cadastrado ainda.
                </TableCell>
            </TableRow>
            )}
        </TableBody>
        </Table>
    </ScrollArea>
  );
}
