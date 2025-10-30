'use client';

import { useState } from 'react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import { Crown } from 'lucide-react';

export function Roulette({ participants }: { participants: string[] }) {
  const [spinning, setSpinning] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const [rotation, setRotation] = useState(0);

  const segmentAngle = participants.length > 0 ? 360 / participants.length : 360;

  const spin = () => {
    if (spinning || participants.length === 0) return;

    setWinner(null);
    setSpinning(true);

    const winnerIndex = Math.floor(Math.random() * participants.length);
    const spins = 8;
    const baseRotation = rotation - (rotation % 360);
    const targetAngle = 360 - winnerIndex * segmentAngle;
    const randomOffset = (Math.random() - 0.5) * segmentAngle * 0.8;
    const totalRotation = baseRotation + 360 * spins + targetAngle + randomOffset;

    setRotation(totalRotation);

    setTimeout(() => {
      setWinner(participants[winnerIndex]);
      setSpinning(false);
    }, 6000); // Must match transition duration in CSS
  };

  return (
    <div className="flex flex-col items-center justify-center gap-8 p-4 rounded-lg ">
      <div className="relative w-80 h-80 md:w-96 md:h-96">
        <div
          className="absolute top-1/2 left-1/2 w-4 h-4 -mt-2 -ml-2 bg-accent rounded-full z-20 shadow-lg border-2 border-background"
          aria-hidden="true"
        />
        <div
          className="absolute -top-4 left-1/2 -ml-4 w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-t-8 border-t-primary z-10"
          aria-hidden="true"
        />
        <div
          className="relative w-full h-full rounded-full border-8 border-primary shadow-2xl transition-transform duration-[6000ms] ease-out"
          style={{ transform: `rotate(${rotation}deg)` }}
        >
          {participants.map((name, index) => (
            <div
              key={index}
              className="absolute w-1/2 h-1/2 top-0 left-1/2 origin-bottom-left flex items-center justify-center"
              style={{
                transform: `rotate(${index * segmentAngle}deg)`,
                clipPath: `polygon(0 0, 100% 0, 100% 2px, ${100 - (Math.tan((segmentAngle / 2) * (Math.PI / 180)) * 100)}% 100%, 2px 100%)`,
              }}
            >
              <div
                className={cn(
                  'absolute w-full h-full',
                  index % 2 === 0 ? 'bg-card' : 'bg-secondary'
                )}
              />
              <span
                className="relative text-sm font-bold text-foreground -translate-y-1/3 transform -rotate-90 origin-center whitespace-nowrap"
                style={{ transform: `translateY(-50%) rotate(${segmentAngle / 2 - 90}deg)` }}
              >
                {name.split(' ')[0]}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="text-center h-20">
        {winner && !spinning && (
          <div className="flex flex-col items-center animate-in fade-in zoom-in-95">
            <h3 className="text-sm text-muted-foreground">O Vencedor é:</h3>
            <p className="text-4xl font-bold font-headline text-primary flex items-center gap-2">
              <Crown className="w-8 h-8 text-accent" />
              {winner}
            </p>
          </div>
        )}
      </div>

      <Button
        onClick={spin}
        disabled={spinning || participants.length === 0}
        size="lg"
        className="w-64 bg-accent text-accent-foreground hover:bg-accent/90 text-xl font-bold py-8 rounded-full shadow-lg"
      >
        {spinning ? 'Roletando...' : 'Roletar os Nomes'}
      </Button>
    </div>
  );
}
