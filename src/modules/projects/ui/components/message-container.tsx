import { useRef, useEffect } from 'react';
import { useSuspenseQuery } from '@tanstack/react-query';
import { Fragment } from '@prisma/client';
import { useTRPC } from '@/trpc/client';
import MessageCard from '@/modules/projects/ui/components/message-card';
import MessageForm from '@/modules/projects/ui/components/message-form';
import MessageLoading from '@/modules/projects/ui/components/message-loading';

type MessageContainerProps = {
  projectId: string;
  activeFragment: Fragment | null;
  setActiveFragment: (fragment: Fragment) => void;
};

export default function MessageContainer({
  projectId,
  activeFragment,
  setActiveFragment
}: MessageContainerProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const lastAssitantMessageIdRef = useRef<string | null>(null);

  const trpc = useTRPC();

  const { data: messages, isPending } = useSuspenseQuery(
    trpc.messages.getMany.queryOptions(
      { projectId },
      {
        refetchInterval: 2000
      }
    )
  );

  useEffect(() => {
    const lastAssitantMessage = messages.findLast(
      (message) => message.role === 'ASSISTANT'
    );
    if (
      lastAssitantMessage?.fragment &&
      lastAssitantMessage?.id !== lastAssitantMessageIdRef.current
    ) {
      setActiveFragment(lastAssitantMessage.fragment as any);
      lastAssitantMessageIdRef.current = lastAssitantMessage.id;
    }
  }, [messages, setActiveFragment]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  if (isPending || !messages) {
    return <div>Loading...</div>;
  }

  const lastMessage = messages[messages.length - 1];
  const isLastMessageFromUser = lastMessage?.role === 'USER';

  return (
    <div className='flex min-h-0 flex-1 flex-col'>
      <div className='min-h-0 flex-1 overflow-y-auto'>
        <div className='pt-2 pr-1'>
          {messages.map((message) => (
            <MessageCard
              key={message.id}
              content={message.content}
              role={message.role}
              fragment={message.fragment as any}
              createdAt={message.createdAt}
              isActiveFragment={activeFragment?.id === message.fragment?.id}
              onFragmentClick={() => setActiveFragment(message.fragment as any)}
              type={message.type}
            />
          ))}
          {isLastMessageFromUser && <MessageLoading />}
          <div ref={bottomRef} />
        </div>
      </div>
      <div className='relative p-3 pt-1'>
        <div className='to-background/70 pointer-events-none absolute -top-6 right-0 left-0 h-6 bg-gradient-to-b from-transparent' />
        <MessageForm projectId={projectId} />
      </div>
    </div>
  );
}
