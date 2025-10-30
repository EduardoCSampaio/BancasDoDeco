'use client';

import { useState } from 'react';
import { Button } from './ui/button';
import { Crown } from 'lucide-react';
import { handleNewWinner } from '@/lib/actions';
import type { User } from '@/lib/definitions';

const colors = [
  '#FFC700', // Amarelo
  '#FF6B6B', // Vermelho
  '#4ECDC4', // Turquesa
  '#45B7D1', // Azul Céu
  '#FFA07A', // Salmão
  '#98D8C8', // Verde Menta
  '#F778A1', // Rosa
  '#8A9A5B', // Verde Oliva
];

export function Roulette({ participants }: { participants: User[] }) {
  const [spinning, setSpinning] = useState(false);
  const [winner, setWinner] = useState<User | null>(null);
  const [rotation, setRotation] = useState(0);

  const participantNames = participants.map((p) => p.name);
  const segmentAngle = participants.length > 0 ? 360 / participants.length : 360;
  const spinDuration = 8000;

  const spin = () => {
    if (spinning || participants.length === 0) return;

    setWinner(null);
    setSpinning(true);

    const winnerIndex = Math.floor(Math.random() * participants.length);
    const selectedWinner = participants[winnerIndex];

    const spins = 10;
    const baseRotation = rotation - (rotation % 360);
    const targetAngle = 360 - winnerIndex * segmentAngle;
    const randomOffset = (Math.random() - 0.5) * segmentAngle * 0.8;
    const totalRotation = baseRotation + 360 * spins + targetAngle + randomOffset;

    setRotation(totalRotation);

    setTimeout(() => {
      setWinner(selectedWinner);
      setSpinning(false);
      handleNewWinner(selectedWinner);
    }, spinDuration);
  };

  return (
    <div className="flex flex-col items-center justify-center gap-8 p-4 rounded-lg ">
      <div className="relative w-80 h-80 md:w-96 md:h-96">
        <div
            className="absolute -top-2 left-1/2 -ml-3 w-0 h-0 
            border-l-[12px] border-l-transparent
            border-r-[12px] border-r-transparent
            border-t-[20px] border-t-accent z-20 drop-shadow-lg"
            aria-hidden="true"
        />
        <div
          className="relative w-full h-full rounded-full border-8 border-primary/80 shadow-2xl transition-transform ease-[cubic-bezier(0.25,1,0.5,1)]"
          style={{ 
            transitionDuration: `${spinDuration}ms`,
            transform: `rotate(${rotation}deg)` 
          }}
        >
          {participantNames.map((name, index) => (
            <div
              key={index}
              className="absolute w-1/2 h-1/2 top-0 left-1/2 origin-bottom-left flex items-center justify-center"
              style={{
                transform: `rotate(${index * segmentAngle}deg)`,
                clipPath: `polygon(0 0, 100% 0, 100% 2px, ${100 - (Math.tan((segmentAngle / 2) * (Math.PI / 180)) * 100)}% 100%, 2px 100%)`,
                backgroundColor: colors[index % colors.length],
              }}
            >
              <span
                className="relative text-sm font-bold text-black -translate-y-1/3 transform -rotate-90 origin-center whitespace-nowrap"
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
              <Crown className="w-8 h-8 text-yellow-400" />
              {winner.name}
            </p>
          </div>
        )}
      </div>

      <Button
        onClick={spin}
        disabled={spinning || participants.length === 0}
        size="lg"
        className="w-64 bg-accent text-accent-foreground hover:bg-accent/90 text-xl font-bold py-8 rounded-full shadow-lg transform hover:scale-105 transition-transform"
      >
        {spinning ? 'GIRANDO...' : 'GIRAR A ROLETA'}
      </Button>
    </div>
  );
}
