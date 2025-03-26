
import React, { useState } from "react";
import { cn } from "@/lib/utils";

interface ExperienceFormProps {
  onSubmit: (data: ExperienceData) => void;
  onCancel: () => void;
  className?: string;
}

export interface ExperienceData {
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  description: string;
  currentJob: boolean;
}

const ExperienceForm: React.FC<ExperienceFormProps> = ({
  onSubmit,
  onCancel,
  className,
}) => {
  const [formData, setFormData] = useState<ExperienceData>({
    company: "",
    position: "",
    startDate: "",
    endDate: "",
    description: "",
    currentJob: false,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className={cn("space-y-4", className)}>
      <div className="space-y-2">
        <label htmlFor="company" className="block text-sm font-medium">
          Empresa
        </label>
        <input
          id="company"
          name="company"
          type="text"
          required
          value={formData.company}
          onChange={handleChange}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          placeholder="Nombre de la empresa"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="position" className="block text-sm font-medium">
          Puesto
        </label>
        <input
          id="position"
          name="position"
          type="text"
          required
          value={formData.position}
          onChange={handleChange}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          placeholder="Título del puesto"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="startDate" className="block text-sm font-medium">
            Fecha de inicio
          </label>
          <input
            id="startDate"
            name="startDate"
            type="date"
            required
            value={formData.startDate}
            onChange={handleChange}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="endDate" className="block text-sm font-medium">
            Fecha de término
          </label>
          <input
            id="endDate"
            name="endDate"
            type="date"
            required={!formData.currentJob}
            disabled={formData.currentJob}
            value={formData.endDate}
            onChange={handleChange}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
          />
        </div>
      </div>

      <div className="flex items-center">
        <input
          id="currentJob"
          name="currentJob"
          type="checkbox"
          checked={formData.currentJob}
          onChange={handleCheckboxChange}
          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
        />
        <label htmlFor="currentJob" className="ml-2 block text-sm">
          Es mi trabajo actual
        </label>
      </div>

      <div className="space-y-2">
        <label htmlFor="description" className="block text-sm font-medium">
          Descripción
        </label>
        <textarea
          id="description"
          name="description"
          required
          value={formData.description}
          onChange={handleChange}
          rows={4}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          placeholder="Describe tus responsabilidades y logros"
        ></textarea>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md px-4 py-2 text-sm font-medium hover:bg-secondary transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Guardar
        </button>
      </div>
    </form>
  );
};

export default ExperienceForm;
