import { z } from 'zod';
import { inngest } from '@/inngest/client';
import { TRPCError } from '@trpc/server';
import {
  createTRPCRouter,
  protectedProcedure,
  protectedUsageProcedure
} from '@/trpc/init';
import prisma from '@/lib/db';

export const messagesRouter = createTRPCRouter({
  getMany: protectedProcedure
    .input(
      z.object({
        projectId: z.string().min(1, 'Project ID is required')
      })
    )
    .query(async ({ input, ctx }) => {
      const messages = await prisma.message.findMany({
        where: {
          projectId: input.projectId,
          project: {
            userId: ctx.auth.userId
          }
        },
        orderBy: {
          updatedAt: 'asc'
        },
        include: {
          fragment: true
        }
      });

      return messages;
    }),
  create: protectedUsageProcedure
    .input(
      z.object({
        content: z
          .string()
          .min(1, 'Content is required')
          .max(10000, 'Content is too long'),
        projectId: z.string().min(1, 'Project ID is required')
      })
    )
    .mutation(async ({ input, ctx }) => {
      const project = await prisma.project.findUnique({
        where: {
          id: input.projectId,
          userId: ctx.auth.userId
        }
      });

      if (!project) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Project not found'
        });
      }

      const newMessage = await prisma.message.create({
        data: {
          projectId: project.id,
          content: input.content,
          role: 'USER',
          type: 'RESULT'
        }
      });

      await inngest.send({
        name: 'code-agent/run',
        data: {
          text: input.content,
          projectId: input.projectId
        }
      });

      return newMessage;
    })
});
