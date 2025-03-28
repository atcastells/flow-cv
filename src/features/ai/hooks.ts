import { useState, useCallback, useMemo, useEffect } from 'react';
import React from 'react';
// Adjust paths as needed for your project structure
import { useToast } from '@/hooks/use-toast'; 
import { OpenRouterService } from './service'; 
import type { Message, ChatCompletionRequest, ChatCompletionResponseMessage, ToolCall } from './service'; // Ensure types include tool fields
import { useSystemPrompt } from './prompts/useSystemPrompt'; 
import { useProfileStore } from '../store/profileStore';

// Personal information type definition
export interface PersonalInfo {
  full_name?: string;
  email?: string;
  phone?: string;
  location?: string;
  links?: string[];
}

// New hook to manage personal information
export function usePersonalInfo() {
  const { personalData, updatePersonalData, setPersonalData } = useProfileStore();
  
  // Map the store data to our PersonalInfo format
  const personalInfo: PersonalInfo = {
    full_name: personalData.name,
    email: personalData.email,
    phone: personalData.phone,
    location: personalData.address,
    // Note: links and summary are not directly mapped
  };

  // Update personal information through the store
  const updatePersonalInfo = useCallback((newInfo: Partial<PersonalInfo>) => {
    // Handle each field that has a mapping
    if (newInfo.full_name !== undefined) {
      updatePersonalData('name', newInfo.full_name);
    }
    if (newInfo.email !== undefined) {
      updatePersonalData('email', newInfo.email);
    }
    if (newInfo.phone !== undefined) {
      updatePersonalData('phone', newInfo.phone);
    }
    if (newInfo.location !== undefined) {
      updatePersonalData('address', newInfo.location);
    }
    
    return true;
  }, [updatePersonalData]);

  return {
    personalInfo,
    updatePersonalInfo
  };
}

// Create a context to share personal info state across components
export const PersonalInfoContext = React.createContext<ReturnType<typeof usePersonalInfo> | null>(null);

// --- Tool Implementation Placeholders ---
// In a real app, these would likely call your backend API
async function save_personal_info(args: { 
  full_name?: string; 
  email?: string; 
  phone?: string; 
  location?: string; 
  links?: string[]; 
}, updateFn?: (info: Partial<PersonalInfo>) => boolean): Promise<object> {
  console.log("--- Executing Tool: save_personal_info ---");
  console.log("Arguments:", args);
  
  // If updateFn is provided (from the hook), use it to update personal info
  if (updateFn) {
    try {
      updateFn(args);
      return { 
        status: "success", 
        message: "Personal information has been saved successfully.", 
        updated_fields: Object.keys(args) 
      };
    } catch (error) {
      return { 
        status: "error", 
        message: "Failed to update personal information.", 
        error: error instanceof Error ? error.message : String(error) 
      };
    }
  }
  
  // Fallback for when updateFn is not available
  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
  return { status: "success", message: "Personal info processed.", received_args: args }; 
}

// Add other tool functions here if needed
const availableTools: { [key: string]: (args: any) => Promise<object> } = {
  save_personal_info: save_personal_info,
  // e.g., save_work_experience: async (args) => { ... }, 
};

// --- Hook Implementation ---

interface UseChatOptions {
  apiKey: string;
  model?: string; // Make model optional if service handles a default
}

export function useChat({ apiKey, model }: UseChatOptions) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { systemPromptString, toolDefinitions } = useSystemPrompt();
  const { personalInfo, updatePersonalInfo } = usePersonalInfo();

  // Memoize service initialization
  const service = useMemo(() => {
      const effectiveModel = model || 'google/gemini-flash-1.5';
      if (!apiKey || !effectiveModel) return null;
      console.log(`Initializing OpenRouterService with model: ${effectiveModel}`);
      return new OpenRouterService(apiKey, effectiveModel);
  }, [apiKey, model]);

  // Recursive function to handle conversation turns, including tool calls
  const processChatTurn = useCallback(async (messagesForApi: Message[]) => {
    if (!service || !systemPromptString) {
        const errorMsg = !service ? 'Chat service not initialized (check API key/model).' : 'System prompt not loaded.';
        console.error("processChatTurn error:", errorMsg);
        toast({ title: 'Error', description: errorMsg, variant: 'destructive' });
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
      
      let messageIncludingToolCalls: Message | null = null;
      setMessages(prev => {
          messageIncludingToolCalls = assistantMessage;
          return [...prev, assistantMessage];
      });
      
      if (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
         console.log("Handling tool calls:", assistantMessage.tool_calls);
        
        const toolResultsPromises = assistantMessage.tool_calls.map(async (toolCall: ToolCall) => {
          if (toolCall.type !== 'function') {
             console.warn(`Unsupported tool call type: ${toolCall.type}`);
             return null;
          }

          const functionName = toolCall.function.name;
          const functionToCall = availableTools[functionName];
          let functionResultContent: string;
          let functionArguments = {};

          try {
            if (toolCall.function.arguments) {
              functionArguments = JSON.parse(toolCall.function.arguments);
            } else {
              console.warn(`Tool call ${functionName} received no arguments.`);
            }
            
            if (functionToCall) {
              console.log(`Executing tool: ${functionName} with args:`, functionArguments);
              
              let result;
              if (functionName === 'save_personal_info') {
                result = await save_personal_info(functionArguments, updatePersonalInfo);
              } else {
                result = await functionToCall(functionArguments);
              }
              
              functionResultContent = JSON.stringify(result);
              console.log(`Tool ${functionName} result:`, functionResultContent);
            } else {
              throw new Error(`Unknown tool function requested: ${functionName}`);
            }
          } catch (toolError) {
            const errorMessage = toolError instanceof Error ? toolError.message : 'Unknown tool execution error';
            console.error(`Error executing tool ${functionName}:`, errorMessage);
            toast({
              title: `Tool Error: ${functionName}`,
              description: errorMessage,
              variant: 'destructive',
            });
            functionResultContent = JSON.stringify({ error: errorMessage, arguments_received: functionArguments });
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
           setMessages(prev => [...prev, ...resolvedToolResults]);
           await processChatTurn([...messagesForApi, assistantMessage, ...resolvedToolResults]); 
        } else {
           console.error("No valid tool results obtained from tool calls.");
           toast({ title: 'Error', description: 'Failed to process tool requests.', variant: 'destructive'});
           setIsLoading(false);
        }

      } else if (assistantMessage.content && typeof assistantMessage.content === 'string') {
        console.log("Final assistant text response received.");
        setIsLoading(false);
      } else if (!assistantMessage.content && (!assistantMessage.tool_calls || assistantMessage.tool_calls.length === 0)) {
         console.warn("Received empty or unexpected response from assistant (no content or tool_calls). Finish Reason:", response.choices[0]?.finish_reason);
         toast({ title: 'Info', description: 'Assistant provided an empty response.', variant: 'default' });
         setIsLoading(false);
      } else {
         console.error("Unhandled assistant message format:", assistantMessage);
         setIsLoading(false);
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to process message';
      console.error("Error in processChatTurn:", errorMessage, error);
      toast({
        title: 'API Error',
        description: errorMessage,
        variant: 'destructive',
      });
      setIsLoading(false); 
    } 
  }, [service, systemPromptString, toolDefinitions, toast, isLoading, updatePersonalInfo]);

  const sendMessage = useCallback(
    async (content: string) => {
      const userMessage: Message = {
        role: 'user',
        content,
      };
      
      let messagesToSend: Message[] | null = null;
      setMessages(prev => {
          messagesToSend = [...prev, userMessage];
          return messagesToSend;
      });
      
      if (messagesToSend) {
         await processChatTurn(messagesToSend.slice(-20));
      } else {
         console.error("Failed to update messages before processing turn.");
         toast({ title: 'Error', description: 'Could not send message due to state issue.', variant: 'destructive' });
      }
    },
    [processChatTurn, toast]
  );

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    messages,
    isLoading,
    sendMessage,
    clearMessages,
    personalInfo,
  };
}
