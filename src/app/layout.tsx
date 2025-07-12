import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import NextTopLoader from 'nextjs-toploader';
import { TRPCReactProvider } from '@/trpc/client';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from '@/components/theme-provider';
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
        className={cn('overflow-hidden overscroll-none font-sans antialiased')}
      >
        <NextTopLoader showSpinner={false} color='var(--primary)' />
        <ClerkProvider>
          <TRPCReactProvider>
            <ThemeProvider
              attribute='class'
              defaultTheme='system'
              enableSystem
              disableTransitionOnChange
            >
              <Toaster richColors />
              {children}
            </ThemeProvider>
          </TRPCReactProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
