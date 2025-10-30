'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LogInIcon } from 'lucide-react';
import { useAuth } from '@/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useState } from 'react';


function LoginButton({ pending }: { pending: boolean}) {
    return (
        <Button className="w-full" aria-disabled={pending} disabled={pending}>
            {pending ? "Entrando..." : "Entrar"}
        </Button>
    );
}

export default function LoginPage() {
    const auth = useAuth();
    const router = useRouter();
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [pending, setPending] = useState(false);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setPending(true);
        setErrorMessage(null);

        const formData = new FormData(event.currentTarget);
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;

        if (!email || !password) {
            setErrorMessage('Por favor, preencha o e-mail e a senha.');
            setPending(false);
            return;
        }

        try {
            await signInWithEmailAndPassword(auth, email, password);
            router.push('/dashboard');
        } catch (error: any) {
            if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
                setErrorMessage('E-mail ou senha inválidos.');
            } else {
                setErrorMessage('Ocorreu um erro ao tentar fazer login. Tente novamente.');
                console.error(error);
            }
        } finally {
            setPending(false);
        }
    };

    return (
        <div className="w-full min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
            <Card className="w-full max-w-sm shadow-xl bg-card/80 backdrop-blur-sm">
                <CardHeader className="text-center">
                    <CardTitle className="font-headline text-3xl">Acesso Administrativo</CardTitle>
                    <CardDescription>Faça login para gerenciar os participantes.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" name="email" type="email" placeholder="decolivecassino@gmail.com" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Senha</Label>
                            <Input id="password" name="password" type="password" placeholder="senha" required />
                        </div>
                        {errorMessage && (
                            <div className="flex items-center space-x-2 text-sm text-destructive">
                                <LogInIcon className="h-4 w-4" />
                                <p>{errorMessage}</p>
                            </div>
                        )}
                        <LoginButton pending={pending} />
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
