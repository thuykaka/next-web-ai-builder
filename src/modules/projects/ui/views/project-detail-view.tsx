'use client';

type ProjectDetailViewProps = {
  projectId: string;
};

export function ProjectDetailView({ projectId }: ProjectDetailViewProps) {
  return <div>ProjectsView {projectId}</div>;
}

export function ProjectDetailViewLoading() {
  return <div>ProjectViewLoading</div>;
}

export function ProjectDetailViewError() {
  return <div>ProjectViewError</div>;
}
