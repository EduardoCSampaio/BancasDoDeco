'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Users, Trophy, Gift } from 'lucide-react';

const links = [
  { name: 'Participantes', href: '/dashboard', icon: Users },
  { name: 'Roleta', href: '/dashboard/roulette', icon: Gift },
  { name: 'Ganhadores', href: '/dashboard/winners', icon: Trophy },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <nav className="flex justify-center items-center gap-2 p-2 rounded-lg bg-card border shadow-sm">
      {links.map((link) => {
        const LinkIcon = link.icon;
        return (
          <Link
            key={link.name}
            href={link.href}
            passHref
          >
            <Button
              variant={pathname === link.href ? 'secondary' : 'ghost'}
              className={cn(
                "flex-1 justify-center gap-2 text-base transition-all duration-300",
                pathname === link.href ? "text-primary font-semibold" : ""
              )}
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
