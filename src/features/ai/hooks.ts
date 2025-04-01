import { useState, useCallback, useMemo, createElement } from 'react';
import { useToast } from '@/hooks/use-toast';
import { OpenRouterService } from './service';
import type { Message, ChatCompletionRequest, ChatCompletionResponseMessage, ToolCall } from './service';
import { useSystemPrompt } from './prompts/useSystemPrompt';
import ProfileCard from '@/components/ProfileCard';
import { useChatStore } from '../store/chatStore';
import { useSkillsStore } from '../store/skillsStore';
import { useProfileStore } from '../store/profileStore';
import { savePersonalInfoTool } from './tools/savePersonalInfoTool';
import { saveSkillsTool } from './tools/saveSkillsTool';

const availableTools: { [key: string]: (args: any) => Promise<object> } = {
  save_personal_info: savePersonalInfoTool,
  save_skills: saveSkillsTool,
};

export type QuickAction = 'SHOW_PROFILE' | 'SHOW_SKILLS' | 'SHOW_EXPERIENCE' | 'PREVIEW_CV';

interface UseChatOptions {
  apiKey: string;
  model?: string;
}

export function useChat({ apiKey, model }: UseChatOptions) {
  const messages = useChatStore((state) => state.messages);
  const addMessage = useChatStore((state) => state.addMessage);
  const addMessages = useChatStore((state) => state.addMessages);
  const clearStoreMessages = useChatStore((state) => state.clearMessages);
  const deleteMessage = useChatStore((state) => state.deleteMessage);

  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { systemPromptString, toolDefinitions } = useSystemPrompt();

  const handleQuickAction = useCallback((action: QuickAction) => {
    const { addMessage: _addMessage } = useChatStore.getState();

    switch (action) {
      case 'SHOW_PROFILE': {
        _addMessage({
          id: `quick-action-${Date.now()}`,
          role: 'assistant',
          content: 'ProfileCardWithData',
          isLocal: true
        });
        break;
      }
      case 'SHOW_SKILLS': {        
        _addMessage({
          id: `quick-action-${Date.now()}`,
          role: 'assistant',
          content: 'SkillsCardWithData',
          isLocal: true
        });
        break;
      }
      default:
        console.warn(`Unhandled quick action: ${action}`);
        toast({
          title: 'Warning',
          description: `Acción rápida "${action}" no implementada.`,
          variant: 'default'
        });
    }
  }, [toast]);

  const service = useMemo(() => {
    const effectiveModel = model || 'google/gemini-flash-1.5';
    if (!apiKey || !effectiveModel) return null;
    console.log(`Initializing OpenRouterService with model: ${effectiveModel}`);
    return new OpenRouterService(apiKey, effectiveModel);
  }, [apiKey, model]);

  const processChatTurn = useCallback(async (messagesForApi: Message[]) => {
    const { addMessage: _addMessage, addMessages: _addMessages } = useChatStore.getState();

    if (!service || !systemPromptString) {
      toast({ title: 'Error', description: 'Chat service not initialized.', variant: 'destructive' });
      setIsLoading(false);
      return;
    }
    if(!isLoading) setIsLoading(true);

    try {
      const request: ChatCompletionRequest = {
        messages: [
          { role: 'system', content: systemPromptString },
          ...messagesForApi
        ],
        ...(toolDefinitions && toolDefinitions.length > 0 && {
          tools: toolDefinitions,
          tool_choice: "auto"
        })
      };

      const response = await service.createChatCompletion(request);

      if (!response.choices?.[0]?.message) {
        throw new Error('Invalid API response: missing message structure');
      }

      const assistantMessage = response.choices[0].message as ChatCompletionResponseMessage;
      if (!assistantMessage.role) assistantMessage.role = 'assistant';

      _addMessage(assistantMessage);

      if (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
        console.log("Handling tool calls:", assistantMessage.tool_calls);

        const toolResultsPromises = assistantMessage.tool_calls.map(async (toolCall: ToolCall) => {
          const functionName = toolCall.function.name;
          const functionToCall = availableTools[functionName];
          let functionResultContent: string;
          let functionArguments = {};

          try {
            if (toolCall.function.arguments) {
              functionArguments = JSON.parse(toolCall.function.arguments);
            }
            if (functionToCall) {
              const result = await functionToCall(functionArguments);
              functionResultContent = JSON.stringify(result);
            } else {
              throw new Error(`Unknown tool function: ${functionName}`);
            }
          } catch (toolError) {
            const errorMessage = toolError instanceof Error ? toolError.message : 'Unknown tool execution error';
            console.error(`Error executing tool ${functionName}:`, errorMessage);
            toast({
              title: 'Tool Error',
              description: `Failed to execute tool ${functionName}: ${errorMessage}`,
              variant: 'destructive'
            });
            functionResultContent = JSON.stringify({ error: errorMessage });
          }

          return {
            role: 'tool',
            tool_call_id: toolCall.id,
            content: functionResultContent,
          } as Message;
        });

        const resolvedToolResults = (await Promise.all(toolResultsPromises)).filter(result => result !== null) as Message[];

        if (resolvedToolResults.length > 0) {
          console.log("Adding tool results to messages:", resolvedToolResults);
          _addMessages(resolvedToolResults);
          const currentMessages = useChatStore.getState().messages;
          await processChatTurn(currentMessages.slice(-20));
        } else {
          console.error("No valid tool results obtained.");
          toast({ title: 'Error', description: 'Failed to process tool requests.', variant: 'destructive'});
          setIsLoading(false);
        }
      }
      else if (assistantMessage.content !== null || response.choices[0].finish_reason === 'stop') {
        console.log("Final assistant response received (or stop reason).");
        setIsLoading(false);
      }
      else {
        console.warn("Received unexpected assistant message format/finish reason:", assistantMessage, response.choices[0].finish_reason);
        toast({ title: 'Info', description: 'Assistant provided an empty or unexpected response.', variant: 'default' });
        setIsLoading(false);
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to process message';
      console.error("Error in processChatTurn:", errorMessage, error);
      toast({ title: 'Chat Error', description: `Failed to get response: ${errorMessage}`, variant: 'destructive' });
      setIsLoading(false);
    }
  }, [service, systemPromptString, toolDefinitions, toast, isLoading]);

  const sendMessage = useCallback(
    async (message: Message) => {
      const { addMessage: _addMessage } = useChatStore.getState();
      const currentMessages = useChatStore.getState().messages;

      if (message.role !== 'user') { console.warn("Non-user message passed to sendMessage"); return; }
      if (typeof message.content !== 'string' && !Array.isArray(message.content)) { return; }
      if (Array.isArray(message.content) && message.content.length === 0) { return; }

      const historyForAPI = [...currentMessages, message];
      const limitedHistory = historyForAPI.slice(-20);

      _addMessage(message);

      try {
        await processChatTurn(limitedHistory);
      } catch (error) {
        console.error("Error initiating chat processing:", error);
        toast({
          title: 'Error',
          description: `Failed to send message: ${error instanceof Error ? error.message : 'Unknown error'}`,
          variant: 'destructive'
        });
        setIsLoading(false);
      }
    },
    [processChatTurn, toast]
  );

  const clearMessages = useCallback(() => {
    const { clearMessages: _clearMessages } = useChatStore.getState();
    _clearMessages();
  }, []);

  // Add handleDeleteMessage function
  const handleDeleteMessage = useCallback((id: string) => {
    const { deleteMessage: _deleteMessage } = useChatStore.getState();
    _deleteMessage(id);
  }, []);

  return {
    messages,
    isLoading,
    sendMessage,
    clearMessages,
    handleQuickAction,
    handleDeleteMessage, // Export the delete handler
  };
}