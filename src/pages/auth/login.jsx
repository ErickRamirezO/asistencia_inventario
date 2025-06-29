import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from 'react';
import { useNavigate, Link } from "react-router-dom";
import api from "@/utils/axios";
import { jwtDecode } from "jwt-decode";
import { useUser } from "../../utils/UserContext";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const Login = () => {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { setUser } = useUser();
  const [error, setError] = useState("");

  const roleBasedRedirects = {
    Administrador: "/verUsuarios",
    Usuario: "/asistencia",
    "Encargado de Bodega": "/bienes/inventario",
  };

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(""), 4000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Email:", email);
    console.log("Password:", password);
    try {
      const loginResponse = await api.post("/auth/login", { email, password });
      const token = loginResponse.data.token;
      localStorage.setItem("token", token);
      //decodificar el token para obtener el id del usuario
      const decoded = jwtDecode(token);
      try {
        const rolResponse = await api.get(`/usuarios/${decoded.userId}/rol`);
        // Actualizar el contexto con el rol
        const rol = rolResponse.data;
        setUser({ ...decoded, rol: rol });
        // Navegar después de actualizar el contexto
        const redirectPath = roleBasedRedirects[rol] || "/no-autorizado"; // Usa /no-autorizado si el rol no está en el mapa
        navigate(redirectPath); // O la ruta que corresponda
      } catch (error) {
        console.error("Error al obtener el rol:", error);
        // Manejar el error (mostrar un mensaje, etc.)
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "No se pudo iniciar sesión. Verifica tus credenciales."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="py-16 sm:py-32">
      <div className="container">
        <div className="flex flex-col gap-8">
          <div className="mx-auto w-full max-w-sm rounded-md p-8 sm:p-10 shadow">
            <div className="mb-6 flex flex-col items-center">
              <a href="/" className="mb-6 flex items-center gap-2">
                <img src="/logo.png" className="max-h-20" alt="Logo SmartControl" />
              </a>
              <p className="mb-2 text-base sm:text-4xl font-bold">Iniciar Sesión</p>
              <p className="text-xs sm:text-sm text-muted-foreground">Bienvenido de nuevo</p>
              {error && (
                <Alert variant="destructive">
                  <AlertDescription className="text-xs sm:text-sm">{error}</AlertDescription>
                </Alert>
              )}
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4">
                <Input 
                  type="email" 
                  placeholder="Ingrese su correo electrónico" 
                  required 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="text-xs sm:text-sm"
                />
                <div>
                  <Input
                    type="password"
                    placeholder="Ingrese su contraseña"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="text-xs sm:text-sm"
                  />
                </div>
                
                <div className="flex justify-between items-center gap-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="remember"
                      className="border-muted-foreground"
                    />
                    <label
                      htmlFor="remember"
                      className="text-xs sm:text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Recordarme
                    </label>
                  </div>
                  <Link to="/recuperar-contrasena" className="text-xs sm:text-sm text-primary hover:underline ml-2">
                    ¿Olvidó su contraseña?
                  </Link>
                </div>
                
                <Button type="submit" className="mt-2 w-full text-xs sm:text-sm">
                  Iniciar Sesión
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Login;