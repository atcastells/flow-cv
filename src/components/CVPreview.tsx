
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface CVPreviewProps {
  personalData?: {
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
  };
  experiences?: Array<{
    company: string;
    position: string;
    startDate: string;
    endDate: string;
    description: string;
  }>;
  education?: Array<{
    institution: string;
    degree: string;
    startDate: string;
    endDate: string;
    description: string;
  }>;
  skills?: string[];
  className?: string;
}

const CVPreview: React.FC<CVPreviewProps> = ({
  personalData = {},
  experiences = [],
  education = [],
  skills = [],
  className,
}) => {
  return (
    <Card className={cn("w-full max-w-3xl mx-auto", className)}>
      <CardHeader className="border-b pb-4">
        <CardTitle className="text-2xl font-bold">
          {personalData.name || "Tu Nombre"}
        </CardTitle>
        <div className="text-sm text-muted-foreground">
          {personalData.email && (
            <div className="flex items-center gap-1 mt-1">
              <span className="font-medium">Email:</span> {personalData.email}
            </div>
          )}
          {personalData.phone && (
            <div className="flex items-center gap-1 mt-1">
              <span className="font-medium">Teléfono:</span> {personalData.phone}
            </div>
          )}
          {personalData.address && (
            <div className="flex items-center gap-1 mt-1">
              <span className="font-medium">Dirección:</span> {personalData.address}
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        {experiences.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Experiencia Profesional</h3>
            <div className="space-y-4">
              {experiences.map((exp, index) => (
                <div key={index} className="border-l-2 border-primary pl-4 py-1">
                  <div className="flex justify-between">
                    <h4 className="font-medium">{exp.position}</h4>
                    <span className="text-sm text-muted-foreground">
                      {exp.startDate} - {exp.endDate}
                    </span>
                  </div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">
                    {exp.company}
                  </div>
                  <p className="text-sm">{exp.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {education.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Educación</h3>
            <div className="space-y-4">
              {education.map((edu, index) => (
                <div key={index} className="border-l-2 border-primary pl-4 py-1">
                  <div className="flex justify-between">
                    <h4 className="font-medium">{edu.degree}</h4>
                    <span className="text-sm text-muted-foreground">
                      {edu.startDate} - {edu.endDate}
                    </span>
                  </div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">
                    {edu.institution}
                  </div>
                  <p className="text-sm">{edu.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {skills.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-2">Habilidades</h3>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-secondary text-secondary-foreground rounded-md text-sm"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CVPreview;
