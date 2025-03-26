
import React from "react";
import { FileText, FileCheck, Plus, Home, Settings, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

interface CVSidebarProps {
  className?: string;
}

const CVSidebar: React.FC<CVSidebarProps> = ({ className }) => {
  const navigate = useNavigate();
  
  // Ejemplo de CVs completados (en una aplicación real, estos vendrían de una base de datos)
  const savedCVs = [
    { id: "1", name: "CV Desarrollador Frontend", lastUpdated: "2023-08-15" },
    { id: "2", name: "CV Diseñador UX/UI", lastUpdated: "2023-09-22" }
  ];

  return (
    <div className={cn("flex flex-col h-full", className)}>
      <div className="flex-1 overflow-auto py-2">
        <nav>
          <ul className="space-y-2 px-2">
            <li>
              <a
                href="#"
                className="flex items-center rounded-md px-3 py-2 text-sm font-medium bg-secondary/50"
                onClick={(e) => {
                  e.preventDefault();
                  navigate("/");
                }}
              >
                <Home className="h-5 w-5 mr-3" />
                Inicio
              </a>
            </li>
            
            <li>
              <a
                href="#"
                className="flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-secondary/50 transition-colors"
                onClick={(e) => {
                  e.preventDefault();
                  navigate("/profile");
                }}
              >
                <User className="h-5 w-5 mr-3" />
                Mi Perfil
              </a>
            </li>
            
            {/* Sección de CVs Guardados */}
            <li className="pt-4">
              <div className="px-3 mb-2">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Mis CVs
                </h3>
              </div>
              
              <ul className="space-y-1">
                {savedCVs.map((cv) => (
                  <li key={cv.id}>
                    <a
                      href="#"
                      className="flex items-center justify-between rounded-md px-3 py-2 text-sm hover:bg-secondary/50 transition-colors"
                    >
                      <div className="flex items-center">
                        <FileCheck className="h-4 w-4 mr-3 text-primary" />
                        <span className="truncate">{cv.name}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(cv.lastUpdated).toLocaleDateString()}
                      </span>
                    </a>
                  </li>
                ))}
                
                <li>
                  <button 
                    className="w-full flex items-center rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-secondary/50 transition-colors"
                    onClick={() => navigate("/preview")}
                  >
                    <FileText className="h-4 w-4 mr-3" />
                    <span>CV Actual</span>
                  </button>
                </li>
                
                <li>
                  <button className="w-full flex items-center rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-secondary/50 transition-colors">
                    <Plus className="h-4 w-4 mr-3" />
                    <span>Crear Nuevo CV</span>
                  </button>
                </li>
              </ul>
            </li>
          </ul>
        </nav>
      </div>
      
      {/* Footer con configuración */}
      <div className="border-t py-2 px-2">
        <button className="w-full flex items-center rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-secondary/50 transition-colors">
          <Settings className="h-4 w-4 mr-3" />
          <span>Ajustes</span>
        </button>
      </div>
    </div>
  );
};

export default CVSidebar;
