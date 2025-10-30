
'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LogInIcon } from 'lucide-react';
import { authenticate, type LoginState } from '@/lib/actions';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';


function LoginButton() {
    const { pending } = useFormStatus();
    return (
        <Button className="w-full" aria-disabled={pending} disabled={pending}>
            {pending ? "Entrando..." : "Entrar"}
        </Button>
    );
}

export default function LoginPage() {
    const router = useRouter();
    const initialState: LoginState = { message: null, errors: {} };
    const [state, dispatch] = useActionState(authenticate, initialState);
    
    useEffect(() => {
        if (state?.success) {
            router.push('/dashboard');
        }
    }, [state, router]);

    return (
        <div className="w-full min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
            <Card className="w-full max-w-sm shadow-xl bg-card/80 backdrop-blur-sm">
                <CardHeader className="text-center">
                    <CardTitle className="font-headline text-3xl">Acesso Administrativo</CardTitle>
                    <CardDescription>Faça login para gerenciar os participantes.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form action={dispatch} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" name="email" type="email" placeholder="decolivecassino@gmail.com" required defaultValue="decolivecassino@gmail.com" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Senha</Label>
                            <Input id="password" name="password" type="password" required defaultValue="SorteioDecoLive" />
                        </div>
                        {state?.message && (
                            <div className="flex items-center space-x-2 text-sm text-destructive">
                                <LogInIcon className="h-4 w-4" />
                                <p>{state.message}</p>
                            </div>

                        )}
                        <LoginButton />
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
