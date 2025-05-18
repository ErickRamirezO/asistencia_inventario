import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const Login = () => {
  const handleSubmit = (e) => {
    e.preventDefault();
    toast.success("Información", {
      description: "Funcionalidad de inicio de sesión en desarrollo.",
        // richColors: true,
    });
  };

  return (
    <section className="py-32">
      <div className="container">
        <div className="flex flex-col gap-4">
          <div className="mx-auto w-full max-w-sm rounded-md p-6 shadow">
            <div className="mb-6 flex flex-col items-center">
              <a href="/" className="mb-6 flex items-center gap-2">
                <img src="/logo.png" className="max-h-8" alt="Logo SmartControl" />
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
                />
                <div>
                  <Input
                    type="password"
                    placeholder="Ingrese su contraseña"
                    required
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