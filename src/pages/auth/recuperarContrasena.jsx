import { useState } from "react";
import api from "@/utils/axios"; // Importa tu cliente Axios
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner";
import { useUser } from "@/utils/UserContext";
import { crearLog } from "@/utils/logs";

function RecuperarContrasena() {
  const { user } = useUser();
  const [email, setEmail] = useState("");

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
      crearLog(`INFO: Correo de recuperación enviado a ${email}`, user.userId);
    } catch (error) {
      // Cerrar el toast de carga y mostrar un toast de error
      toast.error("Error al enviar el correo electrónico. Por favor, inténtalo de nuevo.", {
        id: toastId, // Asocia el toast de error con el toast de carga
        duration: 5000,
        position: "top-right",
        richColors: true,
      });
      crearLog(`ERROR: No se pudo enviar correo de recuperación a ${email}`, user.userId);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen px-2">
        <Card className="w-full max-w-sm sm:w-[400px]">       
        <CardHeader>
          <CardTitle className="text-xs sm:text-xl text-center">Recuperar Contraseña</CardTitle>
          <CardDescription className="text-xs sm:text-sm text-center">
            Ingresa tu correo electrónico para recibir un enlace de recuperación.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
            <div>
              <Label htmlFor="email" className="text-xs sm:text-sm">Correo Electrónico</Label>
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