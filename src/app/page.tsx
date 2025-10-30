import { RegistrationForm } from '@/components/registration-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RouletteWheelIcon } from '@/components/icons';

export default function Home() {
  return (
    <div className="w-full min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-gradient-to-br from-background via-secondary to-background">
      <Card className="w-full max-w-md shadow-2xl border-accent/20">
        <CardHeader className="text-center">
          <div className="mx-auto bg-primary text-primary-foreground rounded-full p-3 w-fit mb-4 shadow-lg">
            <RouletteWheelIcon className="h-10 w-10" />
          </div>
          <CardTitle className="font-headline text-4xl">Entre para o Clube</CardTitle>
          <CardDescription className="text-muted-foreground pt-2">Cadastre-se agora para acesso exclusivo e prêmios.</CardDescription>
        </CardHeader>
        <CardContent>
          <RegistrationForm />
        </CardContent>
      </Card>
    </div>
  );
}
