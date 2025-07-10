import { useRef, useEffect } from 'react';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useTRPC } from '@/trpc/client';
import MessageCard from '@/modules/projects/ui/components/message-card';
import MessageForm from '@/modules/projects/ui/components/message-form';

type MessageContainerProps = {
  projectId: string;
};

export function MessageContainer({ projectId }: MessageContainerProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const trpc = useTRPC();

  const { data: messages, isPending } = useSuspenseQuery(
    trpc.messages.getMany.queryOptions({ projectId })
  );

  useEffect(() => {
    const lastAssumedMessage = messages.findLast(
      (message) => message.role === 'ASSISTANT'
    );
    if (lastAssumedMessage) {
      // TODO: SET ACTIVE FRAGMENT TO THE LAST ASSUMED MESSAGE
    }
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  if (isPending || !messages) {
    return <div>Loading...</div>;
  }

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
              isActiveFragment={false}
              onFragmentClick={() => {}}
              type={message.type}
            />
          ))}
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
