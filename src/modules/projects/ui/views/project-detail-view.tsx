'use client';

import { useSuspenseQuery } from '@tanstack/react-query';
import { useTRPC } from '@/trpc/client';
import { MessageContainer } from '@/modules/projects/ui/components/message-container';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup
} from '@/components/ui/resizable';

type ProjectDetailViewProps = {
  projectId: string;
};

export function ProjectDetailView({ projectId }: ProjectDetailViewProps) {
  const trpc = useTRPC();

  const { data: project } = useSuspenseQuery(
    trpc.projects.getOne.queryOptions({ id: projectId })
  );

  return (
    <div className='h-screen'>
      <ResizablePanelGroup direction='horizontal'>
        <ResizablePanel
          defaultSize={35}
          minSize={20}
          className='flex min-h-0 flex-col'
        >
          <MessageContainer projectId={projectId} />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel
          defaultSize={65}
          minSize={50}
          className='flex min-h-0 flex-col'
        >
          TODO: Add preview panel
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}

export function ProjectDetailViewLoading() {
  return <div>ProjectViewLoading</div>;
}

export function ProjectDetailViewError() {
  return <div>ProjectViewError</div>;
}
