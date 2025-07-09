import { Agent, openai, createAgent } from '@inngest/agent-kit';
import { inngest } from './client';

export const helloWorld = inngest.createFunction(
  { id: 'hello-world' },
  { event: 'test/hello.world' },
  async ({ event, step }) => {
    const summaryAgent = createAgent({
      name: 'Summary Agent',
      system:
        'You are a helpful assistant that summarizes text. Summarize the text in 2 words.',
      model: openai({ model: 'gpt-4o-mini' })
    });

    const { output } = await summaryAgent.run(
      `Summarize this text: ${event.data.text}`
    );

    return { output };
  }
);
