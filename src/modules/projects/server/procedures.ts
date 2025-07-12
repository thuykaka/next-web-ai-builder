import { z } from 'zod';
import { inngest } from '@/inngest/client';
import { TRPCError } from '@trpc/server';
import { generateSlug } from 'random-word-slugs';
import {
  createTRPCRouter,
  protectedProcedure,
  protectedUsageProcedure
} from '@/trpc/init';
import prisma from '@/lib/db';

export const projectsRouter = createTRPCRouter({
  getMany: protectedProcedure.query(async ({ ctx }) => {
    const projects = await prisma.project.findMany({
      orderBy: {
        updatedAt: 'asc'
      },
      where: {
        userId: ctx.auth.userId
      }
    });
    return projects;
  }),
  getOne: protectedProcedure
    .input(
      z.object({
        id: z.string().min(1, 'Project ID is required')
      })
    )
    .query(async ({ input, ctx }) => {
      const project = await prisma.project.findUnique({
        where: { id: input.id, userId: ctx.auth.userId }
      });
      if (!project) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Project not found'
        });
      }
      return project;
    }),
  create: protectedUsageProcedure
    .input(
      z.object({
        content: z
          .string()
          .min(1, 'Content is required')
          .max(10000, 'Content is too long')
      })
    )
    .mutation(async ({ input, ctx }) => {
      const newProject = await prisma.project.create({
        data: {
          name: generateSlug(2, { format: 'kebab' }),
          userId: ctx.auth.userId,
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
