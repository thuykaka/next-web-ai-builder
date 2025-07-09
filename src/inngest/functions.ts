import { Sandbox } from '@e2b/code-interpreter';
import { Agent, openai, createAgent } from '@inngest/agent-kit';
import { getSandbox } from '@/lib/sandbox';
import { inngest } from './client';

export const helloWorld = inngest.createFunction(
  { id: 'hello-world' },
  { event: 'test/hello.world' },
  async ({ event, step }) => {
    const sandboxId = await step.run('get-sandbox-id', async () => {
      const sandbox = await Sandbox.create('next-web-ai-builder-3');
      return sandbox.sandboxId;
    });

    const summaryAgent = createAgent({
      name: 'Code Agent',
      system:
        'You are an expert Next.js developer. You are given a task to build a Next.js app with shadcn/ui, zustand.',
      model: openai({ model: 'gpt-4o-mini' })
    });

    const { output } = await summaryAgent.run(
      `Write the following code: ${event.data.text}`
    );

    const sandboxUrl = await step.run('get-sandbox-url', async () => {
      const sandbox = await getSandbox(sandboxId);
      const host = sandbox.getHost(3000);
      return `https://${host}`;
    });

    return { output, sandboxUrl };
  }
);
