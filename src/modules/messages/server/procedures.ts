import { z } from 'zod';
import { inngest } from '@/inngest/client';
import { createTRPCRouter, baseProcedure } from '@/trpc/init';
import prisma from '@/lib/db';

export const messagesRouter = createTRPCRouter({
  getMany: baseProcedure
    .input(
      z.object({
        projectId: z.string().min(1, 'Project ID is required')
      })
    )
    .query(async ({ input }) => {
      const messages = await prisma.message.findMany({
        where: {
          projectId: input.projectId
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
  getOne: baseProcedure
    .input(
      z.object({
        id: z.string()
      })
    )
    .query(async ({ input }) => {
      const message = await prisma.message.findUnique({
        where: { id: input.id }
      });
      return message;
    }),
  create: baseProcedure
    .input(
      z.object({
        content: z
          .string()
          .min(1, 'Content is required')
          .max(10000, 'Content is too long'),
        projectId: z.string().min(1, 'Project ID is required')
      })
    )
    .mutation(async ({ input }) => {
      const newMessage = await prisma.message.create({
        data: {
          projectId: input.projectId,
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
