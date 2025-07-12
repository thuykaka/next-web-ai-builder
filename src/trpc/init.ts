import { cache } from 'react';
import { auth } from '@clerk/nextjs/server';
import { initTRPC, TRPCError } from '@trpc/server';
import superjson from 'superjson';
import { consumeCredits } from '@/lib/usage';

export const createTRPCContext = cache(async () => {
  /**
   * @see: https://trpc.io/docs/server/context
   */
  return { auth: await auth() };
});

export type TRPCContext = Awaited<ReturnType<typeof createTRPCContext>>;

// Avoid exporting the entire t-object
// since it's not very descriptive.
// For instance, the use of a t variable
// is common in i18n libraries.
const t = initTRPC.context<TRPCContext>().create({
  /**
   * @see https://trpc.io/docs/server/data-transformers
   */
  transformer: superjson
});

const isAuthenticated = t.middleware(async ({ ctx, next }) => {
  if (!ctx.auth.userId) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'You must be logged in to access this resource'
    });
  }
  return next({
    ctx: {
      ...ctx,
      auth: ctx.auth
    }
  });
});

const isProtectedUsage = isAuthenticated.unstable_pipe(
  async ({ ctx, next }) => {
    try {
      await consumeCredits();
    } catch (error) {
      console.error('Failed to consume credits:', error);

      if (error instanceof Error) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Failed to process request. Please try again.'
        });
      }

      throw new TRPCError({
        code: 'TOO_MANY_REQUESTS',
        message: 'You have no credits remaining. Please upgrade your plan.'
      });
    }

    return next({ ctx });
  }
);

// Base router and procedure helpers
export const createTRPCRouter = t.router;

export const createCallerFactory = t.createCallerFactory;

export const baseProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(isAuthenticated);

export const protectedUsageProcedure = t.procedure.use(isProtectedUsage);
