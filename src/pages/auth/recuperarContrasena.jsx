import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/utils/axios"; // Importa tu cliente Axios
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner";

function RecuperarContrasena() {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Mostrar un toast de carga mientras se envía el correo
    const toastId = toast.loading("Enviando correo de recuperación...");

    try {
      // Enviar el correo electrónico al backend
      const response = await api.post("/auth/recuperar-contrasena", { email });

      // Cerrar el toast de carga y mostrar un toast de éxito
      toast.success(response.data.message, {
        id: toastId, // Asocia el toast de éxito con el toast de carga
        duration: 5000,
        position: "top-right",
        richColors: true,
      });
    } catch (error) {
      // Cerrar el toast de carga y mostrar un toast de error
      toast.error("Error al enviar el correo electrónico. Por favor, inténtalo de nuevo.", {
        id: toastId, // Asocia el toast de error con el toast de carga
        duration: 5000,
        position: "top-right",
        richColors: true,
      });
    }
  };

  return (
    <div className="flex items-center justify-center h-screen">
      <Card className="w-[450px]">
        <CardHeader>
          <CardTitle>Recuperar Contraseña</CardTitle>
          <CardDescription>Ingresa tu correo electrónico para recibir un enlace de recuperación.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
            <div>
              <Label htmlFor="email">Correo Electrónico</Label>
              <Input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <Button type="submit">Enviar Enlace de Recuperación</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default RecuperarContrasena;