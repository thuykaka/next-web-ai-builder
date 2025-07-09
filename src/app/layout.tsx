import type { Metadata } from 'next';
import NextTopLoader from 'nextjs-toploader';
import { TRPCReactProvider } from '@/trpc/client';
import { fontVariables } from '@/lib/font';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/sonner';
import './globals.css';

export const metadata: Metadata = {
  title: 'Next Web AI Builder',
  description: 'Next Web AI Builder'
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en' suppressHydrationWarning>
      <body
        className={cn(
          'overflow-hidden overscroll-none font-sans antialiased',
          fontVariables
        )}
      >
        <NextTopLoader showSpinner={false} color='var(--primary)' />
        <TRPCReactProvider>
          <Toaster />
          {children}
        </TRPCReactProvider>
      </body>
    </html>
  );
}
