import { useToast } from '@/hooks/use-toast';
import { useCallback, useMemo, useState } from 'react';
import { useChatStore } from '../../store/chatStore';
import { useSystemPrompt } from '../prompts/useSystemPrompt';
import type { ChatCompletionRequest, ChatCompletionResponseMessage, Message, ToolCall } from '../services/aiService';
import { OpenRouterService } from '../services/aiService';
import { savePersonalInfoTool } from '../tools/savePersonalInfoTool';
import { saveSkillsTool } from '../tools/saveSkillsTool';

// Define available tools
const availableTools: { [key: string]: (args: unknown) => Promise<object> } = {
  save_personal_info: savePersonalInfoTool as (args: unknown) => Promise<object>,
  save_skills: saveSkillsTool as (args: unknown) => Promise<object>,
};

interface UseAIOptions {
  addMessage: (text: string, sender: 'user' | 'bot' | 'system', suggestions?: string[] | null) => void;
  apiKey: string;
  model?: string;
}

export function useAI({ addMessage, apiKey, model }: UseAIOptions) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const storeMessages = useChatStore((state) => state.messages);
  const addStoreMessage = useChatStore((state) => state.addMessage);
  const addStoreMessages = useChatStore((state) => state.addMessages);
  const { systemPromptString, toolDefinitions } = useSystemPrompt();
  
  // Initialize the OpenRouter service
  const service = useMemo(() => {
    const effectiveModel = model || 'google/gemini-flash-1.5';
    if (!apiKey || !effectiveModel) return null;
    console.log(`Initializing OpenRouterService with model: ${effectiveModel}`);
    return new OpenRouterService(apiKey, effectiveModel);
  }, [apiKey, model]);
  
  const processChatTurn = useCallback(async (messagesForApi: Message[]) => {
    if (!service || !systemPromptString) {
      toast({ title: 'Error', description: 'Chat service not initialized.', variant: 'destructive' });
      setIsLoading(false);
      return;
    }
    if(!isLoading) setIsLoading(true);

    console.log("Processing chat turn with messages:", messagesForApi);

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

      // Add the assistant's message to the store
      addStoreMessage(assistantMessage);
      
      // Add the message to the UI if it's text content
      if (typeof assistantMessage.content === 'string') {
        addMessage(assistantMessage.content, 'bot');
      }

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
              let result: object;
              if (functionName === 'save_personal_info') {
                result = await savePersonalInfoTool(functionArguments as Parameters<typeof savePersonalInfoTool>[0]);
              } else if (functionName === 'save_skills') {
                result = await saveSkillsTool(functionArguments as Parameters<typeof saveSkillsTool>[0]);
              } else {
                result = await functionToCall(functionArguments as Record<string, unknown>);
              }
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
          addStoreMessages(resolvedToolResults);
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
  }, [service, systemPromptString, toolDefinitions, toast, isLoading, addStoreMessage, addStoreMessages, addMessage]);
  
  const sendUserMessageToAI = useCallback(
    (userMessage: string) => {
      // First, display the message in the UI
      addMessage(userMessage, 'user');
      
      // Then add it to the chat store for AI processing
      const message: Message = {
        role: 'user',
        content: userMessage
      };
      addStoreMessage(message);

      console.log("Sending user message to AI:", userMessage);
      
      // Process the message with the AI
      const currentMessages = useChatStore.getState().messages;
      const limitedHistory = currentMessages.slice(-20);
      processChatTurn(limitedHistory);
    },
    [addMessage, addStoreMessage, processChatTurn]
  );
  
  // Function to sync chat store messages to UI
  const syncMessagesToUI = useCallback(() => {
    // Get messages from store and convert them to the format expected by the CV chat
    storeMessages.forEach(message => {
      if (message.role === 'assistant' && typeof message.content === 'string') {
        addMessage(message.content, 'bot');
      }
    });
  }, [storeMessages, addMessage]);

  return {
    sendUserMessageToAI,
    syncMessagesToUI,
    isLoading
  };
} 