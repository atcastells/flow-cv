import { SystemPromptConfig } from "./interfaces";

export const formatSystemPromptAsString = (
    config: SystemPromptConfig,
    currentCvData: string,
    language: string
): string => {

    console.log(config);
    console.log(currentCvData);
    console.log(language);

    const supportedLang = config.language_settings?.supported_languages.includes(language)
        ? language
        : config.language_settings?.default_language;

    let prompt = `# Role: ${config.role}\n\n`;
    prompt += `## Goal\n${config.goal}\n\n`;
    prompt += `## Persona\nTone: ${config.persona?.tone?.join(', ')}\nStyle: ${config.persona?.style}\nEmojis: ${config.persona?.emojis ? 'Yes' : 'No'}\n\n`;
    prompt += `## Language\n${supportedLang}\n\n`;
    prompt += `${config.context}\n${currentCvData}\n\n`; // use YAML context directly
    prompt += `## Instructions\n${config.instructions?.context_awareness}\n\n`;
    prompt += `Dialogue Guidelines:\n${config.instructions?.dialogue_guidelines?.map(step => `- ${step}`).join('\n')}\n\n`;
    prompt += `Tool Usage:\n${config.instructions?.tool_usage}\n\n`;
    prompt += `Suggestion Handling:\nFormat: ${config.instructions?.suggestion_handling?.format}\n`;
    prompt += `Examples:\n${config.instructions?.suggestion_handling?.examples.join('\n')}\n`;
    prompt += `When to Suggest:\n${config.instructions?.suggestion_handling?.when_to_suggest.join('\n')}\n\n`; // missing before
    prompt += `## Constraints\n${Object.entries(config.constraints || {}).map(([key, val]) => `- ${key}: ${val}`).join('\n')}\n\n`;
    prompt += '--- START OF CONVERSATION ---';
    return prompt;
};
