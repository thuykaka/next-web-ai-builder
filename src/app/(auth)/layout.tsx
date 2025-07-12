import Navbar from '@/modules/home/ui/components/navbar';

export default function AuthLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <main className='flex max-h-screen min-h-screen items-center justify-center'>
      <Navbar />
      <div className='bg-background absolute inset-0 -z-10 h-full w-full bg-[radial-gradient(#dadde2_1px,transparent_1px)] [background-size:16px_16px] dark:bg-[radial-gradient(#393e4a_1px,transparent_1px)]' />
      <div className='flex items-center justify-center'>{children}</div>
    </main>
  );
}
