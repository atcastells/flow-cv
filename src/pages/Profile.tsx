
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, Save } from "lucide-react";

const Profile = () => {
  const navigate = useNavigate();
  
  // Estado para los datos del perfil
  const [profile, setProfile] = useState({
    personalData: {
      name: "Ana García Martínez",
      email: "ana.garcia@example.com",
      phone: "+34 612 345 678",
      address: "Madrid, España",
      summary: "Desarrolladora Full Stack con más de 5 años de experiencia creando aplicaciones web modernas y escalables."
    }
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      personalData: {
        ...prev.personalData,
        [name]: value
      }
    }));
  };

  const handleSaveProfile = () => {
    // Aquí se guardarían los datos en una base de datos o localStorage
    console.log("Perfil guardado:", profile);
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
                    value={profile.personalData.name}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Correo electrónico</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={profile.personalData.email}
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
                    value={profile.personalData.phone}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Ubicación</Label>
                  <Input
                    id="address"
                    name="address"
                    value={profile.personalData.address}
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
                  value={profile.personalData.summary}
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
