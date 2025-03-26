
import React, { useState } from "react";
import Header from "@/components/Header";
import ChatWindow from "@/components/ChatWindow";
import Modal from "@/components/Modal";
import ExperienceForm, { ExperienceData } from "@/components/ExperienceForm";
import EducationForm, { EducationData } from "@/components/EducationForm";
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

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <Header onToggleSidebar={toggleSidebar} />
      
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div
          className={`fixed inset-y-0 left-0 z-20 w-64 transform bg-card shadow-lg transition-transform duration-300 ease-in-out sm:translate-x-0 ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex h-16 items-center justify-between border-b px-4">
            <h2 className="text-lg font-medium">Menú</h2>
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-md hover:bg-secondary transition-colors sm:hidden"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 8.586L4.707 3.293a1 1 0 00-1.414 1.414L8.586 10l-5.293 5.293a1 1 0 101.414 1.414L10 11.414l5.293 5.293a1 1 0 001.414-1.414L11.414 10l5.293-5.293a1 1 0 00-1.414-1.414L10 8.586z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
          
          <nav className="px-4 py-4">
            <ul className="space-y-2">
              <li>
                <a
                  href="#"
                  className="flex items-center rounded-md px-3 py-2 text-sm font-medium bg-secondary/50"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-3"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                  </svg>
                  Inicio
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-secondary/50 transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-3"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
                  </svg>
                  Mis CVs
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-secondary/50 transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-3"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Ajustes
                </a>
              </li>
            </ul>
          </nav>
        </div>
        
        {/* Overlay for mobile */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 z-10 bg-foreground/20 sm:hidden"
            onClick={toggleSidebar}
          ></div>
        )}
        
        {/* Main content */}
        <main className={`relative flex-1 overflow-hidden transition-all duration-300 ${
          isSidebarOpen ? "sm:ml-64" : ""
        }`}>
          <ChatWindow onOpenModal={handleOpenModal} />
        </main>
      </div>
      
      {/* Modals */}
      <Modal
        isOpen={activeModal === "experience"}
        onClose={handleCloseModal}
        title="Añadir experiencia laboral"
      >
        <ExperienceForm
          onSubmit={handleExperienceSubmit}
          onCancel={handleCloseModal}
        />
      </Modal>
      
      <Modal
        isOpen={activeModal === "education"}
        onClose={handleCloseModal}
        title="Añadir educación"
      >
        <EducationForm
          onSubmit={handleEducationSubmit}
          onCancel={handleCloseModal}
        />
      </Modal>
      
      <Modal
        isOpen={activeModal === "skills"}
        onClose={handleCloseModal}
        title="Añadir habilidades"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium">
              Habilidades
            </label>
            <p className="text-sm text-muted-foreground">
              Ingresa tus habilidades separadas por comas (ej. HTML, CSS, JavaScript)
            </p>
            <textarea
              id="skills"
              name="skills"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="Tus habilidades..."
              rows={4}
            ></textarea>
          </div>
          
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleCloseModal}
              className="rounded-md px-4 py-2 text-sm font-medium hover:bg-secondary transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={() => handleSkillsSubmit(["HTML", "CSS", "JavaScript"])}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Guardar
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Index;
