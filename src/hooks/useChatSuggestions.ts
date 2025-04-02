import { useState, useCallback } from 'react';
import { Message, chatService } from '../features/ai/service';

interface ChatSuggestionsState {
  suggestions: string[];
  loading: boolean;
  error: string | null;
}

export const useChatSuggestions = () => {
  const [state, setState] = useState<ChatSuggestionsState>({
    suggestions: [],
    loading: false,
    error: null,
  });

  const fetchSuggestions = useCallback(async (messages: Message[]) => {
    // Only fetch suggestions if the last message is from the assistant
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage || lastMessage.role !== 'assistant') {
      setState(prev => ({ ...prev, suggestions: [] }));
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await chatService.createChatCompletion({
        messages: [
          ...messages.slice(-3), // Use last 3 messages for context
          {
            role: 'system',
            content: 'Generate 3 brief, contextually relevant chat suggestions of type CHAT_PREFILL based on the conversation. Return only the suggestions as a JSON array of strings.',
          }
        ],
        temperature: 0.7,
        max_tokens: 150,
      });

      let suggestions: string[] = [];
      if (typeof response.content === 'string') {
        try {
          suggestions = JSON.parse(response.content);
        } catch (e) {
          console.error('Failed to parse suggestions:', e);
          suggestions = [];
        }
      }

      setState({
        suggestions,
        loading: false,
        error: null,
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to fetch suggestions',
      }));
    }
  }, []);

  return {
    ...state,
    fetchSuggestions,
  };
};