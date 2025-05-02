"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const FormSchema = z.object({
  nombres: z.string().min(2, { message: "Los nombres deben tener al menos 2 caracteres." }),
  apellidos: z.string().min(2, { message: "Los apellidos deben tener al menos 2 caracteres." }),
  telefono: z
    .string()
    .regex(/^\d{10}$/, { message: "El teléfono debe tener 10 dígitos." }),
  cedula: z
    .string()
    .regex(/^\d{10}$/, { message: "La cédula debe tener 10 dígitos." }),
  correoElectronico: z
    .string()
    .email({ message: "Debe ser un correo electrónico válido." }),
  tarjetaRFID: z
    .string()
    .regex(/^[a-zA-Z0-9]{8,16}$/, { message: "La tarjeta RFID debe tener entre 8 y 16 caracteres." }),
  fechaNacimiento: z.string().nonempty({ message: "Debe seleccionar una fecha de nacimiento." }),
});

export default function RegistrarUsuario() {
  const form = useForm({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      nombres: "",
      apellidos: "",
      telefono: "",
      cedula: "",
      correoElectronico: "",
      tarjetaRFID: "",
      fechaNacimiento: "",
    },
  });

  function onSubmit(data) {
    console.log("Datos del usuario:", data);
    form.reset(); // Limpia el formulario después de enviar
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Registrar Usuario</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Campo de nombres */}
          <FormField
            control={form.control}
            name="nombres"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombres</FormLabel>
                <FormControl>
                  <Input placeholder="Ejemplo: Juan Carlos" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Campo de apellidos */}
          <FormField
            control={form.control}
            name="apellidos"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Apellidos</FormLabel>
                <FormControl>
                  <Input placeholder="Ejemplo: Pérez Gómez" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Campo de teléfono */}
          <FormField
            control={form.control}
            name="telefono"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Teléfono</FormLabel>
                <FormControl>
                  <Input placeholder="Ejemplo: 0987654321" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Campo de cédula */}
          <FormField
            control={form.control}
            name="cedula"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cédula</FormLabel>
                <FormControl>
                  <Input placeholder="Ejemplo: 1234567890" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Campo de correo electrónico */}
          <FormField
            control={form.control}
            name="correoElectronico"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Correo Electrónico</FormLabel>
                <FormControl>
                  <Input placeholder="Ejemplo: usuario@correo.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Campo de tarjeta RFID */}
          <FormField
            control={form.control}
            name="tarjetaRFID"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tarjeta RFID</FormLabel>
                <FormControl>
                  <Input placeholder="Ejemplo: ABCD1234" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Campo de fecha de nacimiento */}
          <FormField
            control={form.control}
            name="fechaNacimiento"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fecha de Nacimiento</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" variant="blue">
            Registrar Usuario
          </Button>
        </form>
      </Form>
    </div>
  );
}