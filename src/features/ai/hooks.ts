import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { OpenRouterService, Message, ChatCompletionRequest } from './service';
import { systemPrompt } from './prompt';
 

interface UseChatOptions {
  apiKey: string;
  model?: string;
}


export function useChat({ apiKey, model }: UseChatOptions) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const service = new OpenRouterService(apiKey, model);

  const sendMessage = useCallback(
    async (content: string) => {
      try {
        setIsLoading(true);
        
        const userMessage: Message = {
          role: 'user',
          content,
        };

        setMessages((prev) => [...prev, userMessage]);

        const request: ChatCompletionRequest = {
          messages: [
            { role: 'system', content: systemPrompt },
            ...messages,
            userMessage
          ],
        };

        const response = await service.createChatCompletion(request);
        
        if (!response.choices?.[0]?.message) {
          throw new Error('Invalid response format: missing message in choices');
        }
        
        const assistantMessage = response.choices[0].message;
        if (typeof assistantMessage.content !== 'string' || !assistantMessage.role) {
          throw new Error('Invalid message format: missing content or role');
        }

        setMessages((prev) => [...prev, assistantMessage]);
        return assistantMessage;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to send message';
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
        });
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [messages, service, toast]
  );

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    messages,
    isLoading,
    sendMessage,
    clearMessages,
  };
}