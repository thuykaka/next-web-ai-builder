import { HydrateClient, prefetch, trpcServer } from '@/trpc/server';
import {
  ProjectDetailView,
  ProjectDetailViewLoading,
  ProjectDetailViewError
} from '@/modules/projects/ui/views/project-detail-view';

type ProjectPageProps = {
  params: Promise<{ projectId: string }>;
};

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { projectId } = await params;

  prefetch(trpcServer.projects.getOne.queryOptions({ id: projectId }));

  return (
    <HydrateClient
      suspenseFallback={<ProjectDetailViewLoading />}
      errorFallback={<ProjectDetailViewError />}
    >
      <ProjectDetailView projectId={projectId} />
    </HydrateClient>
  );
}
