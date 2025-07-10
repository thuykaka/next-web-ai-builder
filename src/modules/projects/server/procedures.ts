import { z } from 'zod';
import { inngest } from '@/inngest/client';
import { generateSlug } from 'random-word-slugs';
import { createTRPCRouter, baseProcedure } from '@/trpc/init';
import prisma from '@/lib/db';

export const projectsRouter = createTRPCRouter({
  getMany: baseProcedure.query(async () => {
    const projects = await prisma.project.findMany({
      orderBy: {
        updatedAt: 'asc'
      }
    });
    return projects;
  }),
  getOne: baseProcedure
    .input(
      z.object({
        id: z.string()
      })
    )
    .query(async ({ input }) => {
      const project = await prisma.project.findUnique({
        where: { id: input.id }
      });
      return project;
    }),
  create: baseProcedure
    .input(
      z.object({
        content: z
          .string()
          .min(1, 'Content is required')
          .max(10000, 'Content is too long')
      })
    )
    .mutation(async ({ input }) => {
      const newProject = await prisma.project.create({
        data: {
          name: generateSlug(2, { format: 'kebab' }),
          messages: {
            create: {
              content: input.content,
              role: 'USER',
              type: 'RESULT'
            }
          }
        }
      });

      await inngest.send({
        name: 'code-agent/run',
        data: {
          text: input.content,
          projectId: newProject.id
        }
      });

      return newProject;
    })
});
