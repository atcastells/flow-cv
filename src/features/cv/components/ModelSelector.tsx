import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import React, { useEffect, useState } from 'react';
import { OpenRouterService } from '../services/aiService';

// Define ModelInfo interface since it's not exported from aiService
interface ModelInfo {
  id: string;
  name: string;
  pricing: object;
}

interface ModelSelectorProps {
  apiKey: string;
  selectedModel: string;
  onSelectModel: (modelId: string) => void;
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({ 
  apiKey, 
  selectedModel, 
  onSelectModel 
}) => {
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchModels = async () => {
      if (!apiKey) {
        setError('API key is required to fetch models');
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const service = new OpenRouterService(apiKey, '');
        const availableModels = await service.getAvailableModels();
        setModels(availableModels);
      } catch (err) {
        console.error('Failed to fetch models:', err);
        setError('Failed to load available models');
      } finally {
        setIsLoading(false);
      }
    };

    fetchModels();
  }, [apiKey]);

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-[var(--color-text-on-primary)]">Modelo:</span>
      <Select 
        value={selectedModel} 
        onValueChange={onSelectModel}
        disabled={isLoading || models.length === 0}
      >
        <SelectTrigger className="h-8 w-[180px] text-xs bg-transparent border-[var(--color-border)] text-[var(--color-text-on-primary)]">
          <SelectValue placeholder={isLoading ? "Cargando modelos..." : "Selecciona un modelo"} />
        </SelectTrigger>
        <SelectContent>
          {models.map((model) => (
            <SelectItem key={model.id} value={model.id}>
              {model.name.split('/').pop()}
            </SelectItem>
          ))}
          {error && (
            <div className="p-2 text-sm text-red-500">{error}</div>
          )}
          {!error && models.length === 0 && !isLoading && (
            <div className="p-2 text-sm text-center">No hay modelos disponibles</div>
          )}
        </SelectContent>
      </Select>
    </div>
  );
}; 