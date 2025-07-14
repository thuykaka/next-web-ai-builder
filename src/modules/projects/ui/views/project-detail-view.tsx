'use client';

import { useState } from 'react';
import { Suspense } from 'react';
import type { FileCollection } from '@/types/files';
import { Fragment, Message } from '@prisma/client';
import { CodeIcon, CrownIcon, EyeIcon } from 'lucide-react';
import Link from 'next/link';
import { ErrorBoundary } from 'react-error-boundary';
import FragmentPreview from '@/modules/projects/ui/components/fragment-preview';
import MessageContainer from '@/modules/projects/ui/components/message-container';
import ProjectHeader from '@/modules/projects/ui/components/project-header';
import { Button } from '@/components/ui/button';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup
} from '@/components/ui/resizable';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import FileExplore from '@/components/file-explore';
import { InngestProvider } from '../components/inngest-provider';

type ProjectDetailViewProps = {
  projectId: string;
};

export function ProjectDetailView({ projectId }: ProjectDetailViewProps) {
  const [activeFragment, setActiveFragment] = useState<Fragment | null>(null);
  const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview');

  return (
    <div className='h-screen'>
      <ResizablePanelGroup direction='horizontal'>
        <ResizablePanel
          defaultSize={30}
          minSize={20}
          className='flex min-h-0 flex-col'
        >
          <InngestProvider projectId={projectId}>
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
          </InngestProvider>
        </ResizablePanel>
        <ResizableHandle className='hover:bg-primary/10 transition-colors' />
        <ResizablePanel
          defaultSize={70}
          minSize={50}
          className='flex min-h-0 flex-col'
        >
          <Tabs
            defaultValue='preview'
            className='h-full gap-y-0'
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as 'preview' | 'code')}
          >
            <div className='flex w-full items-center gap-x-2 border-b p-2'>
              <TabsList className='h-8 rounded-md border p-0'>
                <TabsTrigger value='preview' className='rounded-md'>
                  <EyeIcon className='h-4 w-4' />
                  <span>Preview</span>
                </TabsTrigger>
                <TabsTrigger value='code' className='rounded-md'>
                  <CodeIcon className='h-4 w-4' />
                  <span>Code</span>
                </TabsTrigger>
              </TabsList>
              <div className='ml-auto flex items-center gap-x-2'>
                <Button variant='default' size='sm' asChild>
                  <Link href={`/projects/${projectId}`}>
                    <CrownIcon className='h-4 w-4' />
                    <span>Upgrade</span>
                  </Link>
                </Button>
              </div>
            </div>
            <TabsContent value='preview'>
              {!!activeFragment && (
                <FragmentPreview fragment={activeFragment} />
              )}
            </TabsContent>
            <TabsContent value='code' className='min-h-0'>
              {!!activeFragment && (
                <FileExplore files={activeFragment.files as FileCollection} />
              )}
            </TabsContent>
          </Tabs>
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
