import { useSuspenseQuery } from '@tanstack/react-query';
import { InngestSubscriptionState } from '@inngest/realtime/hooks';
import { ChevronDownIcon, ChevronLeftIcon, SunMoonIcon } from 'lucide-react';
import { useTheme } from 'next-themes';
import Image from 'next/image';
import Link from 'next/link';
import { useTRPC } from '@/trpc/client';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
  DropdownMenuSubContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem
} from '@/components/ui/dropdown-menu';
import {
  InngestConnectionStatus,
  InngestConnectionStatusLabel,
  InngestConnectionStatusIndicator
} from '@/components/inngest-connection-status';
import { useInngest } from './inngest-provider';

type ProjectHeaderProps = {
  projectId: string;
};

export default function ProjectHeader({ projectId }: ProjectHeaderProps) {
  const { setTheme, theme } = useTheme();
  const trpc = useTRPC();
  const { state: realtimeConnectionState } = useInngest();

  const { data: project } = useSuspenseQuery(
    trpc.projects.getOne.queryOptions({ id: projectId })
  );

  const handleThemeChange = (value: string) => {
    setTheme(value);
  };

  return (
    <header className='flex items-center justify-between border-b p-2'>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant='ghost'
            size='sm'
            className='pl-2! transition-opacity hover:bg-transparent hover:opacity-75 focus-visible:ring-0'
          >
            <Image src='/logo.svg' alt='Vibe' width={18} height={18} />
            <span className='text-sm font-medium'>{project.name}</span>
            <ChevronDownIcon className='size-4' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent side='bottom' align='start'>
          <DropdownMenuItem asChild>
            <Link href='/'>
              <ChevronLeftIcon className='size-4' />
              <span>Go to Dashboard</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className='gap-2'>
              <SunMoonIcon className='text-muted-foreground size-4' />
              <span>Appearance</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                <DropdownMenuRadioGroup
                  value={theme}
                  onValueChange={handleThemeChange}
                >
                  <DropdownMenuRadioItem value='light'>
                    <span>Light</span>
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value='dark'>
                    <span>Dark</span>
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value='system'>
                    <span>System</span>
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
        </DropdownMenuContent>
      </DropdownMenu>
      <div className='px-3 pl-2'>
        <InngestConnectionStatus
          status={
            realtimeConnectionState === InngestSubscriptionState.Connecting ||
            realtimeConnectionState === InngestSubscriptionState.RefreshingToken
              ? 'connecting'
              : realtimeConnectionState === InngestSubscriptionState.Active
                ? 'connected'
                : 'disconnected'
          }
        >
          <InngestConnectionStatusIndicator />
          <InngestConnectionStatusLabel />
        </InngestConnectionStatus>
      </div>
    </header>
  );
}
