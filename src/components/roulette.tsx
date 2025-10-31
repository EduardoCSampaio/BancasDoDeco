
'use client';

import { useState } from 'react';
import { Button } from './ui/button';
import { Crown } from 'lucide-react';
import type { User } from '@/lib/definitions';
import Confetti from 'react-confetti';
import { useWindowSize } from '@/hooks/use-window-size';
import { useFirestore } from '@/firebase';
import { doc, runTransaction, collection, addDoc, serverTimestamp, Firestore, deleteDoc } from 'firebase/firestore';


const colors = [
  '#FFC700', // Gold
  '#FF6B6B', // Light Red
  '#4ECDC4', // Teal
  '#45B7D1', // Sky Blue
  '#FFA07A', // Light Salmon
  '#98D8C8', // Mint
  '#F778A1', // Pink
  '#8A9A5B', // Olive
  '#34568B', // Classic Blue
  '#EFC050', // Mustard
  '#B565A7', // Lilac
  '#009B77', // Sea Green
];

async function handleNewWinner(db: Firestore, winner: User) {
  try {
    // 1. Add to permanent winners collection and increment stats
    const statsDocRef = doc(db, 'stats', 'raffle');
    await runTransaction(db, async (transaction) => {
      const sfDoc = await transaction.get(statsDocRef);
      if (!sfDoc.exists()) {
        transaction.set(statsDocRef, { totalRaffles: 1 });
      } else {
        const newTotal = (sfDoc.data()?.totalRaffles || 0) + 1;
        transaction.update(statsDocRef, { totalRaffles: newTotal });
      }
    });

    const winnersCol = collection(db, 'winners');
    await addDoc(winnersCol, {
      ...winner,
      wonAt: serverTimestamp(),
      status: 'Pendente',
    });

    // 2. Remove winner from the active participants list
    const userRegistrationRef = doc(db, 'user_registrations', winner.id);
    await deleteDoc(userRegistrationRef);


  } catch (error) {
    console.error('Failed to handle new winner:', error);
  }
}


export function Roulette({ participants }: { participants: User[] }) {
  const [spinning, setSpinning] = useState(false);
  const [winner, setWinner] = useState<User | null>(null);
  const [rotation, setRotation] = useState(0);
  const { width, height } = useWindowSize();
  const firestore = useFirestore();

  const participantNames = participants.map((p) => p.name);
  const segmentAngle = participants.length > 0 ? 360 / participants.length : 360;
  const spinDuration = 10000; // Slower spin: 10 seconds

  const spin = () => {
    if (spinning || participants.length === 0 || !firestore) return;

    setWinner(null);
    setSpinning(true);

    const winnerIndex = Math.floor(Math.random() * participants.length);
    const selectedWinner = participants[winnerIndex];

    const spins = 8;
    const baseRotation = rotation - (rotation % 360);
    const targetAngle = 360 - winnerIndex * segmentAngle;
    const randomOffset = (Math.random() - 0.5) * segmentAngle * 0.8;
    const totalRotation = baseRotation + 360 * spins + targetAngle + randomOffset;

    setRotation(totalRotation);

    setTimeout(() => {
      setWinner(selectedWinner);
      setSpinning(false);
      handleNewWinner(firestore, selectedWinner);
    }, spinDuration);
  };

  return (
    <div className="flex flex-col items-center justify-center gap-8 p-4 rounded-lg ">
      {winner && !spinning && <Confetti width={width} height={height} recycle={false} numberOfPieces={500} />}
      <div className="relative w-80 h-80 md:w-96 md:h-96">
        <div
            className="absolute -top-2 left-1/2 -ml-3 w-0 h-0 
            border-l-[12px] border-l-transparent
            border-r-[12px] border-r-transparent
            border-t-[20px] border-t-accent z-20 drop-shadow-lg"
            aria-hidden="true"
        />
        <div
          className="relative w-full h-full rounded-full border-8 border-primary/50 shadow-2xl transition-transform ease-[cubic-bezier(0.25,1,0.5,1)]"
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
                className="relative text-sm font-bold text-black/70 -translate-y-1/3 transform -rotate-90 origin-center whitespace-nowrap"
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
