
import React, { useState } from "react";
import Header from "@/components/Header";
import ChatWindow from "@/components/ChatWindow";
import Modal from "@/components/Modal";
import ExperienceForm, { ExperienceData } from "@/components/ExperienceForm";
import EducationForm, { EducationData } from "@/components/EducationForm";
import CVSidebar from "@/components/CVSidebar";
import { toast } from "sonner";

const Index = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
  
  const handleOpenModal = (modalType: string) => {
    setActiveModal(modalType);
  };
  
  const handleCloseModal = () => {
    setActiveModal(null);
  };
  
  const handleExperienceSubmit = (data: ExperienceData) => {
    console.log("Experience submitted:", data);
    toast.success("Experiencia laboral añadida correctamente");
    handleCloseModal();
  };
  
  const handleEducationSubmit = (data: EducationData) => {
    console.log("Education submitted:", data);
    toast.success("Educación añadida correctamente");
    handleCloseModal();
  };
  
  const handleSkillsSubmit = (skills: string[]) => {
    console.log("Skills submitted:", skills);
    toast.success("Habilidades añadidas correctamente");
    handleCloseModal();
  };

  const handleProfileSubmit = (data: any) => {
    console.log("Profile submitted:", data);
    toast.success("Perfil actualizado correctamente");
    handleCloseModal();
  };

  const handleProjectsSubmit = (projects: any[]) => {
    console.log("Projects submitted:", projects);
    toast.success("Proyectos añadidos correctamente");
    handleCloseModal();
  };

  const handleAwardsSubmit = (awards: any[]) => {
    console.log("Awards submitted:", awards);
    toast.success("Premios añadidos correctamente");
    handleCloseModal();
  };

  const handleFileUpload = (file: File) => {
    console.log("File uploaded:", file);
    toast.success("CV subido correctamente. Procesando información...");
    // Aquí iría la lógica para procesar el archivo
    setTimeout(() => {
      toast.success("Información extraída con éxito");
      handleCloseModal();
    }, 2000);
  };

  return (
    <div className="relative flex h-screen w-full overflow-hidden">
      {/* Sidebar */}
      <CVSidebar
        isCollapsed={isSidebarOpen}
        onToggleCollapse={toggleSidebar}
      />
      
      {/* Overlay for mobile */}
      {!isSidebarOpen && (
        <div
          className="fixed inset-0 z-10 bg-foreground/20 md:hidden"
          onClick={toggleSidebar}
        ></div>
      )}
      
      {/* Main content container */}
      <div className="flex h-full flex-1 flex-col">
        <Header onToggleSidebar={toggleSidebar} />
        <main className="relative flex-1 overflow-hidden">
          <ChatWindow onOpenModal={handleOpenModal} />
        </main>
      </div>
    </div>
  );
};

export default Index;
