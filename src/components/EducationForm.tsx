
import React, { useState } from "react";
import { cn } from "@/lib/utils";

interface EducationFormProps {
  onSubmit: (data: EducationData) => void;
  onCancel: () => void;
  className?: string;
}

export interface EducationData {
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  description: string;
  current: boolean;
}

const EducationForm: React.FC<EducationFormProps> = ({
  onSubmit,
  onCancel,
  className,
}) => {
  const [formData, setFormData] = useState<EducationData>({
    institution: "",
    degree: "",
    field: "",
    startDate: "",
    endDate: "",
    description: "",
    current: false,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
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
        <label htmlFor="institution" className="block text-sm font-medium">
          Institución
        </label>
        <input
          id="institution"
          name="institution"
          type="text"
          required
          value={formData.institution}
          onChange={handleChange}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          placeholder="Nombre de la institución educativa"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="degree" className="block text-sm font-medium">
            Título
          </label>
          <select
            id="degree"
            name="degree"
            required
            value={formData.degree}
            onChange={handleChange}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="">Seleccionar</option>
            <option value="Bachillerato">Bachillerato</option>
            <option value="Técnico">Técnico</option>
            <option value="Licenciatura">Licenciatura</option>
            <option value="Maestría">Maestría</option>
            <option value="Doctorado">Doctorado</option>
            <option value="Diplomado">Diplomado</option>
            <option value="Certificación">Certificación</option>
            <option value="Otro">Otro</option>
          </select>
        </div>

        <div className="space-y-2">
          <label htmlFor="field" className="block text-sm font-medium">
            Campo de estudio
          </label>
          <input
            id="field"
            name="field"
            type="text"
            required
            value={formData.field}
            onChange={handleChange}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            placeholder="Ej. Informática"
          />
        </div>
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
            required={!formData.current}
            disabled={formData.current}
            value={formData.endDate}
            onChange={handleChange}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
          />
        </div>
      </div>

      <div className="flex items-center">
        <input
          id="current"
          name="current"
          type="checkbox"
          checked={formData.current}
          onChange={handleCheckboxChange}
          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
        />
        <label htmlFor="current" className="ml-2 block text-sm">
          Actualmente estudio aquí
        </label>
      </div>

      <div className="space-y-2">
        <label htmlFor="description" className="block text-sm font-medium">
          Descripción
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          placeholder="Logros académicos, actividades destacadas, etc."
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

export default EducationForm;
