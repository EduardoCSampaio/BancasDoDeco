import { RegistrationForm } from '@/components/registration-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';

export default function Home() {
  return (
    <div className="w-full min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-gradient-to-tr from-secondary via-background to-secondary/30">
      <Card className="w-full max-w-md shadow-2xl border-accent/20 bg-card/80 backdrop-blur-sm overflow-hidden">
        <div className="relative h-60 w-full">
            <Image 
                src="/prize-image.png" 
                alt="Prêmio principal do sorteio"
                fill
                priority
                style={{ objectFit: 'cover' }}
                data-ai-hint="prêmio produto"
            />
        </div>
        <CardHeader className="text-center pt-6">
          <CardTitle className="font-headline text-4xl text-primary">Banca do PRUUUUU</CardTitle>
          <CardDescription className="text-muted-foreground pt-2 text-lg">Cadastre-se para concorrer a melhor banquinha da twitch.</CardDescription>
        </CardHeader>
        <CardContent>
          <RegistrationForm />
        </CardContent>
      </Card>
    </div>
  );
}
