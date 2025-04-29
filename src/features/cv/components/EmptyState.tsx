import { Card } from '@/components/ui/card';
import { BriefcaseBusiness, FileText, HelpCircle, MessageSquarePlus } from 'lucide-react';
import React from 'react';

interface EmptyStateProps {
  onSendPredefinedMessage: (message: string) => void;
}

const predefinedMessages = [
  {
    groupTitle: '🛠️ Construcción',
    label: 'Ayúdame a crear mi CV',
    message: 'Quiero crear un CV profesional, ¿cómo empezamos?',
    icon: <FileText className="w-5 h-5 mr-2" />
  },
  {
    groupTitle: '💼 Contenido',
    label: 'Añadir experiencia laboral',
    message: 'Necesito añadir mi experiencia laboral. ¿Qué información debo incluir?',
    icon: <BriefcaseBusiness className="w-5 h-5 mr-2" />
  },
  {
    groupTitle: '📈 Optimización',
    label: 'Consejos para un mejor CV',
    message: 'Dame algunos consejos para mejorar mi CV y destacar frente a otros candidatos.',
    icon: <MessageSquarePlus className="w-5 h-5 mr-2" />
  },
];

export const EmptyState: React.FC<EmptyStateProps> = ({ onSendPredefinedMessage }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full p-4 text-center">
      <HelpCircle className="w-16 h-16 mb-4 text-[var(--color-primary)] opacity-60" />
      <h3 className="text-xl font-semibold mb-2">Comienza tu CV</h3>
      <p className="text-[var(--color-text-secondary)] mb-6 max-w-md">
        ¿Listo para crear un CV que sí diga quién eres? Elige por dónde quieres empezar, o escríbeme lo que necesites.
      </p>
      
      <div className="grid gap-3 w-full max-w-md">
        {predefinedMessages.map((option, index) => (
          <div
            key={index}
            className="cursor-pointer"
            onClick={() => onSendPredefinedMessage(option.message)}
          >
            <Card className="p-3 hover:bg-[var(--color-bg-hover)] transition-colors border-[var(--color-border)]">
              <div className="flex items-center">
                {option.icon}
                <div className="flex flex-col ml-2">
                  <h4 className="text-xs font-semibold text-left text-[var(--color-text-secondary)] opacity-80">{option.groupTitle}</h4>
                  <span>{option.label}</span>
                </div>
              </div>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
}; 