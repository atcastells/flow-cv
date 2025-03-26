
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
          
          {/* Reemplazamos la navegación anterior con nuestro componente CVSidebar */}
          <CVSidebar />
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
        isOpen={activeModal === "work"}
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

      <Modal
        isOpen={activeModal === "profile"}
        onClose={handleCloseModal}
        title="Añadir información de perfil"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="block text-sm font-medium">Nombre completo</label>
              <input
                type="text"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="Tu nombre"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium">Título profesional</label>
              <input
                type="text"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="Ej. Desarrollador Web"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="block text-sm font-medium">Correo electrónico</label>
              <input
                type="email"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="tu@email.com"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium">Teléfono</label>
              <input
                type="tel"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="+34 123 456 789"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="block text-sm font-medium">Ubicación</label>
              <input
                type="text"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="Ciudad, País"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium">Sitio web</label>
              <input
                type="url"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="https://tusitio.com"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium">Resumen profesional</label>
            <textarea
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              rows={4}
              placeholder="Breve descripción de tu perfil profesional..."
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
              onClick={() => handleProfileSubmit({
                name: "Ana García",
                title: "Desarrolladora Web",
                email: "ana@example.com"
              })}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Guardar
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={activeModal === "projects"}
        onClose={handleCloseModal}
        title="Añadir proyectos"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium">Nombre del proyecto</label>
            <input
              type="text"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder="Nombre del proyecto"
            />
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium">Descripción</label>
            <textarea
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              rows={3}
              placeholder="Descripción del proyecto..."
            ></textarea>
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium">Tecnologías utilizadas</label>
            <input
              type="text"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder="Ej. React, Node.js, MongoDB"
            />
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium">Enlace</label>
            <input
              type="url"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder="https://proyecto.com"
            />
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
              onClick={() => handleProjectsSubmit([{
                name: "Proyecto Web",
                description: "Aplicación de ejemplo",
                technologies: "React, Node.js",
                link: "https://ejemplo.com"
              }])}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Guardar
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={activeModal === "awards"}
        onClose={handleCloseModal}
        title="Añadir premios y reconocimientos"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium">Título del premio</label>
            <input
              type="text"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder="Nombre del premio o reconocimiento"
            />
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium">Otorgado por</label>
            <input
              type="text"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder="Institución que otorgó el premio"
            />
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium">Fecha</label>
            <input
              type="date"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium">Descripción</label>
            <textarea
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              rows={3}
              placeholder="Descripción del premio o reconocimiento..."
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
              onClick={() => handleAwardsSubmit([{
                title: "Premio a la Innovación",
                issuer: "Asociación de Desarrolladores",
                date: "2023-05-15",
                description: "Reconocimiento por proyecto innovador"
              }])}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Guardar
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={activeModal === "upload"}
        onClose={handleCloseModal}
        title="Adjuntar CV existente"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium">
              Selecciona tu CV
            </label>
            <p className="text-sm text-muted-foreground">
              Acepto formatos PDF, DOCX y TXT. Extraeré automáticamente la información para crear tu nuevo CV.
            </p>
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-background hover:bg-secondary/30 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <svg className="w-8 h-8 mb-3 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                  </svg>
                  <p className="mb-2 text-sm text-muted-foreground">
                    <span className="font-semibold">Haz clic para seleccionar</span> o arrastra y suelta
                  </p>
                  <p className="text-xs text-muted-foreground">PDF, DOCX, TXT (MAX. 10MB)</p>
                </div>
                <input type="file" className="hidden" accept=".pdf,.docx,.doc,.txt" />
              </label>
            </div>
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
              onClick={() => handleFileUpload(new File([], "ejemplo-cv.pdf"))}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Subir y procesar
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Index;
