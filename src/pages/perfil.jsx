import React, { useState, useEffect } from 'react';
import { jwtDecode } from "jwt-decode";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useForm } from "react-hook-form";
import api from "@/utils/axios";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from 'sonner';
import { Eye, EyeOff } from "lucide-react";

const nameRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñÜü\s]+$/;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&._\-]).{12,}$/;

const profileFormSchema = z.object({
  nombre: z.string()
    .min(2, { message: "El nombre debe tener al menos 2 caracteres." })
    .regex(nameRegex, { message: "El nombre solo debe contener letras y espacios." })
    .refine(val => !/<.*?>/.test(val), { message: "No se permiten etiquetas HTML." }),
  apellido: z.string()
    .min(2, { message: "El apellido debe tener al menos 2 caracteres." })
    .regex(nameRegex, { message: "El apellido solo debe contener letras y espacios." })
    .refine(val => !/<.*?>/.test(val), { message: "No se permiten etiquetas HTML." }),
  email: z.string().email({
    message: "Por favor, introduce un correo electrónico válido.",
  }),
  password: z.string()
    .regex(passwordRegex, {
      message: "La contraseña debe tener al menos 12 caracteres, una mayúscula, una minúscula, un número y un carácter especial.",
    })
    .optional()
    .or(z.literal("")),
  confirmPassword: z.string()
    .optional()
    .or(z.literal("")),
}).refine((data) => {
  if (data.password || data.confirmPassword) {
    return data.password === data.confirmPassword;
  }
  return true;
}, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

const ProfilePage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false); 
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); 

  const form = useForm({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      nombre: '',
      apellido: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    mode: "onChange", 
    reValidateMode: "onChange", 
  });

  const { handleSubmit, setValue, watch } = form;

    const password = watch("password");
    const confirmPassword = watch("confirmPassword");
    const showPasswordMatch = password && confirmPassword;
    const passwordsMatch = password === confirmPassword && password.length > 0;

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        const userId = decodedToken.userId;

        const fetchUserData = async () => {
          setLoading(true);
          try {
            const response = await api.get(`/usuarios/${userId}`);
            const data = response.data;

            setValue("nombre", data.nombre);
            setValue("apellido", data.apellido);
            setValue("email", data.email);
          } catch (e) {
            setError(e.response?.data?.message || e.message);
          } finally {
            setLoading(false);
          }
        };

        fetchUserData();
      } catch (e) {
        setError("Invalid token");
        setLoading(false);
        console.error("Error decoding token:", e);
      }
    } else {
      console.warn('No token found');
      setLoading(false);
    }
  }, [setValue]);

  const onSubmit = async (values) => {
    const token = localStorage.getItem('token');
    try {
      const decodedToken = jwtDecode(token);
      const userId = decodedToken.userId;

      const updateData = {
        nombre: values.nombre,
        apellido: values.apellido,
        email: values.email,
      };

      if (values.password) {
        updateData.password = values.password;
      }

      try {
        await api.patch(`/usuarios/${userId}`, updateData); 
        toast.success('Perfil actualizado correctamente',{
            richColors: true
        });
      } catch (err) {
        toast.error('Error al actualizar el perfil',{
            richColors: true
        })
        setError(err.response?.data?.message || err.message);
      }
    } catch (e) {
      setError("Invalid token");
      console.error("Error decoding token:", e);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-4rem)] py-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">Editar Perfil</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="nombre"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs md:text-[13px] sm:text-sm">Nombre</FormLabel>
                    <FormControl>
                      <Input className="text-xs md:text-[13px] sm:text-sm" placeholder="Nombre" {...field} />
                    </FormControl>
                    <FormMessage className="text-xs md:text-[13px] sm:text-sm" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="apellido"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs md:text-[13px] sm:text-sm">Apellido</FormLabel>
                    <FormControl>
                      <Input className="text-xs md:text-[13px] sm:text-sm" placeholder="Apellido" {...field} />
                    </FormControl>
                    <FormMessage className="text-xs md:text-[13px] sm:text-sm" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs md:text-[13px] sm:text-sm">Correo</FormLabel>
                    <FormControl>
                      <Input className="text-xs md:text-[13px] sm:text-sm" placeholder="Correo" type="email" {...field} />
                    </FormControl>
                    <FormMessage className="text-xs md:text-[13px] sm:text-sm" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs md:text-[13px] sm:text-sm">Nueva Contraseña</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          className="text-xs md:text-[13px] sm:text-sm pr-10"
                          placeholder="Nueva Contraseña"
                          type={showPassword ? "text" : "password"}
                          {...field}
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
                    </FormControl>
                    <span className="text-[11px] text-muted-foreground">
                      Mínimo 12 caracteres, una mayúscula, una minúscula, un número y un carácter especial.
                    </span>
                    <FormMessage className="text-xs md:text-[13px] sm:text-sm" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs md:text-[13px] sm:text-sm">Confirmar Contraseña</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          className="text-xs md:text-[13px] sm:text-sm pr-10"
                          placeholder="Confirmar Contraseña"
                          type={showConfirmPassword ? "text" : "password"}
                          {...field}
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
                    </FormControl>
                  </FormItem>
                )}
              />
              {/* Mensaje en tiempo real */}
              {showPasswordMatch && (
                <p className={`text-xs md:text-[13px] sm:text-sm ${passwordsMatch ? "text-green-500" : "text-red-500"}`}>
                  {passwordsMatch ? "Las contraseñas coinciden" : "Las contraseñas no coinciden"}
                </p>
              )}
              <Button type="submit" variant="blue" className="text-xs md:text-[13px] sm:text-sm">Actualizar Datos</Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfilePage;