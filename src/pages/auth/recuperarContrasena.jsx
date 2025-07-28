import { useState } from "react";
import api from "@/utils/axios"; // Importa tu cliente Axios
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";

function RecuperarContrasena() {
  const [email, setEmail] = useState("");
  toast.dismiss("terminos-toast");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const toastId = toast.loading("Enviando correo de recuperación...");

    try {
      const response = await api.post("/auth/recuperar-contrasena", { email });

      // Siempre que el status sea 200, muestra éxito
      if (response.status === 200) {
        toast.success(
          response.data?.message ||
            "Correo de recuperación enviado correctamente.",
          {
            id: toastId,
            duration: 5000,
            position: "top-right",
            richColors: true,
          }
        );
      } else {
        toast.error("No se pudo enviar el correo. Intenta de nuevo.", {
          id: toastId,
          duration: 5000,
          position: "top-right",
          richColors: true,
        });
      }
    } catch (error) {
      toast.error(
        "Error al enviar el correo electrónico. Por favor, inténtalo de nuevo.",
        {
          id: toastId,
          duration: 5000,
          position: "top-right",
          richColors: true,
        }
      );
    }
  };

  return (
    <div className="flex items-center justify-center h-screen px-2">
      <Card className="w-full max-w-sm sm:w-[400px]">
        <CardHeader>
          <CardTitle className="text-xs sm:text-xl text-center">
            Recuperar Contraseña
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm text-center">
            Ingresa tu correo electrónico para recibir un enlace de
            recuperación.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
            <div>
              <Label htmlFor="email" className="text-xs sm:text-sm">
                Correo Electrónico
              </Label>
              <Input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="text-xs sm:text-sm"
              />
            </div>
            <Button type="submit" className="text-xs sm:text-sm">
              Enviar Enlace de Recuperación
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default RecuperarContrasena;