import { z } from 'zod';
import { MessageRole } from '@/generated/prisma';
import {
  createAgent,
  createNetwork,
  createTool,
  openai,
  type Tool as AgentKitTool,
  type Message as AgentKitMessage,
  createState
} from '@inngest/agent-kit';
import prisma from '@/lib/db';
import {
  getLastAssistantTextMessageContent,
  getSandbox,
  createSandbox
} from '@/lib/sandbox';
import {
  FRAGMENT_TITLE_PROMPT,
  PROMPT,
  RESPONSE_PROMPT
} from '@/constants/prompt';
import { projectChannel } from './channels';
import { inngest } from './client';

type AgentState = {
  taskSummary: string;
  files: Record<string, string>;
};

const generatedAgentResponse = (
  output: AgentKitMessage[],
  defaultValue: string
) => {
  if (output[0].type !== 'text') {
    return defaultValue;
  }
  if (Array.isArray(output[0].content)) {
    return output[0].content.map((text) => text.text).join('');
  }
  return output[0].content;
};

export const codeAgentFunction = inngest.createFunction(
  { id: 'code-agent' },
  { event: 'code-agent/run' },
  async ({ event, step, publish }) => {
    const { projectId, text } = event.data;

    const sandboxId = await step.run('get-sandbox-id', async () => {
      const sandbox = await createSandbox();
      return sandbox.sandboxId;
    });

    const previousMessage = await step.run('get-previous-message', async () => {
      const formattedMessages: AgentKitMessage[] = [];

      const messages = await prisma.message.findMany({
        where: {
          projectId
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 5
      });

      for (const message of messages) {
        formattedMessages.push({
          type: 'text',
          role: message.role === MessageRole.USER ? 'user' : 'assistant',
          content: message.content
        });
      }

      return formattedMessages.reverse();
    });

    const state = createState<AgentState>(
      {
        taskSummary: '',
        files: {}
      },
      {
        messages: previousMessage
      }
    );

    const codeAgent = createAgent<AgentState>({
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
          handler: async (
            { files },
            { step, network }: AgentKitTool.Options<AgentState>
          ) => {
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
            getLastAssistantTextMessageContent(result);

          if (lastAssistantMessageText && network) {
            if (lastAssistantMessageText.includes('<task_summary>')) {
              network.state.data.taskSummary = lastAssistantMessageText;
            }
          }

          return result;
        }
      }
    });

    const network = createNetwork<AgentState>({
      name: 'code-agent-network',
      agents: [codeAgent],
      maxIter: 15,
      defaultState: state,
      router: async ({ network }) => {
        const taskSummary = network.state.data.taskSummary;
        if (taskSummary) {
          return;
        }
        return codeAgent;
      }
    });

    const result = await network.run(event.data.text, { state: state });

    const fragmentTitleGenerator = createAgent({
      name: 'Fragment Title Generator',
      description: 'An expert title generator for code fragments',
      system: FRAGMENT_TITLE_PROMPT,
      model: openai({
        model: 'gpt-4o-mini'
      })
    });

    const responseGenerator = createAgent({
      name: 'Response Generator',
      description: 'An expert response generator for code fragments',
      system: RESPONSE_PROMPT,
      model: openai({
        model: 'gpt-4o-mini'
      })
    });

    const [fragmentTitleOutput, responseOutput] = await Promise.all([
      fragmentTitleGenerator.run(result.state.data.taskSummary),
      responseGenerator.run(result.state.data.taskSummary)
    ]);

    const isError =
      !result.state.data.taskSummary ||
      Object.keys(result.state.data.files || {}).length === 0;

    const sandboxUrl = await step.run('get-sandbox-url', async () => {
      const sandbox = await getSandbox(sandboxId);
      const host = sandbox.getHost(3000);
      return `https://${host}`;
    });

    const savedMessage = await step.run('save-message', async () => {
      if (isError) {
        return await prisma.message.create({
          data: {
            projectId: event.data.projectId,
            content: 'Something went wrong. Please try again.',
            role: 'ASSISTANT',
            type: 'ERROR'
          },
          include: {
            fragment: true
          }
        });
      }

      return await prisma.message.create({
        data: {
          projectId: event.data.projectId,
          content: generatedAgentResponse(
            responseOutput.output,
            'Something went wrong. Please try again.'
          ),
          role: 'ASSISTANT',
          type: 'RESULT',
          fragment: {
            create: {
              sandboxUrl,
              title: generatedAgentResponse(
                fragmentTitleOutput.output,
                'Fragment'
              ),
              files: result.state.data.files
            }
          }
        },
        include: {
          fragment: true
        }
      });
    });

    await publish(projectChannel(event.data.projectId).realtime(savedMessage));

    return {
      message: savedMessage,
      url: sandboxUrl,
      title: savedMessage.fragment?.title || 'Fragment',
      files: result.state.data.files,
      summary: result.state.data.taskSummary,
      fragment: savedMessage.fragment
    };
  }
);
