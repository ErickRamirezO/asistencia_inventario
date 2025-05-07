"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axios from "axios";

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

// Validación Zod
const FormSchema = z.object({
  nombreBien: z.string().min(2, { message: "Mínimo 2 caracteres." }),
  descripcion: z.string().min(2, { message: "Mínimo 2 caracteres." }),
  precio: z.coerce.number().positive({ message: "Debe ser un número positivo." }),
  status: z.coerce.number().int().min(0).max(1),
  tagInmueble: z.string().min(2),
  serieBien: z.string().min(2),
  modeloBien: z.string().min(2),
  marcaBien: z.string().min(2),
  materialBien: z.string().min(2),
  dimensionesBien: z.string().min(2),
  observacionBien: z.string().optional(),
  ubicacionBien: z.string().min(2),
  categoriaId: z.coerce.number().int(),
  tagRfidId: z.coerce.number().int(),
  departamentoId: z.coerce.number().int(),
});

export default function RegistrarBien() {
  const form = useForm({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      nombreBien: "",
      descripcion: "",
      precio: "",
      status: 1,
      tagInmueble: "",
      serieBien: "",
      modeloBien: "",
      marcaBien: "",
      materialBien: "",
      dimensionesBien: "",
      observacionBien: "",
      ubicacionBien: "",
      categoriaId: "",
      tagRfidId: "",
      departamentoId: "",
    },
  });

  const onSubmit = async (data) => {
    try {
      const response = await axios.post("http://localhost:8080/api/bienes-inmuebles", data);
      alert(`Bien registrado con ID: ${response.data}`);
      form.reset();
    } catch (error) {
      console.error("Error al registrar bien:", error);
      alert(" Ocurrió un error al registrar el bien.");
    }
  };

  return (
    <div className="p-12">


      <h1 className="text-2xl font-bold mb-6">Registrar Bien</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <FormField
            control={form.control}
            name="nombreBien"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre del Bien</FormLabel>
                <FormControl>
                  <Input placeholder="Ejemplo: Escritorio" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="descripcion"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Descripción</FormLabel>
                <FormControl>
                  <Input placeholder="Ejemplo: De madera color negro" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="precio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Precio</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="Ejemplo: 120.00" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Estado</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="1 para activo, 0 para inactivo" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="tagInmueble"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tag Interno</FormLabel>
                <FormControl>
                  <Input placeholder="Ejemplo: TAG001" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="serieBien"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Serie</FormLabel>
                <FormControl>
                  <Input placeholder="Ejemplo: SN123456" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="modeloBien"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Modelo</FormLabel>
                <FormControl>
                  <Input placeholder="Ejemplo: X300" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="marcaBien"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Marca</FormLabel>
                <FormControl>
                  <Input placeholder="Ejemplo: HP" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="materialBien"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Material</FormLabel>
                <FormControl>
                  <Input placeholder="Ejemplo: Acero inoxidable" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="dimensionesBien"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Dimensiones</FormLabel>
                <FormControl>
                  <Input placeholder="Ejemplo: 1.2m x 0.6m" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="observacionBien"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Observaciones</FormLabel>
                <FormControl>
                  <Input placeholder="Ejemplo: Leve desgaste" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="ubicacionBien"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ubicación</FormLabel>
                <FormControl>
                  <Input placeholder="Ejemplo: Oficina 101" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="categoriaId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>ID Categoría</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="Ejemplo: 1" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="tagRfidId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>ID Tag RFID</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="Ejemplo: 2" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="departamentoId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>ID Departamento</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="Ejemplo: 3" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

<div className="">
  <Button type="submit" className=" md:w-auto">
    Registrar Bien
  </Button>
</div>


        </form>
      </Form>
    </div>
  );
}
