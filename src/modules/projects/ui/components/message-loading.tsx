import { useEffect, useState } from 'react';
import Image from 'next/image';

const ShimmerMessages = () => {
  const messages = [
    'Thinking...',
    'Loading...',
    'Generating...',
    'Analyzing your request...',
    'Building your website...',
    'Crafting components...',
    'Optimizing layout...',
    'Add final touches...',
    'Almost ready...'
  ];
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messages.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className='flex items-center gap-2'>
      <span className='text-muted-foreground animate-pulse text-base'>
        {messages[messageIndex]}
      </span>
    </div>
  );
};

export default function MessageLoading() {
  return (
    <div className='group flex flex-col px-2 pb-4'>
      <div className='mb-2 flex items-center gap-2 pl-2'>
        <Image
          src='/logo.svg'
          alt='Vibe'
          width={18}
          height={18}
          className='shrink-0'
        />
        <span className='text-sm font-medium'>Vibe</span>
      </div>
      <div className='flex flex-col gap-y-4 pl-8.5'>
        <ShimmerMessages />
      </div>
    </div>
  );
}
