
import { cn } from "@/lib/utils";
import React from "react";
import { Menu } from "lucide-react";

interface HeaderProps {
  className?: string;
  onToggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ className, onToggleSidebar }) => {
  return (
    <header className={cn(
      "w-full border-b bg-card/80 backdrop-blur-sm shadow-sm",
      className
    )}>
      <div className="w-full px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button 
            onClick={onToggleSidebar}
            className="p-2 rounded-md hover:bg-secondary transition-colors"
          >
            <Menu className="flex md:hidden" size={20} />
          </button>
          <h1 className="text-xl font-medium">CV Conversacional</h1>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-primary"></div>
            <span className="text-sm font-medium">Información Personal</span>
          </div>
          <div className="hidden sm:flex items-center gap-2 mx-2">
            <div className="h-2 w-2 rounded-full bg-muted"></div>
            <span className="text-sm text-muted-foreground">Experiencia</span>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-muted"></div>
            <span className="text-sm text-muted-foreground">Educación</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
