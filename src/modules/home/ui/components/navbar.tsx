'use client';

import { SignedIn, SignedOut, SignInButton, SignUpButton } from '@clerk/nextjs';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useScroll } from '@/hooks/use-scroll';
import { Button } from '@/components/ui/button';
import UserControl from '@/components/user-control';

export default function Navbar() {
  const isScrolled = useScroll();

  return (
    <nav
      className={cn(
        'fixed top-0 right-0 left-0 z-50 border-b border-transparent bg-transparent p-4 transition-all duration-200',
        isScrolled && 'border-border bg-background'
      )}
    >
      <div className='mx-auto flex w-full max-w-7xl items-center justify-between'>
        <Link href='/'>
          <Image src='/logo.svg' alt='Vibe' width={24} height={24} />
          <span className='text-lg font-semibold'>Vibe</span>
        </Link>
        <SignedOut>
          <div className='flex items-center justify-center gap-2'>
            <SignUpButton>
              <Button variant='outline' size='sm'>
                Sign up
              </Button>
            </SignUpButton>
            <SignInButton>
              <Button size='sm'>Sign in</Button>
            </SignInButton>
          </div>
        </SignedOut>
        <SignedIn>
          <UserControl />
        </SignedIn>
      </div>
    </nav>
  );
}
