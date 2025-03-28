import React from "react";
import { FileText, FileCheck, Plus, Home, Settings, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";


interface CVSidebarProps {
  className?: string;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

const CVSidebar: React.FC<CVSidebarProps> = ({ className, isCollapsed = false, onToggleCollapse }) => {
  const navigate = useNavigate();

  return (
    <div className={cn(
      "flex flex-col h-screen transition-all duration-300",
      isCollapsed ? "-translate-x-full md:translate-x-0 md:w-16" : "translate-x-0 w-64",
      "fixed md:sticky", // Fixed on mobile, sticky on desktop
      "top-0 left-0", // Align to top-left corner
      "bg-background",
      "border-r z-30",
      className
    )}>
      <button
        onClick={onToggleCollapse}
        className={cn(
          "absolute right-0 top-4 -mr-3 flex h-6 w-6 items-center justify-center rounded-full bg-background border shadow-md hover:bg-secondary transition-colors",
          isCollapsed ? "hidden md:flex" : ""
        )}
        aria-label={isCollapsed ? "Expandir menú" : "Colapsar menú"}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className={cn("h-4 w-4 transition-transform", isCollapsed ? "rotate-180" : "")}
        >
          <path
            fillRule="evenodd"
            d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z"
            clipRule="evenodd"
          />
        </svg>
      </button>
      <div className={cn("flex-1 overflow-auto py-2 transition-all duration-300", isCollapsed ? "" : "opacity-100 px-2")}>
        <div>
          <nav>
            <button
              className="w-full flex items-center rounded-md px-3 py-2 text-sm font-medium bg-secondary/50"
              onClick={() => navigate("/")}
            >
              <Home className="h-5 w-5 mr-3" />
              <span className={
                cn("transition-colors", isCollapsed ? "hidden" : "")
              }>Inicio</span>
            </button>
            <button
              className="w-full flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-secondary/50 transition-colors"
              onClick={() => navigate("/profile")}
            >
              <User className="h-5 w-5 mr-3" />
              <span className={
                cn("transition-colors", isCollapsed ? "hidden" : "")
              }>Mi Perfil</span>
            </button>
          </nav>
        </div>
      </div>

      {/* Footer con configuración */}
      <div className="border-t py-2">
        <button
          className="w-full flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-secondary/50 transition-colors"
        >
          <Settings className="h-5 w-5 mr-3" />
          <span className={
            cn("transition-colors", isCollapsed ? "hidden" : "")
          }>Ajustes</span>
        </button>
      </div>
    </div>
  );
};

export default CVSidebar;
