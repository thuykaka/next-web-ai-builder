import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { getQueryClient, prefetch, trpcServer } from '@/trpc/server';
import { ProjectDetailView } from '@/modules/projects/ui/views/project-detail-view';

type ProjectPageProps = {
  params: Promise<{ projectId: string }>;
};

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { projectId } = await params;
  const queryClient = getQueryClient();

  prefetch(trpcServer.messages.getMany.queryOptions({ projectId }));
  prefetch(trpcServer.projects.getOne.queryOptions({ id: projectId }));

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ProjectDetailView projectId={projectId} />
    </HydrationBoundary>
  );
}
