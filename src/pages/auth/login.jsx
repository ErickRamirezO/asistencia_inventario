import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import axios from "axios";
import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";

const Login = () => {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Redirigir si ya hay sesión activa
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/verUsuarios');
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Email:", email);
    console.log("Password:", password);
    try {
      const res = await axios.post("http://localhost:8002/api/auth/login", {
        email: email,
        password: password,
      });
      localStorage.setItem("token", res.data.token);
      navigate("/verUsuarios");
    } catch (err) {
      alert("Usuario o contraseña incorrectos", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="py-32">
      <div className="container">
        <div className="flex flex-col gap-4">
          <div className="mx-auto w-full max-w-sm rounded-md p-6 shadow">
            <div className="mb-6 flex flex-col items-center">
              <a href="/" className="mb-6 flex items-center gap-2">
                <img src="/logo.png" className="max-h-20" alt="Logo SmartControl" />
              </a>
              <h1 className="mb-2 text-2xl font-bold">Iniciar Sesión</h1>
              <p className="text-muted-foreground">Bienvenido de nuevo</p>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4">
                <Input 
                  type="email" 
                  placeholder="Ingrese su correo electrónico" 
                  required 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <div>
                  <Input
                    type="password"
                    placeholder="Ingrese su contraseña"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                
                <div className="flex justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="remember"
                      className="border-muted-foreground"
                    />
                    <label
                      htmlFor="remember"
                      className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Recordarme
                    </label>
                  </div>
                  <a href="#" className="text-sm text-primary hover:underline">
                    ¿Olvidó su contraseña?
                  </a>
                </div>
                
                <Button type="submit" className="mt-2 w-full">
                  Iniciar Sesión
                </Button>
              </div>
            </form>
            
            <div className="mx-auto mt-8 flex justify-center gap-1 text-sm text-muted-foreground">
              <p>¿No tiene una cuenta?</p>
              <a href="/registro" className="font-medium text-primary">
                Regístrese
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Login;