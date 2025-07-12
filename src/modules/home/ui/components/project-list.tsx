'use client';

import { formatDistanceToNow } from 'date-fns';
import { useQuery } from '@tanstack/react-query';
import { useUser } from '@clerk/nextjs';
import Image from 'next/image';
import Link from 'next/link';
import { useTRPC } from '@/trpc/client';
import { Button } from '@/components/ui/button';

export default function ProjectList() {
  const trpc = useTRPC();

  const { user } = useUser();

  const { data: projects } = useQuery(
    trpc.projects.getMany.queryOptions(undefined, {
      enabled: !!user
    })
  );

  if (!user) {
    return null;
  }

  return (
    <div className='dark:bg-sidebar flex w-full flex-col gap-y-6 rounded-xl border bg-white p-8 sm:gap-y-4'>
      <h2 className='text-2xl font-semibold'>
        {user.firstName}'s Saved Projects
      </h2>
      <div className='grid grid-cols-1 gap-6 sm:grid-cols-3'>
        {!projects || projects.length === 0 ? (
          <div className='col-span-full text-center'>
            <p>No projects found </p>
          </div>
        ) : (
          projects.map((project) => (
            <Button
              key={project.id}
              variant='outline'
              className='h-auto w-full justify-start p-2 text-start font-normal'
              asChild
            >
              <Link href={`/projects/${project.id}`}>
                <div className='flex items-center gap-x-4'>
                  <Image
                    src='/logo.svg'
                    alt={project.name}
                    width={28}
                    height={28}
                    className='object-contain'
                  />
                  <div className='flex flex-col'>
                    <h3 className='truncate font-medium'>{project.name}</h3>
                    <p className='text-muted-foreground text-xs'>
                      {formatDistanceToNow(project.updatedAt, {
                        addSuffix: true
                      })}
                    </p>
                  </div>
                </div>
              </Link>
            </Button>
          ))
        )}
      </div>
    </div>
  );
}
