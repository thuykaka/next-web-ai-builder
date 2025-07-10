import { z } from 'zod';
import { inngest } from '@/inngest/client';
import { createTRPCRouter, baseProcedure } from '@/trpc/init';
import prisma from '@/lib/db';

export const messagesRouter = createTRPCRouter({
  getMany: baseProcedure.query(async () => {
    const messages = await prisma.message.findMany({
      orderBy: {
        updatedAt: 'asc'
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
        content: z.string().min(1, 'Content is required')
      })
    )
    .mutation(async ({ input }) => {
      const newMessage = await prisma.message.create({
        data: {
          content: input.content,
          role: 'USER',
          type: 'RESULT'
        }
      });

      await inngest.send({
        name: 'code-agent/run',
        data: {
          text: input.content
        }
      });

      return newMessage;
    })
});
