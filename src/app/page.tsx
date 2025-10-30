import { RegistrationForm } from '@/components/registration-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Gift } from 'lucide-react';

export default function Home() {
  return (
    <div className="w-full min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-gradient-to-tr from-secondary via-background to-secondary/30">
      <Card className="w-full max-w-md shadow-2xl border-accent/20 bg-card/80 backdrop-blur-sm">
        <CardHeader className="text-center">
          <div className="mx-auto bg-accent text-accent-foreground rounded-full p-3 w-fit mb-4 shadow-lg shadow-accent/20">
            <Gift className="h-10 w-10" />
          </div>
          <CardTitle className="font-headline text-4xl text-primary">Participe do Sorteio VIP</CardTitle>
          <CardDescription className="text-muted-foreground pt-2 text-lg">Cadastre-se para concorrer a prêmios incríveis.</CardDescription>
        </CardHeader>
        <CardContent>
          <RegistrationForm />
        </CardContent>
      </Card>
    </div>
  );
}
