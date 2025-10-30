'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Users, RouletteWheelIcon, Trophy } from 'lucide-react';

const links = [
  { name: 'Participantes', href: '/dashboard', icon: Users },
  { name: 'Roleta', href: '/dashboard/roulette', icon: RouletteWheelIcon },
  { name: 'Ganhadores', href: '/dashboard/winners', icon: Trophy },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <nav className="flex justify-center items-center gap-2 p-2 rounded-lg bg-card border shadow-md">
      {links.map((link) => {
        const LinkIcon = link.icon;
        return (
          <Link
            key={link.name}
            href={link.href}
            passHref
          >
            <Button
              variant={pathname === link.href ? 'default' : 'ghost'}
              className="flex-1 justify-center gap-2"
            >
              <LinkIcon className="w-5 h-5" />
              <span>{link.name}</span>
            </Button>
          </Link>
        );
      })}
    </nav>
  );
}
