import { messagesRouter } from '@/modules/messages/server/procedures';
import { projectsRouter } from '@/modules/projects/server/procedures';
import { usagesRouter } from '@/modules/usage/server/procedures';
import { createTRPCRouter } from '../init';

export const appRouter = createTRPCRouter({
  messages: messagesRouter,
  projects: projectsRouter,
  usages: usagesRouter
});
// export type definition of API
export type AppRouter = typeof appRouter;
