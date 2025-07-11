'use client';

import { useState } from 'react';
import { Suspense } from 'react';
import { Fragment } from '@/generated/prisma';
import { ErrorBoundary } from 'react-error-boundary';
import { MessageContainer } from '@/modules/projects/ui/components/message-container';
import ProjectHeader from '@/modules/projects/ui/components/project-header';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup
} from '@/components/ui/resizable';

type ProjectDetailViewProps = {
  projectId: string;
};

export function ProjectDetailView({ projectId }: ProjectDetailViewProps) {
  const [activeFragment, setActiveFragment] = useState<Fragment | null>(null);

  return (
    <div className='h-screen'>
      <ResizablePanelGroup direction='horizontal'>
        <ResizablePanel
          defaultSize={35}
          minSize={20}
          className='flex min-h-0 flex-col'
        >
          <Suspense fallback={<div>Loading project...</div>}>
            <ErrorBoundary fallback={<div>Error loading project...</div>}>
              <ProjectHeader projectId={projectId} />
            </ErrorBoundary>
          </Suspense>
          <Suspense fallback={<div>Loading messages...</div>}>
            <ErrorBoundary fallback={<div>Error loading messages...</div>}>
              <MessageContainer
                projectId={projectId}
                activeFragment={activeFragment}
                setActiveFragment={setActiveFragment}
              />
            </ErrorBoundary>
          </Suspense>
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
