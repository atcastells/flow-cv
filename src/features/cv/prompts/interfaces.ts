export interface SystemPromptConfig {
    role?: string;
    goal?: string;
    persona?: {
        tone?: string[];
        style?: string;
        emojis?: boolean;
    };
    context?: string;
    available_tools?: {
        name: string;
        description: string;
        // Parameters structure often resembles OpenAPI schema components.
        // Record<string, unknown> is flexible but less type-safe.
        // For more complex validation, a more specific type could be defined here.
        parameters: Record<string, unknown>;
    }[];
    instructions?: {
        context_awareness?: string;
        // Specific instructions keyed by tool name (e.g., "save_cv_info")
        tool_usage?: Record<string, string>; // <--- Added this field
        dialogue_guidelines?: string[];
        suggestion_handling?: {
            format: string;
            examples: string[];
            when_to_suggest: string[]; // Field was already present
        };
    };
    constraints?: Record<string, string>;
    language_settings?: { // Field was already present
        default_language: string;
        supported_languages: string[];
    };
}