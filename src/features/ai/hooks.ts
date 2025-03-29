import { useState, useCallback, useMemo } from 'react'; // Removed useEffect
// Adjust paths as needed
import { useToast } from '@/hooks/use-toast';
import { OpenRouterService } from './service';
// Import the updated types, including ContentPart
import type { Message, ChatCompletionRequest, ChatCompletionResponseMessage, ToolCall } from './service'; // Removed ContentPart if unused directly here
import { useSystemPrompt } from './prompts/useSystemPrompt';
import { useChatStore } from '../store/chatStore'; // Import the Zustand store
import { useSkillsStore } from '../store/skillsStore'; // Import the skills store

import { savePersonalInfoTool } from './tools/savePersonalInfoTool'; // Import the extracted tool
// --- Tool Implementation Placeholders ---
// (Keep the availableTools map and placeholder functions as before)

async function save_skills(args: { skills: string[] }): Promise<object> {
  console.log("--- Executing Tool: save_skills ---");
  console.log("Arguments:", args);
  try {
    if (!Array.isArray(args.skills)) {
      throw new Error('Invalid arguments: skills must be an array.');
    }
    // Get the action from the store
    const { setSkills } = useSkillsStore.getState();
    // Update the store
    setSkills(args.skills);
    return { status: "success", message: "Skills saved successfully." };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error saving skills';
    console.error("Error executing tool save_skills:", errorMessage);
    return { status: "error", message: errorMessage };
  }
}
const availableTools: { [key: string]: (args: any) => Promise<object> } = {
  save_personal_info: savePersonalInfoTool, // Use the imported tool function
  save_skills: save_skills, // Add the new skills tool
};

// --- Hook Implementation ---

interface UseChatOptions {
  apiKey: string;
  model?: string;
}

export function useChat({ apiKey, model }: UseChatOptions) {
  // --- Zustand Store Integration ---
  const messages = useChatStore((state) => state.messages);
  const addMessage = useChatStore((state) => state.addMessage);
  const addMessages = useChatStore((state) => state.addMessages);
  const clearStoreMessages = useChatStore((state) => state.clearMessages);
  // --- End Zustand Store Integration ---

  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { systemPromptString, toolDefinitions } = useSystemPrompt();

  const service = useMemo(() => {
      const effectiveModel = model || 'google/gemini-flash-1.5';
      if (!apiKey || !effectiveModel) return null;
      console.log(`Initializing OpenRouterService with model: ${effectiveModel}`);
      return new OpenRouterService(apiKey, effectiveModel);
  }, [apiKey, model]);

  // processChatTurn now uses store actions
  const processChatTurn = useCallback(async (messagesForApi: Message[]) => {
    // Get store actions directly - ensures latest functions are used if store reinitializes (unlikely here)
    const { addMessage: _addMessage, addMessages: _addMessages } = useChatStore.getState();

    if (!service || !systemPromptString) {
        toast({ title: 'Error', description: 'Chat service not initialized.', variant: 'destructive' });
        setIsLoading(false); // Ensure loading is off
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

      if (!response.choices?.[0]?.message) { throw new Error('Invalid API response: missing message structure'); }

      const assistantMessage = response.choices[0].message as ChatCompletionResponseMessage;
      if (!assistantMessage.role) assistantMessage.role = 'assistant';

      // Add assistant message (potentially with text and/or tool_calls) to store
      _addMessage(assistantMessage); // Use store action

      // --- Handle Tool Calls ---
      if (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
         console.log("Handling tool calls:", assistantMessage.tool_calls);

        const toolResultsPromises = assistantMessage.tool_calls.map(async (toolCall: ToolCall) => {
          // ... (logic for parsing args, finding function, executing, handling errors - same as before) ...
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
            } else { throw new Error(`Unknown tool function: ${functionName}`); }
          } catch (toolError) {
             const errorMessage = toolError instanceof Error ? toolError.message : 'Unknown tool execution error';
             console.error(`Error executing tool ${functionName}:`, errorMessage);
             toast({ title: 'Tool Error', description: `Failed to execute tool ${functionName}: ${errorMessage}`, variant: 'destructive' });
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
           _addMessages(resolvedToolResults); // Use store action to add multiple
           // Recursive call with updated history (fetch latest from store for accuracy)
           const currentMessages = useChatStore.getState().messages; // Get latest state
           await processChatTurn(currentMessages.slice(-20)); // Pass latest history slice
        } else {
           console.error("No valid tool results obtained.");
           toast({ title: 'Error', description: 'Failed to process tool requests.', variant: 'destructive'});
           setIsLoading(false);
        }

      }
      // --- Handle Regular Text Response or Response after Tool Calls ---
      else if (assistantMessage.content !== null || response.choices[0].finish_reason === 'stop') {
        console.log("Final assistant response received (or stop reason).");
        setIsLoading(false);
      }
      // --- Handle Empty/Unexpected ---
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
  }, [service, systemPromptString, toolDefinitions, toast, isLoading]); // Removed store actions from deps, using getState inside


  // sendMessage now uses store actions
  const sendMessage = useCallback(
    async (message: Message) => {
      // Get store actions directly
      const { addMessage: _addMessage } = useChatStore.getState();
      const currentMessages = useChatStore.getState().messages; // Get current messages from store

      // --- Validations (keep these) ---
      if (message.role !== 'user') { console.warn("Non-user message passed to sendMessage"); return; }
      if (typeof message.content !== 'string' && !Array.isArray(message.content)) { /*...*/ return; }
      if (Array.isArray(message.content) && message.content.length === 0) { /*...*/ return; }

      // --- Revised Logic ---
      // 1. Prepare history for the API call using current store state
      const historyForAPI = [...currentMessages, message];
      const limitedHistory = historyForAPI.slice(-20); // Apply context limit

      // 2. Optimistically update the UI state via the store *now*
      _addMessage(message); // Use store action

      // 3. Initiate the backend processing with the prepared history
      try {
          await processChatTurn(limitedHistory);
      } catch (error) {
          // Handle errors initiating the call (processChatTurn has internal handling too)
          console.error("Error initiating chat processing:", error);
          toast({ title: 'Error', description: `Failed to send message: ${error instanceof Error ? error.message : 'Unknown error'}`, variant: 'destructive'});
          // No explicit revert needed - store reflects the optimistic update. Error toast informs user.
          setIsLoading(false); // Ensure loading is off if we bail here
      }
      // --- End Revised Logic ---
    },
    // Dependencies: processChatTurn relies on service, prompts etc. which are stable or memoized.
    // toast is stable. We get store actions/state inside via getState.
    [processChatTurn, toast]
  );


  // clearMessages now uses store action
  const clearMessages = useCallback(() => {
    // Get store action directly
    const { clearMessages: _clearMessages } = useChatStore.getState();
    _clearMessages();
  }, []); // No dependencies needed as it calls getState


  return {
    messages, // Return messages from the store selector
    isLoading,
    sendMessage,
    clearMessages, // Return the refactored clearMessages
  };
}

// Remove conceptual example usage comment block as it's no longer relevant here