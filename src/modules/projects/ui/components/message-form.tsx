import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowUpIcon, Loader2Icon } from 'lucide-react';
import TextareaAutosize from 'react-textarea-autosize';
import { toast } from 'sonner';
import { useTRPC } from '@/trpc/client';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form';

type MessageFormProps = {
  projectId: string;
};

const formSchema = z.object({
  content: z
    .string()
    .min(1, 'Content is required')
    .max(10000, 'Content must be less than 10000 characters')
});

export default function MessageForm({ projectId }: MessageFormProps) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const [isFocused, setIsFocused] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: ''
    }
  });

  const { mutateAsync: createMessage, isPending } = useMutation(
    trpc.messages.create.mutationOptions({
      onSuccess: () => {
        form.reset();

        queryClient.invalidateQueries(
          trpc.messages.getMany.queryOptions({
            projectId
          })
        );
      },
      onError: (error) => {
        toast.error(error.message);
      }
    })
  );

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    await createMessage({
      content: values.content,
      projectId
    });
  };

  const isButtonDisabled = !form.formState.isValid || isPending;

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn(
          'bg-sidebar dark:bg-sidebar relative rounded-xl border p-4 pt-1 transition-all',
          isFocused && 'shadow-xs'
        )}
      >
        <FormField
          control={form.control}
          name='content'
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <TextareaAutosize
                  {...field}
                  disabled={isPending}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      form.handleSubmit(onSubmit)(e);
                    }
                  }}
                  minRows={2}
                  maxRows={8}
                  placeholder='What would you like to build?'
                  className='w-full resize-none border-none bg-transparent pt-4 outline-none'
                />
              </FormControl>
            </FormItem>
          )}
        />
        <div className='flex items-end justify-between gap-x-2 pt-2'>
          <div className='text-muted-foreground font-mono text-[10px]'>
            <kbd className='bg-muted text-muted-foreground pointer-events-none ml-auto inline-flex h-5 items-center gap-1 rounded border px-1.5 font-mono text-[10px] font-medium select-none'>
              <span>⌘</span>Enter
            </kbd>
            &nbsp;to submit
          </div>
          <Button
            type='submit'
            size='icon'
            className={cn(
              'size-8 rounded-full',
              isButtonDisabled && 'bg-muted-foreground border'
            )}
            disabled={isButtonDisabled}
          >
            {isPending ? (
              <Loader2Icon className='size-4 animate-spin' />
            ) : (
              <ArrowUpIcon className='size-4' />
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
