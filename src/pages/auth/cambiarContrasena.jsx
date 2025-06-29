import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "@/utils/axios"; // Importa tu cliente Axios
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner";

function CambiarContrasena() {
  const [nuevaContrasena, setNuevaContrasena] = useState("");
  const [confirmarContrasena, setConfirmarContrasena] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const [passwordMatchMessage, setPasswordMatchMessage] = useState("");

  // Obtener el token de la URL
  const searchParams = new URLSearchParams(location.search);
  const token = searchParams.get('token');

  useEffect(() => {
    if (nuevaContrasena === "" || confirmarContrasena === "") {
      setPasswordMatchMessage(""); // No mostrar mensaje si alguno de los campos está vacío
    } else if (nuevaContrasena === confirmarContrasena) {
      setPasswordMatchMessage("Las contraseñas coinciden");
    } else {
      setPasswordMatchMessage("Las contraseñas no coinciden");
    }
  }, [nuevaContrasena, confirmarContrasena]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (nuevaContrasena !== confirmarContrasena) {
      toast.error("Las contraseñas no coinciden",{
        duration: 5000,
        position: "top-right",
        richColors: true,
      });
      return;
    }

    try {
      // Enviar la nueva contraseña y el token al backend
      await api.post("/auth/cambiar-contrasena", {
        token: token,
        nuevaContrasena: nuevaContrasena,
      });
      toast.success("Contraseña cambiada con éxito. Redirigiendo al inicio de sesión...",{
        duration: 5000,
        position: "top-right",
        richColors: true,
      });
      setTimeout(() => {
        navigate("/login"); // Redirigir al inicio de sesión después de un tiempo
      }, 3000);
    } catch (error) {
      toast.error("Error al cambiar la contraseña. Por favor, inténtalo de nuevo.",{
        duration: 5000,
        position: "top-right",
        richColors: true,
      });
    }
  };

  return (
    <div className="flex items-center justify-center h-screen px-2">
      <Card className="w-full max-w-sm sm:w-[400px]">
        <CardHeader>
          <CardTitle className="text-xs sm:text-xl text-center">Cambiar Contraseña</CardTitle>
          <CardDescription className="text-xs sm:text-sm text-center">
            Ingresa tu nueva contraseña.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
            <div>
              <Label htmlFor="nuevaContrasena" className="text-xs sm:text-sm">Nueva Contraseña</Label>
              <Input
                type="password"
                id="nuevaContrasena"
                value={nuevaContrasena}
                onChange={(e) => {
                  setNuevaContrasena(e.target.value);
                }}
                required
                className="text-xs sm:text-sm"
              />
            </div>
            <div>
              <Label htmlFor="confirmarContrasena" className="text-xs sm:text-sm">Confirmar Contraseña</Label>
              <Input
                type="password"
                id="confirmarContrasena"
                value={confirmarContrasena}
                onChange={(e) => {
                  setConfirmarContrasena(e.target.value);
                }}
                required
                className="text-xs sm:text-sm"
              />
            </div>
            {passwordMatchMessage && (
              <p className={`text-xs sm:text-sm ${nuevaContrasena === confirmarContrasena ? "text-green-500" : "text-red-500"}`}>
                {passwordMatchMessage}
              </p>
            )}
            <Button type="submit" className="text-xs sm:text-sm">
              Cambiar Contraseña
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default CambiarContrasena;