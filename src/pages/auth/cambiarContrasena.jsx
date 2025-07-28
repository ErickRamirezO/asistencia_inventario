import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "@/utils/axios"; // Importa tu cliente Axios
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&._\-]).{12,}$/;

function CambiarContrasena() {
  const [nuevaContrasena, setNuevaContrasena] = useState("");
  const [confirmarContrasena, setConfirmarContrasena] = useState("");
  const [passwordMatchMessage, setPasswordMatchMessage] = useState("");
  const [passwordValidMessage, setPasswordValidMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  toast.dismiss("terminos-toast");

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
    // Validación en tiempo real de seguridad
    if (nuevaContrasena.length === 0) {
      setPasswordValidMessage("");
    } else if (!passwordRegex.test(nuevaContrasena)) {
      setPasswordValidMessage("Debe tener mínimo 12 caracteres, una mayúscula, una minúscula, un número y un carácter especial.");    } else {
      setPasswordValidMessage("");
    }
  }, [nuevaContrasena, confirmarContrasena]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!passwordRegex.test(nuevaContrasena)) {
      toast.error("La contraseña no cumple con los requisitos de seguridad.", {
        duration: 5000,
        position: "top-right",
        richColors: true,
      });
      return;
    }

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
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  id="nuevaContrasena"
                  value={nuevaContrasena}
                  onChange={(e) => setNuevaContrasena(e.target.value)}
                  required
                  className="text-xs sm:text-sm pr-10"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              <span className="text-[11px] text-muted-foreground">
                Mínimo 12 caracteres, una mayúscula, una minúscula, un número y un carácter especial.
              </span>
              {passwordValidMessage && (
                <p className="text-xs sm:text-sm text-red-500">{passwordValidMessage}</p>
              )}
            </div>
            <div>
              <Label htmlFor="confirmarContrasena" className="text-xs sm:text-sm">Confirmar Contraseña</Label>
              <div className="relative">
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmarContrasena"
                  value={confirmarContrasena}
                  onChange={(e) => setConfirmarContrasena(e.target.value)}
                  required
                  className="text-xs sm:text-sm pr-10"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
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