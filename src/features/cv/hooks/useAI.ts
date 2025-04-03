import { useToast } from '@/hooks/use-toast';
import { useCallback, useMemo, useState } from 'react';
import { useChatStore } from '../../store/chatStore';
import { useSystemPrompt } from '../prompts/useSystemPrompt';
import type { ChatCompletionRequest, ChatCompletionResponseMessage, Message, ToolCall } from '../services/aiService';
import { OpenRouterService } from '../services/aiService';
import { saveCVInfoTool } from '../tools/saveCVInfoTool';
import { renderSkillSelectorTool } from '../tools/renderSkillSelectorTool';

// Define available tools
const availableTools: { [key: string]: (args: unknown) => Promise<object> } = {  
  save_cv_info: saveCVInfoTool as (args: unknown) => Promise<object>,
  render_skill_selector: renderSkillSelectorTool as (args: unknown) => Promise<object>,
};

interface UseAIOptions {
  addMessage: (
    text: string, 
    sender: 'user' | 'bot' | 'system', 
    suggestions?: string[] | null, 
    uiComponents?: { type: string; props: any }[]
  ) => void;
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
      
      // Track if we need to render a skill selector with this message
      let uiComponents: { type: string; props: any }[] = [];
      
      // Process tool calls to identify UI components to render
      if (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
        console.log("Handling tool calls:", assistantMessage.tool_calls);
        
        // Check if any tool call is for the skill selector
        for (const toolCall of assistantMessage.tool_calls) {
          if (toolCall.function.name === 'render_skill_selector') {
            try {
              const args = JSON.parse(toolCall.function.arguments);
              uiComponents.push({
                type: 'skillSelector',
                props: {
                  category: args.skillCategory || 'all',
                  jobTitle: args.jobTitle || '',
                  industryContext: args.industryContext || '',
                  toolCallId: toolCall.id // Pass the tool call ID for callback reference
                }
              });
            } catch (e) {
              console.error("Error parsing skill selector arguments:", e);
            }
          }
        }

        // Add the message to the UI with any UI components
        if (typeof assistantMessage.content === 'string') {
          addMessage(assistantMessage.content, 'bot', null, uiComponents.length > 0 ? uiComponents : undefined);
        }

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
              if (functionName === 'save_cv_info') {
                result = await saveCVInfoTool(functionArguments as Parameters<typeof saveCVInfoTool>[0]);
              } else if (functionName === 'render_skill_selector') {
                result = await renderSkillSelectorTool(functionArguments as Parameters<typeof renderSkillSelectorTool>[0]);
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
        // No tool calls, just show the message
        if (typeof assistantMessage.content === 'string') {
          addMessage(assistantMessage.content, 'bot');
        }
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
  
  // Function to handle user selecting skills from the skill selector
  const handleSkillSelection = useCallback((skills: string[], toolCallId: string) => {
    // Add the selected skills as a user message
    const skillsMessage = `I've selected the following skills: ${skills.join(', ')}`;
    addMessage(skillsMessage, 'user');
    
    // Add to chat store
    const message: Message = {
      role: 'user',
      content: skillsMessage
    };
    addStoreMessage(message);
    
    // Process with AI
    const currentMessages = useChatStore.getState().messages;
    const limitedHistory = currentMessages.slice(-20);
    processChatTurn(limitedHistory);
  }, [addMessage, addStoreMessage, processChatTurn]);
  
  // Function to sync chat store messages to UI
  const syncMessagesToUI = useCallback(() => {
    // Get messages from store and convert them to the format expected by the CV chat
    storeMessages.forEach(message => {
      if (message.role === 'assistant' && typeof message.content === 'string') {
        // We don't have access to tool calls in this context, so we can't regenerate UI components
        addMessage(message.content, 'bot');
      }
    });
  }, [storeMessages, addMessage]);

  return {
    sendUserMessageToAI,
    handleSkillSelection,
    syncMessagesToUI,
    isLoading
  };
}