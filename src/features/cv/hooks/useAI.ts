import { useToast } from '@/hooks/use-toast';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useChatStore } from '../../store/chatStore';
import { useSystemPrompt } from '../prompts/useSystemPrompt';
import type { ChatCompletionRequest, ChatCompletionResponseMessage, Message, ToolCall } from '../services/aiService';
import { LLMService } from '../services/aiService';
import { useToolHandler } from './useToolHandler';
import { parseSuggestionsFromContent } from '../components/ParseSuggestionsFromContent';
import { sanitizeMessage } from '../utils/sanitize';

// Define history limit as a constant
const HISTORY_LIMIT = 20;

interface UseAIOptions {
  apiKey: string;
  model?: string;
}

export function useAI({ apiKey, model }: UseAIOptions) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const storeMessages = useChatStore((state) => state.messages);
  const addStoreMessage = useChatStore((state) => state.addMessage);
  const addStoreMessages = useChatStore((state) => state.addMessages);
  const { systemPromptString, toolDefinitions } = useSystemPrompt({ mode: 'json' });
  const [preventAIGreeting, setPreventAIGreeting] = useState(false);


  useEffect(() => {
    if (storeMessages.length > 0) {
      setPreventAIGreeting(true);
    } else {
      setPreventAIGreeting(false);
    }
  }, [storeMessages]);


  const service = useMemo(() => {
    const effectiveModel = model || 'google/gemini-flash-1.5';
    if (!apiKey || !effectiveModel) return null;
    console.log(`Initializing OpenRouterService with model: ${effectiveModel}`);
    return new LLMService(apiKey, effectiveModel);
  }, [apiKey, model]);
  
  const processChatTurn = useCallback(async (messagesForApi: Message[]) => {
    if (!service || !systemPromptString) {
      console.log("Chat service or system prompt not ready, aborting processChatTurn.");
      toast({ title: 'Error', description: 'Chat service not ready.', variant: 'destructive' });
      // Ensure loading is false if we abort early
      setIsLoading(false);
      return;
    }
    if(!isLoading) setIsLoading(true);

    console.log("Processing chat turn with messages:", messagesForApi);

    try {
      const request: ChatCompletionRequest = {
        messages: [
          ...messagesForApi.map(({id, ...rest}) => rest)
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

      const assistantApiResponse = response.choices[0].message as ChatCompletionResponseMessage;
      if (!assistantApiResponse.role) assistantApiResponse.role = 'assistant';

      console.log("Assistant API response:", assistantApiResponse);

      // Sanitize the message to remove artifacts
      const sanitizedResponse = sanitizeMessage(assistantApiResponse);
      console.log("Sanitized response:", sanitizedResponse);

      // Parse the content for suggestions
      const { cleanContent, suggestions } = parseSuggestionsFromContent(sanitizedResponse);

      console.log("Suggestions:", suggestions);


      // Prepare the message object for the store, explicitly defining uiComponent
      let messageForStore: Message = {
        role: assistantApiResponse.role,
        content: cleanContent, // Use content without tags
        suggestions: suggestions.length > 0 ? suggestions : undefined, // Store extracted suggestions
        tool_calls: assistantApiResponse.tool_calls, // Handle other tools if needed
        id: response.id || assistantApiResponse.id,
        uiComponent: undefined, // Reset or handle based on other logic
      };

      // Process tool calls to potentially add uiComponent
      if (assistantApiResponse.tool_calls && assistantApiResponse.tool_calls.length > 0) {
        console.log("Handling tool calls:", assistantApiResponse.tool_calls);
        let uiComponentData: { type: string; props: any } | undefined = undefined;

        for (const toolCall of assistantApiResponse.tool_calls) {
          if (toolCall.function.name === 'render_skill_selector') {
            try {
              const args = JSON.parse(toolCall.function.arguments);
              uiComponentData = {
                type: 'skillSelector',
                props: {
                  category: args.skillCategory || 'all',
                  jobTitle: args.jobTitle || '',
                  industryContext: args.industryContext || '',
                  toolCallId: toolCall.id // Pass the tool call ID for callback reference
                }
              };
              break; // Assume only one UI component per message
            } catch (e) {
              console.error("Error parsing skill selector arguments:", e);
            }
          }
        }
        // Assign uiComponentData if it was generated
        if (uiComponentData) {
            messageForStore.uiComponent = uiComponentData;
            console.log("Assigned UI component to message:", uiComponentData);
        }

        // Add the potentially enhanced message to the store *before* tool execution
        addStoreMessage(messageForStore);
        console.log("Added assistant message to store (before tool execution):", messageForStore);

        // --- Tool Execution Logic ---
        // Hand off tool execution to the useToolHandler hook
        console.log("Handing off tool calls to useToolHandler:", assistantApiResponse.tool_calls);
        // No need to await if we want UI to update immediately.
        // executeTools internally handles the next call to processChatTurn if needed.
        executeTools(assistantApiResponse.tool_calls);
        // isLoading remains true, executeTools or the subsequent processChatTurn will set it false.
        // --- End Tool Execution ---

      }
      else if (assistantApiResponse.content !== null || response.choices[0].finish_reason === 'stop') {
        // No tool calls, just add the plain message (already has uiComponent: undefined) to the store
        // If message has content, add it. If no content but finished, still add (e.g. empty message is valid)
        addStoreMessage(messageForStore);
        console.log("Final assistant response added (or stop reason). No tool calls initiated.", messageForStore);
        setIsLoading(false); // Turn complete
      }
      else {
        console.warn("Received unexpected assistant message format/finish reason:", assistantApiResponse, response.choices[0].finish_reason);
        toast({ title: 'Info', description: 'Assistant provided an empty or unexpected response.', variant: 'default' });
        setIsLoading(false);
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to process message';
      console.error("Error in processChatTurn:", errorMessage, error);
      toast({ title: 'Chat Error', description: `Failed to get response: ${errorMessage}`, variant: 'destructive' });
      setIsLoading(false);
    }
  }, [service, systemPromptString, toolDefinitions, toast, isLoading, addStoreMessage, addStoreMessages]);
  
  // Instantiate the tool handler hook *after* processChatTurn is defined, passing the callback and setIsLoading
   const {executeTools} = useToolHandler({
        processNextTurn: processChatTurn,
        setIsLoading: setIsLoading, // Pass setIsLoading
      });

  // Effect to trigger initial AI greeting if chat is empty
  useEffect(() => {
    console.log("Initial Greeting useEffect check.");
    console.log("storeMessages length:", storeMessages.length);
    console.log("preventAIGreeting:", preventAIGreeting);
    console.log("service ready:", !!service);
    console.log("systemPromptString ready:", !!systemPromptString);

    // Check if the service is ready, the prompt is loaded, there are no messages,
    // and greeting is not prevented
    // Also ensure processChatTurn is stable/available (though it should be by this point)
    if (storeMessages.length === 0 && !preventAIGreeting && service && systemPromptString && processChatTurn) {
      console.log("Chat is empty and ready, triggering initial AI greeting.");
      // Call processChatTurn with an empty history to get the initial message
      processChatTurn([
        {
          role: 'user',
          content: "Hola"
        }
      ]);
      // Prevent subsequent automatic greetings
      setPreventAIGreeting(true);
    }
    // Dependencies: service, systemPromptString, message store, the processing function, and greeting prevention flag
  }, [storeMessages, processChatTurn, preventAIGreeting, service, systemPromptString]);

  const sendUserMessageToAI = useCallback(
    (userMessage: string) => {
      // Add user message to the chat store
      const message: Message = {
        role: 'user',
        content: userMessage
        // Let ensureMessageId in store handle ID generation
      };
      addStoreMessage(message);
      console.log("Sending user message to AI:", userMessage);

      // Process the message with the AI
      const currentMessages = useChatStore.getState().messages;
      const limitedHistory = currentMessages.slice(-HISTORY_LIMIT);
      // Use the single processChatTurn function
      processChatTurn(limitedHistory);
    },
    // Updated dependencies
    [addStoreMessage, processChatTurn]
  );
  
  // Function to handle user selecting skills from the skill selector
  const handleSkillSelection = useCallback((skills: string[], toolCallId: string) => {
    const skillsMessageContent = `I've selected the following skills: ${skills.join(', ')}`;

    // Add selected skills as a user message to the store
    const userSkillsMessage: Message = {
      role: 'user',
      content: skillsMessageContent,
    };
    addStoreMessage(userSkillsMessage);
    console.log("Added user skill selection message to store:", userSkillsMessage);

    // Create the tool result message responding to the original tool call
    const toolResponseMessage: Message = {
      role: 'tool',
      tool_call_id: toolCallId,
      content: JSON.stringify({ selected_skills: skills }) // Send back the selected skills as the result
    };
    addStoreMessage(toolResponseMessage);
    console.log("Added tool response message for skill selection:", toolResponseMessage);

    // Process the next turn with the AI, including the new user message and the tool result
    const currentMessages = useChatStore.getState().messages;
    const limitedHistory = currentMessages.slice(-HISTORY_LIMIT);
     // Use the single processChatTurn function
    processChatTurn(limitedHistory);
  },
  // Updated dependencies
  [addStoreMessage, processChatTurn, toast]);

  return {
    isLoading,
    sendUserMessageToAI,
    handleSkillSelection,
  };
}