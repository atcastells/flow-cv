import axios from 'axios';

export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatCompletionRequest {
  messages: Message[];
  model?: string;
  temperature?: number;
  max_tokens?: number;
}

export interface ChatCompletionResponse {
  choices: {
    message: Message;
    finish_reason: string;
  }[];
}

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

interface ModelInfo {
  id: string;
  name: string;
  pricing: {
    prompt: string;
    completion: string;
    image: string;
    request: string;
    input_cache_read: string;
    input_cache_write: string;
    web_search: string;
    internal_reasoning: string;
  };
}

export class OpenRouterService {
  private apiKey: string;
  private defaultModel: string;

  constructor(apiKey: string, defaultModel = 'deepseek/deepseek-chat-v3-0324:free') {
    this.apiKey = apiKey;
    this.defaultModel = defaultModel;
  }

  async getAvailableModels(): Promise<ModelInfo[]> {
    try {
      const response = await axios.get('https://openrouter.ai/api/v1/models', {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'HTTP-Referer': window.location.origin,
          'X-Title': 'CV Interaction Flow'
        }
      });

      return response.data.data.filter((model: ModelInfo) => {
        const pricing = model.pricing;
        return (
          pricing.prompt === '0' &&
          pricing.completion === '0' &&
          pricing.image === '0' &&
          pricing.request === '0' &&
          pricing.input_cache_read === '0' &&
          pricing.input_cache_write === '0' &&
          pricing.web_search === '0' &&
          pricing.internal_reasoning === '0'
        );
      });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`OpenRouter API Error: ${error.response?.data?.error || error.message}`);
      }
      throw error;
    }
  }

  async createChatCompletion(request: ChatCompletionRequest): Promise<ChatCompletionResponse> {
    try {
      const response = await axios.post(
        OPENROUTER_API_URL,
        {
          ...request,
          model: request.model || this.defaultModel,
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'HTTP-Referer': window.location.origin,
            'X-Title': 'CV Interaction Flow',
          },
        }
      );

      if (!response.data || !Array.isArray(response.data.choices)) {
        throw new Error('Invalid response format: missing choices array');
      }

      if (response.data.choices.length === 0) {
        throw new Error('No completion choices returned from the API');
      }

      const firstChoice = response.data.choices[0];
      if (!firstChoice.message || typeof firstChoice.message.content !== 'string') {
        throw new Error('Invalid message format in API response');
      }

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`OpenRouter API Error: ${error.response?.data?.error || error.message}`);
      }
      throw error;
    }
  }
}