import { useToast } from '@/hooks/use-toast';
import { useCallback } from 'react';
import { useChatStore } from '../../store/chatStore';
import type { Message, ToolCall } from '../services/aiService';
import { saveCVInfoTool } from '../tools/saveCVInfoTool';
import { renderSkillSelectorTool } from '../tools/renderSkillSelectorTool';
import { addSuggestionsTool } from '../tools/addSuggestionsTool';

// Define available tools - Consider moving this definition elsewhere if shared
// Or pass it as an argument if it varies. For now, defining it here.
const availableTools: { [key: string]: (args: unknown) => Promise<object> } = {
  save_cv_info: saveCVInfoTool as (args: unknown) => Promise<object>,
  render_skill_selector: renderSkillSelectorTool as (args: unknown) => Promise<object>,
  add_suggestions: addSuggestionsTool as (args: unknown) => Promise<object>,
};

interface UseToolHandlerProps {
  // Renamed to reflect its purpose: it processes the *next* turn after tools run.
  processNextTurn: (messages: Message[]) => Promise<void>;
  setIsLoading: (loading: boolean) => void; // Add setIsLoading to manage loading state
}

// Define history limit as a constant, should match useAI
const HISTORY_LIMIT = 20;

export function useToolHandler({ processNextTurn, setIsLoading }: UseToolHandlerProps) {
  const { toast } = useToast();
  const addStoreMessages = useChatStore((state) => state.addMessages);

  const executeTools = useCallback(async (toolCalls: ToolCall[]) => {
    console.log("Executing tool calls via useToolHandler:", toolCalls);
    let hasActualToolResult = false; // Flag to track if any tool produced a result needing AI follow-up

    const toolResultsPromises = toolCalls.map(async (toolCall: ToolCall) => {
      const functionName = toolCall.function.name;
      const functionToCall = availableTools[functionName];
      let functionResultContent: string | null = null; // Allow null if no content needed
      let functionArguments = {};

      try {
        if (toolCall.function.arguments) {
          functionArguments = JSON.parse(toolCall.function.arguments);
        }
        if (functionToCall) {
          let result: object | null = null; // Allow null result
          // Explicitly check function names and cast arguments for type safety
          if (functionName === 'save_cv_info') {
             result = await saveCVInfoTool(functionArguments as Parameters<typeof saveCVInfoTool>[0]);
             hasActualToolResult = true; // This tool generates a result for the AI
          } 
          else if (functionName === 'render_skill_selector') {
             // render_skill_selector primarily triggers UI.
             // It might return confirmation, but doesn't necessarily require AI processing of its direct result.
             // Let's assume it returns some status object but doesn't set hasActualToolResult.
             result = await renderSkillSelectorTool(functionArguments as Parameters<typeof renderSkillSelectorTool>[0]);
             // Do not set hasActualToolResult = true;
          } 
          else if (functionName === 'add_suggestions') {
            result = await addSuggestionsTool(functionArguments as Parameters<typeof addSuggestionsTool>[0]);
          }
          else {
             // Fallback for other potential tools
             result = await functionToCall(functionArguments as Record<string, unknown>);
             hasActualToolResult = true; // Assume other tools generate results for the AI
          }

          // Only stringify if result is not null
          functionResultContent = result !== null ? JSON.stringify(result) : null;

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
        // Provide error content back to the AI
        functionResultContent = JSON.stringify({ error: errorMessage });
        hasActualToolResult = true; // Error is a result the AI needs to see
      }

      // Only return a message if there's content to send back
      if (functionResultContent !== null) {
        return {
          role: 'tool',
          tool_call_id: toolCall.id,
          content: functionResultContent,
        } as Message;
      } else {
        return null; // Indicate no message needed for this tool call
      }
    });

    // Filter out null results before processing
    const resolvedToolResults = (await Promise.all(toolResultsPromises)).filter(result => result !== null) as Message[];

    // Add results to store if any exist
    if (resolvedToolResults.length > 0) {
      console.log("Adding tool results to messages:", resolvedToolResults);
      addStoreMessages(resolvedToolResults);
    }

    // Decide whether to call the next AI turn
    if (hasActualToolResult && resolvedToolResults.length > 0) {
        console.log("Tool results generated, processing next AI turn.");
        const currentMessages = useChatStore.getState().messages;
        // Make sure processNextTurn is awaited so loading state is managed correctly
        await processNextTurn(currentMessages.slice(-HISTORY_LIMIT));
    } else {
        // If no tool produced a result needing AI follow-up (e.g., only render_skill_selector was called)
        // or if there were errors but no actual results to send, stop the loading indicator.
        console.log("No further AI processing needed for this tool call sequence.");
        setIsLoading(false);
    }
    // Note: Error handling within processNextTurn should also handle setIsLoading(false)

  }, [toast, addStoreMessages, processNextTurn, setIsLoading]);

  return { executeTools };
} 