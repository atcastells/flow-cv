import { PersonalData, useProfileStore } from '@/features/store/profileStore';
import { useMemo } from 'react';
import { ToolDefinition } from '../services/aiService';
import systemPromptConfig from './system.yaml';

interface CurrentCvData {
    personalData: PersonalData;
}

interface SystemPromptConfig {
    role?: string;
    persona_description?: string;
    goal?: string;
    tone_style?: string[];
    conversation_flow_summary?: string[];
    tool_usage_instructions?: string;
    constraints?: string[];
    tools?: {
        name: string;
        description: string;
        parameters: Record<string, unknown>;
    }[];
}

/**
 * Formats current CV data from Zustand for prompt injection
 */
const formatCurrentDataForPrompt = (data: CurrentCvData): string => {
    let dataString = "## Current CV Data (From User's Store)\n";
    
    dataString += "### Personal Info\n";
    dataString += `- Name: ${data.personalData?.name || '(Not Set)'}\n`;
    dataString += `- Email: ${data.personalData?.email || '(Not Set)'}\n`;
    dataString += `- Phone: ${data.personalData?.phone || '(Not Set)'}\n`;
    dataString += `- Location: ${data.personalData?.address || '(Not Set)'}\n`;
  
    dataString += "\n";
    return dataString;
};

/**
 * Converts prompt config to a single formatted string
 */
const formatSystemPromptAsString = (
    config: SystemPromptConfig,
    currentCvData: string,
    language: string
): string | null => {
  if (!config || typeof config !== 'object') {
    console.error("System prompt configuration is invalid or not loaded.");
    return null;
  }

  try {
    let promptString = `# Role: ${config.role || 'Assistant'}\n\n`;
    promptString += `## Persona Description\n${config.persona_description || 'No description provided.'}\n\n`;
    promptString += `## Language\n${language}\n\n`;
    promptString += `## Goal\n${config.goal || 'No goal provided.'}\n\n`;

    if(currentCvData) {
        promptString += `## Current CV Data\n${currentCvData}\n\n`;
    }
    
    if (config.tone_style && Array.isArray(config.tone_style)) {
      promptString += `## Tone & Style\n- ${config.tone_style.join('\n- ')}\n\n`;
    }
    
    if (config.conversation_flow_summary && Array.isArray(config.conversation_flow_summary)) {
       promptString += `## Conversation Flow\n${config.conversation_flow_summary.map(step => `- ${step}`).join('\n')}\n\n`;
    }
    
    promptString += `## Tool Usage Instructions\n${config.tool_usage_instructions || 'Use tools as defined.'}\n\n`;
   
    if (config.constraints && Array.isArray(config.constraints)) {
       promptString += `## Constraints\n- ${config.constraints.join('\n- ')}\n\n`;
    }

    promptString += `--- START OF CONVERSATION ---`;

    return promptString;

  } catch (error) {
    console.error("Error formatting system prompt:", error);
    return null;
  }
};

/**
 * Extracts and formats tool definitions from prompt config
 */
const formatToolDefinitionsForApi = (config: SystemPromptConfig): ToolDefinition[] => {
  if (!config || !Array.isArray(config.tools)) {
    return [];
  }

  try {
    return config.tools.map(tool => ({
        type: "function",
        function: {
            name: tool.name,
            description: tool.description,
            parameters: tool.parameters 
        }
    })) as ToolDefinition[];
  } catch (error) {
     console.error("Error formatting tool definitions:", error);
     return [];
  }
};

/**
 * Custom Hook for loading and formatting system prompt configuration
 */
export const useSystemPrompt = () => {
  const {personalData} = useProfileStore();
  const language = Intl.DateTimeFormat().resolvedOptions().locale;
  const currentCvData: CurrentCvData = {
    personalData: personalData,    
  };
  
  const systemPromptString = useMemo(() => {
    return formatSystemPromptAsString(systemPromptConfig as SystemPromptConfig, formatCurrentDataForPrompt(currentCvData), language);
  }, [systemPromptConfig, currentCvData, language]);

  const toolDefinitions = useMemo(() => {
    return formatToolDefinitionsForApi(systemPromptConfig as SystemPromptConfig);
  }, []);

  const isLoading = false;
  const error = systemPromptString === null && !isLoading ? "Failed to load or format system prompt." : null;

  return { 
    systemPromptString,
    toolDefinitions,
    isLoading, 
    error 
  };
}; 