import { RegistrationForm } from '@/components/registration-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function Home() {
  const prizeImage = PlaceHolderImages.find(p => p.id === 'prize-image');

  return (
    <div className="w-full min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-gradient-to-tr from-secondary via-background to-secondary/30">
      <Card className="w-full max-w-md shadow-2xl border-accent/20 bg-card/80 backdrop-blur-sm overflow-hidden">
        {prizeImage && (
            <div className="relative h-60 w-full">
                <Image 
                    src={prizeImage.imageUrl} 
                    alt={prizeImage.description}
                    fill
                    style={{ objectFit: 'cover' }}
                    data-ai-hint={prizeImage.imageHint}
                />
            </div>
        )}
        <CardHeader className="text-center pt-6">
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
