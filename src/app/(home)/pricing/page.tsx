'use client';

import { PricingTable } from '@clerk/nextjs';
import { dark } from '@clerk/themes';
import Image from 'next/image';
import { useCurrentTheme } from '@/hooks/use-current-theme';

export default function PricingPage() {
  const currentTheme = useCurrentTheme();

  return (
    <div className='mx-auto flex w-full max-w-7xl flex-col'>
      <section className='space-y-6 pt-[10vh] 2xl:pt-32'>
        <div className='flex flex-col items-center'>
          <Image
            src='/logo.svg'
            alt='logo'
            width={50}
            height={50}
            className='hidden md:block'
          />
        </div>
        <h1 className='text-center text-xl font-bold md:text-3xl'>Pricing</h1>
        <p className='text-muted-foreground text-center text-sm md:text-base'>
          Choose the plan that's right for you
        </p>
        <PricingTable
          appearance={{
            elements: {
              pricingTableCard: 'rounded-lg! border! shadow-none!'
            },
            baseTheme: currentTheme === 'dark' ? dark : undefined
          }}
        />
      </section>
    </div>
  );
}
