import { useMemo } from 'react';
// Importa el archivo YAML directamente. 
// Asegúrate de que la ruta sea correcta y que Vite/Rollup esté configurado con @rollup/plugin-yaml.
import systemPromptConfig from './system.yaml'; 
import { PersonalData, useProfileStore } from '@/features/store';

interface CurrentCvData {
    personalData: PersonalData;
  }

/**
 * Formatea los datos actuales del CV desde Zustand para inyectarlos en el prompt.
 * @param {CurrentCvData} data - Los datos actuales del CV.
 * @returns {string} - Una string formateada con los datos.
 */
const formatCurrentDataForPrompt = (data: CurrentCvData): string => {
    let dataString = "## Current CV Data (From User's Store)\n";
    
    dataString += "### Personal Info\n";
    dataString += `- Name: ${data.personalData?.name || '(Not Set)'}\n`;
    dataString += `- Email: ${data.personalData?.email || '(Not Set)'}\n`;
    dataString += `- Phone: ${data.personalData?.phone || '(Not Set)'}\n`;
    dataString += `- Location: ${data.personalData?.address || '(Not Set)'}\n`;
  
    dataString += "\n"; // Separador antes de la siguiente sección del prompt original
    return dataString;
  };

/**
 * Convierte el objeto de configuración del prompt YAML/JS en una única cadena de texto
 * formateada para ser usada como mensaje de sistema en la API del LLM.
 * @param {object} config - El objeto JavaScript parseado desde el YAML.
 * @returns {string|null} - La cadena de texto formateada o null si la config no es válida.
 */
const formatSystemPromptAsString = (config, currentCvData: string, language) => {
    console.log("currentCvData", currentCvData)
  // Verifica si la configuración se cargó correctamente
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
    
    // Incluye las instrucciones cruciales para el uso de tools y las restricciones
    promptString += `## Tool Usage Instructions\n${config.tool_usage_instructions || 'Use tools as defined.'}\n\n`;
   
    if (config.constraints && Array.isArray(config.constraints)) {
       promptString += `## Constraints\n- ${config.constraints.join('\n- ')}\n\n`;
    }

    promptString += `--- START OF CONVERSATION ---`; // Marca opcional para el inicio

    return promptString;

  } catch (error) {
    console.error("Error formatting system prompt:", error);
    return null; // Retorna null si hay un error al acceder a las propiedades
  }
};

/**
 * Extrae y formatea las definiciones de herramientas desde la configuración del prompt 
 * para que coincidan con un formato común esperado por las APIs de LLM (como OpenAI).
 * @param {object} config - El objeto JavaScript parseado desde el YAML.
 * @returns {Array} - Un array con las definiciones de herramientas formateadas, o un array vacío.
 */
const formatToolDefinitionsForApi = (config) => {
  if (!config || !Array.isArray(config.tools)) {
    return []; // No hay herramientas definidas o la config no es válida
  }

  try {
    // Adapta esta estructura EXACTAMENTE a lo que espera tu API (DeepSeek/Chutes)
    // Este ejemplo sigue un formato similar al de OpenAI/Google Gemini
    return config.tools.map(tool => ({
        type: "function", // Asume 'function', podría ser diferente (consultar docs API)
        function: {
            name: tool.name,
            description: tool.description,
            // Asume que la estructura de 'parameters' en tu YAML coincide 
            // con lo que la API espera (JSON Schema).
            parameters: tool.parameters 
        }
    }));
  } catch (error) {
     console.error("Error formatting tool definitions:", error);
     return []; // Retorna array vacío en caso de error
  }
};


/**
 * Custom Hook para cargar, formatear y proveer la configuración del System Prompt.
 * Utiliza la importación estática del archivo YAML configurada en Vite.
 * @returns {{ systemPromptString: string|null, toolDefinitions: Array, isLoading: boolean, error: string|null }} - Un objeto que contiene la string del prompt, las definiciones de tools, y estados de carga/error.
 */
export const useSystemPrompt = () => {
  // Usamos useMemo para formatear la string y las tools solo una vez, 
  // ya que la importación estática no cambiará durante el ciclo de vida del componente.  
  const {personalData} = useProfileStore()
  const language = Intl.DateTimeFormat().resolvedOptions().locale; // Idioma del navegador
  const currentCvData: CurrentCvData = {
    personalData: personalData,    
  };
  const systemPromptString = useMemo(() => {
    return formatSystemPromptAsString(systemPromptConfig, formatCurrentDataForPrompt(currentCvData), language);
  }, [systemPromptConfig, currentCvData, language]); // Dependencias: config y datos actuales del CV

  const toolDefinitions = useMemo(() => {
    return formatToolDefinitionsForApi(systemPromptConfig);
  }, []); // Dependencia vacía

  // Puedes añadir estados de carga/error si la carga fuera asíncrona (con fetch)
  // En este caso de importación estática, es menos necesario, pero mantenemos la estructura.
  const isLoading = false; // La importación es síncrona en el build
  const error = systemPromptString === null && !isLoading ? "Failed to load or format system prompt." : null;

  return { 
    systemPromptString, // La string formateada para el content del mensaje system
    toolDefinitions,    // El array formateado para el parámetro 'tools' de la API
    isLoading, 
    error 
  };
};
