import { useState, useCallback } from 'react';
import { useChatStore } from '../../store/chatStore';
import { Message, ToolCall } from '../service';
import type { Suggestion } from '../types/chat';

interface UseChatOptions {
  onError?: (error: Error) => void;
}

interface MessageWithSuggestions extends Message {
  suggestions?: Suggestion[];
}

export function useChat(options: UseChatOptions = {}) {
  const { messages, addMessage, addMessages, clearMessages, deleteMessage } = useChatStore();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleToolCalls = useCallback(async (toolCalls: ToolCall[]) => {
    for (const toolCall of toolCalls) {
      if (toolCall.function.name === 'provide_chat_suggestions') {
        try {
          const args = JSON.parse(toolCall.function.arguments);
          const messageId = args.messageId;
          const suggestions = args.suggestions;

          // Update the message with suggestions
          const updatedMessages = messages.map((msg) => {
            if (msg.id === messageId) {
              return {
                ...msg,
                suggestions
              } as MessageWithSuggestions;
            }
            return msg;
          });

          // Replace all messages to update the one with suggestions
          clearMessages();
          addMessages(updatedMessages);

        } catch (error) {
          console.error('Error handling provide_chat_suggestions tool call:', error);
          options.onError?.(new Error('Failed to process chat suggestions'));
        }
      }
    }
  }, [messages, clearMessages, addMessages, options.onError]);

  const processMessage = useCallback(async (message: Message) => {
    setIsProcessing(true);
    try {
      // Add the message to the store
      addMessage(message);

      // If the message has tool calls, process them
      if (message.tool_calls) {
        await handleToolCalls(message.tool_calls);
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error processing message';
      console.error('Error processing message:', error);
      options.onError?.(new Error(errorMsg));
    } finally {
      setIsProcessing(false);
    }
  }, [addMessage, handleToolCalls, options.onError]);

  return {
    messages: messages as MessageWithSuggestions[],
    addMessage: processMessage,
    deleteMessage,
    clearMessages,
    isProcessing
  };
}