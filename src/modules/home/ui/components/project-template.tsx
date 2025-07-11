import { PROJECT_TEMPLATES } from '@/constants/projects';
import { Button } from '@/components/ui/button';

type ProjectTemplateProps = {
  onSelect: (prompt: string) => void;
};

export default function ProjectTemplate({ onSelect }: ProjectTemplateProps) {
  return (
    <div className='hidden max-w-3xl flex-wrap justify-center gap-2 md:flex'>
      {PROJECT_TEMPLATES.map((project) => (
        <Button
          key={project.title}
          variant='outline'
          size='sm'
          className='dark:bg-sidebar bg-white'
          onClick={() => onSelect(project.prompt)}
        >
          {project.emoji} {project.title}
        </Button>
      ))}
    </div>
  );
}
