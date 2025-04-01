import React from "react";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";

export type QuickAction = 'SHOW_PROFILE' | 'SHOW_SKILLS' | 'SHOW_EXPERIENCE' | 'PREVIEW_CV';

interface QuickActionsBarProps {
  onActionClick: (actionType: QuickAction) => void;
}

const QuickActionsBar: React.FC<QuickActionsBarProps> = ({ onActionClick }) => {
  return (
    <div className="flex gap-2 mt-2"> {/* Add margin-top for spacing from the input area */}
      <Button 
        variant="outline" 
        size="sm"
        onClick={() => onActionClick('SHOW_PROFILE')}
        className="flex items-center gap-2 bg-red-500 text-white hover:bg-red-600 hover:text-white "
      >
        <User className="h-4 w-4" />
        <span>Mi Perfil</span>
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onActionClick('SHOW_SKILLS')}
        className="flex items-center gap-2 bg-blue-500 text-white hover:bg-blue-600 hover:text-white "
      >
        <User className="h-4 w-4" />
        <span>Mis Habilidades</span>
        </Button>
      {/* More Quick Action buttons will be added here later */}
    </div>
  );
};

export default QuickActionsBar;