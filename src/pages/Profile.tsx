
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, Save } from "lucide-react";
import { useProfileStore } from "@/features/store";


const Profile = () => {
  const navigate = useNavigate();
  
  // Usar el store de Zustand para los datos del perfil
  const { personalData, updatePersonalData } = useProfileStore();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    updatePersonalData(name as keyof typeof personalData, value);
  };

  const handleSaveProfile = () => {
    // Los datos ya están guardados en el store persistente
    console.log("Perfil guardado:", personalData);
    toast.success("Perfil actualizado correctamente");
  };

  return (
    <div className="container max-w-3xl mx-auto py-8 px-4">
      <div className="flex items-center mb-8 gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate("/")}
          className="gap-2"
        >
          <ArrowLeft size={16} />
          Volver
        </Button>
        <h1 className="text-3xl font-bold">Tu Perfil</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información Personal</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-6">
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre completo</Label>
                  <Input
                    id="name"
                    name="name"
                    value={personalData.name}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Correo electrónico</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={personalData.email}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={personalData.phone}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Ubicación</Label>
                  <Input
                    id="address"
                    name="address"
                    value={personalData.address}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="summary">Resumen profesional</Label>
                <Textarea
                  id="summary"
                  name="summary"
                  rows={4}
                  value={personalData.summary}
                  onChange={handleInputChange}
                  placeholder="Breve descripción sobre ti y tu experiencia profesional"
                />
              </div>
            </div>
            
            <Button 
              type="button" 
              onClick={handleSaveProfile}
              className="w-full sm:w-auto gap-2"
            >
              <Save size={16} />
              Guardar cambios
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;
