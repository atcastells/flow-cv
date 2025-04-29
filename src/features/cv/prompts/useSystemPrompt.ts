import { CVData, useCVStore } from '@/features/store/CVStore';
import { useMemo } from 'react';
import { ToolDefinition } from '../services/aiService';
import systemPromptConfig from './system.yaml';
import systemPromptConfigJson from './system.json';
import { SystemPromptConfig } from './interfaces';
import { formatSystemPromptAsString } from './utils';



const formatCurrentDataForPrompt = (data: CVData): string => {
    let formattedData = ``;
    
    // Personal Data
    formattedData += `### Personal Information\n`;
    formattedData += `- Name: ${data.PersonalData?.name || '(Not Set)'}\n`;
    formattedData += `- Email: ${data.PersonalData?.email || '(Not Set)'}\n`;
    formattedData += `- Phone: ${data.PersonalData?.phone || '(Not Set)'}\n`;
    formattedData += `- Location: ${data.PersonalData?.address || '(Not Set)'}\n`;
    
    // Skills
    formattedData += `\n### Skills\n`;
    if (data.Skills && data.Skills.length > 0) {
        formattedData += data.Skills.map(skill => `- ${skill}`).join('\n');
    } else {
        formattedData += '(No skills added yet)';
    }
    
    // CV Sections (excluding already processed sections)
    const processedSections = ['PersonalData', 'Skills'];
    
    for (const [section, content] of Object.entries(data)) {
        if (processedSections.includes(section) || !content) continue;
        
        formattedData += `\n### ${section}\n`;
        if (Array.isArray(content)) {
            formattedData += content.map(item => `- ${item}`).join('\n');
        } else if (typeof content === 'object') {
            formattedData += Object.entries(content)
                .map(([key, value]) => {
                    if (value === undefined) return null;
                    if (Array.isArray(value)) {
                        return `- ${key}: ${value.join(', ')}`;
                    }
                    return `- ${key}: ${value}`;
                })
                .filter(Boolean)
                .join('\n');
        }
    }
    
    return formattedData;
};

const formatToolDefinitionsForApi = (config: SystemPromptConfig): ToolDefinition[] => {
    return (config.available_tools || []).map(tool => ({
        type: "function",
        function: {
            name: tool.name,
            description: tool.description,
            parameters: tool.parameters
        }
    }));
};

interface SystemPromptProps {
    mode: 'json' | 'yaml';  
}

export const useSystemPrompt = ({ mode = 'json' }: SystemPromptProps) => {
    const {  cvData } = useCVStore();

    if (mode === 'yaml') {
    const language = Intl.DateTimeFormat().resolvedOptions().locale;

    const systemPromptString = useMemo(() => {
        return formatSystemPromptAsString(
            systemPromptConfig,
            formatCurrentDataForPrompt(cvData),
            language
        );
    }, [cvData, language]);

    const toolDefinitions = useMemo(() => formatToolDefinitionsForApi(systemPromptConfig), []);

    return { systemPromptString, toolDefinitions };
    }

    if (mode === 'json') {
        const prompt = systemPromptConfigJson;

        const toolDefinitions = formatToolDefinitionsForApi(systemPromptConfigJson);

        prompt.context = formatCurrentDataForPrompt(cvData);

        const stringPrompt = JSON.stringify(prompt);
        return { systemPromptString: stringPrompt, toolDefinitions: toolDefinitions };
    }
};
