import { z } from 'zod';
import { Sandbox } from '@e2b/code-interpreter';
import {
  createAgent,
  createNetwork,
  createTool,
  openai
} from '@inngest/agent-kit';
import { getLastAssitantTextMessageContent, getSandbox } from '@/lib/sandbox';
import { PROMPT } from '@/constants/prompt';
import { inngest } from './client';

export const helloWorld = inngest.createFunction(
  { id: 'hello-world' },
  { event: 'test/hello.world' },
  async ({ event, step }) => {
    const sandboxId = await step.run('get-sandbox-id', async () => {
      const sandbox = await Sandbox.create('next-web-ai-builder-3');
      return sandbox.sandboxId;
    });

    const codeAgent = createAgent({
      name: 'Code Agent',
      description: 'An expert coding agent',
      system: PROMPT,
      model: openai({
        model: 'gpt-4.1',
        defaultParameters: { temperature: 0.1 }
      }),
      tools: [
        createTool({
          name: 'terminal',
          description: 'Run terminal commands',
          parameters: z.object({
            command: z.string()
          }),
          handler: async ({ command }) => {
            return await step?.run('run-command', async () => {
              const output = { stdout: '', stderr: '' };

              try {
                const sandbox = await getSandbox(sandboxId);
                const result = await sandbox.commands.run(command, {
                  onStdout(data) {
                    output.stdout += data;
                  },
                  onStderr(data) {
                    output.stderr += data;
                  }
                });

                return result.stdout;
              } catch (err) {
                const errorMessage = `Error running command: ${command}\n stdout:${output.stdout}\n stderr:${output.stderr}`;
                console.log(errorMessage);
                return errorMessage;
              }
            });
          }
        }),
        createTool({
          name: 'createOrUpdateFiles',
          description: 'Create or update a file in the sandbox',
          parameters: z.object({
            files: z.array(
              z.object({
                path: z.string(),
                content: z.string()
              })
            )
          }),
          handler: async ({ files }, { step, network }) => {
            const newFiles = await step?.run(
              'create-or-update-files',
              async () => {
                try {
                  const updateFiles = network.state.data.files || {};
                  const sandbox = await getSandbox(sandboxId);

                  for (const file of files) {
                    await sandbox.files.write(file.path, file.content);
                    updateFiles[file.path] = file.content;
                  }

                  return updateFiles;
                } catch (err) {
                  return `Error: ${err}`;
                }
              }
            );

            if (typeof newFiles === 'object') {
              network.state.data.files = newFiles;
            }
          }
        }),
        createTool({
          name: 'readFiles',
          description: 'Read files from the sandbox',
          parameters: z.object({
            files: z.array(z.string())
          }),
          handler: async ({ files }, { step, network }) => {
            return await step?.run('read-files', async () => {
              try {
                const sandbox = await getSandbox(sandboxId);
                const contents = [];

                for (const file of files) {
                  const fileContent = await sandbox.files.read(file);
                  contents.push({ path: file, content: fileContent });
                }

                return JSON.stringify(contents);
              } catch (err) {
                return `Error: ${err}`;
              }
            });
          }
        })
      ],
      lifecycle: {
        onResponse({ result, network }) {
          const lastAssistantMessageText =
            getLastAssitantTextMessageContent(result);

          if (lastAssistantMessageText && network) {
            if (lastAssistantMessageText.includes('<task_summary>')) {
              network.state.data.taskSummary = lastAssistantMessageText;
            }
          }

          return result;
        }
      }
    });

    const network = createNetwork({
      name: 'code-agent-network',
      agents: [codeAgent],
      maxIter: 15,
      router: async ({ network }) => {
        const taskSummary = network.state.data.taskSummary;
        if (taskSummary) {
          return;
        }
        return codeAgent;
      }
    });

    const result = await network.run(event.data.text);

    const sandboxUrl = await step.run('get-sandbox-url', async () => {
      const sandbox = await getSandbox(sandboxId);
      const host = sandbox.getHost(3000);
      return `https://${host}`;
    });

    return {
      url: sandboxUrl,
      title: 'Fragment',
      files: result.state.data.files,
      summary: result.state.data.taskSummary
    };
  }
);
