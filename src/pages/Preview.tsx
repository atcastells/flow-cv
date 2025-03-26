
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import CVPreview from "@/components/CVPreview";
import { toast } from "sonner";
import { FileText, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const PreviewPage = () => {
  const navigate = useNavigate();
  const [isGenerating, setIsGenerating] = useState(false);

  // Sample data - In a real app, this would come from your app's state or backend
  const cvData = {
    personalData: {
      name: "Ana García Martínez",
      email: "ana.garcia@example.com",
      phone: "+34 612 345 678",
      address: "Madrid, España"
    },
    experiences: [
      {
        company: "Tecnologías Innovadoras S.L.",
        position: "Desarrolladora Full Stack",
        startDate: "Enero 2021",
        endDate: "Presente",
        description: "Desarrollo de aplicaciones web utilizando React, Node.js y MongoDB. Implementación de APIs RESTful y arquitecturas orientadas a microservicios."
      },
      {
        company: "Consultora Digital",
        position: "Desarrolladora Frontend",
        startDate: "Marzo 2018",
        endDate: "Diciembre 2020",
        description: "Diseño y desarrollo de interfaces de usuario responsivas utilizando HTML, CSS y JavaScript. Colaboración con equipos de UX/UI para mejorar la experiencia de usuario."
      }
    ],
    education: [
      {
        institution: "Universidad Complutense de Madrid",
        degree: "Grado en Ingeniería Informática",
        startDate: "2014",
        endDate: "2018",
        description: "Especialización en Ingeniería del Software. Proyecto final: Desarrollo de una plataforma de e-learning."
      }
    ],
    skills: ["JavaScript", "React", "Node.js", "HTML/CSS", "MongoDB", "Git", "Docker", "Metodologías Ágiles", "TypeScript"]
  };

  const handleDownloadPDF = async () => {
    const cvElement = document.getElementById("cv-preview");
    if (!cvElement) return;

    setIsGenerating(true);
    toast.info("Generando PDF, por favor espera...");

    try {
      const canvas = await html2canvas(cvElement, {
        scale: 2,
        useCORS: true,
        logging: false
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });

      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      pdf.save("mi_curriculum.pdf");
      toast.success("CV descargado correctamente");
    } catch (error) {
      console.error("Error al generar el PDF:", error);
      toast.error("Hubo un problema al generar el PDF");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="container max-w-6xl mx-auto py-8 px-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Vista previa de tu CV</h1>
          <p className="text-muted-foreground mt-1">
            Así es como se verá tu currículum
          </p>
        </div>
        <div className="flex gap-4">
          <Button
            variant="outline"
            onClick={() => navigate("/")}
            className="gap-2"
          >
            <FileText size={18} />
            Volver al editor
          </Button>
          <Button 
            onClick={handleDownloadPDF} 
            disabled={isGenerating}
            className={cn("gap-2", isGenerating && "opacity-80")}
          >
            <Download size={18} />
            {isGenerating ? "Generando..." : "Descargar PDF"}
          </Button>
        </div>
      </div>

      <div id="cv-preview" className="bg-white p-6 rounded-lg shadow-md">
        <CVPreview
          personalData={cvData.personalData}
          experiences={cvData.experiences}
          education={cvData.education}
          skills={cvData.skills}
        />
      </div>
    </div>
  );
};

export default PreviewPage;
